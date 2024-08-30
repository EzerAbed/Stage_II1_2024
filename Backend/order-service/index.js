const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors("*"));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
});

//create an order
app.post('/orders', (req, res) => {
    const { user_id, total_amount } = req.body;

    const sql = `INSERT INTO orders (user_id, total_amount) VALUES (?, ?)`;
    db.query(sql, [user_id, total_amount], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        } else {
            res.status(201).send({id : result.insertId});
        }
    });
})

//get all orders of a specific user
app.get('/orders/user/:user_id', (req, res) => {
    const query = 'SELECT * FROM orders WHERE user_id =?'
    db.query(query, [req.params.user_id], (err, result) => {
        if (err) {
            console.error('error retrieving orders : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.length === 0) {
            res.status(404).json({ message : 'No orders found for this user' })
        } else {
            res.json(result)
        }
    })
})

//get a specific order by ID
app.get('/orders/:order_id', (req, res) => {
    const query = 'SELECT * FROM orders WHERE id =?'
    db.query(query, [req.params.order_id], (err, result) => {
        if (err) {
            console.error('error retrieving order : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.length === 0) {
            res.status(404).json({ message : 'Order not found' })
        } else {
            res.json(result[0])
        }
    })
})

//get all orders
app.get('/orders', (req, res) =>{
    const query = 'SELECT * FROM orders'
    db.query(query, (err, result) => {
        if (err) {
            console.error('error retrieving orders : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.json(result)
        }
    })
})

//update an order
app.put('/orders/:order_id', (req, res) => {
    const { user_id, total_amount } = req.body;
    const query = 'UPDATE orders SET user_id = ?, total_amount = ? WHERE id = ?';
    db.query(query, [user_id, total_amount, req.params.order_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        } else {
            res.status(200).send('Order updated successfully');
        }
    });
})

//delete an order by ID
app.delete('/orders/:order_id', (req, res) => {
    const query = 'DELETE FROM orders WHERE id = ?';
    db.query(query, [req.params.order_id], (err, result) => {
        if (err) {
            console.error('Error deleting order:', err);
            res.status(500).json({ error: 'Failed to delete order' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Order not found' });
        } else {
            res.status(204).send();
        }
    });
})

//create the order_items
app.post('/orders/:order_id/items', (req, res) => {
    const { product_id, quantity, unit_price } = req.body;
    const query = 'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'

    db.query(query, [req.params.order_id, product_id, quantity, unit_price], (err, result) => {
        if (err) {
            console.error('error creating order_items : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.status(201).json({ message : 'Order_items created successfully' })
        }
    })
})

//get all order_items of a specific order
app.get('/orders/:order_id/items', (req, res) => {
    const query = 'SELECT * FROM order_items WHERE order_id =?'
    db.query(query, [req.params.order_id], (err, result) => {
        if (err) {
            console.error('error retrieving order_items : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.length === 0) {
            res.status(404).json({ message : 'No order_items found for this order' })
        } else {
            res.json(result)
        }
    })
})

//Delete order_items by ID
app.delete('/order_items/:id', (req, res) => {
    const query = 'DELETE FROM order_items WHERE id =?'
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting order_items:', err);
            res.status(500).json({ error: 'Failed to delete order_items' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Order_items not found' });
        } else {
            res.status(204).send();
        }
    });
})

//create a payment
app.post('/payment', (req, res) => {
    const { order_id, payment_methode } = req.body;
    const query = 'INSERT INTO payment (order_id, payment_methode) VALUES (?,?)'
    db.query(query, [order_id, payment_methode], (err, result) => {
        if (err) {
            console.error('error creating payment : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.status(201).json({ message : 'Payment created successfully' })
        }
    })
})

//get all payments
app.get('/payment', (req, res) => {
    const query = 'SELECT * FROM payment'
    db.query(query, (err, result) => {
        if (err) {
            console.error('error retrieving payments : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.json(result)
        }
    })
})

//get a specific payment by ID
app.get('/payment/:payment_id', (req, res) => {
    const query = 'SELECT * FROM payment WHERE id =?'
    db.query(query, [req.params.payment_id], (err, result) => {
        if (err) {
            console.error('error retrieving payment : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.length === 0) {
            res.status(404).json({ message : 'Payment not found' })
        } else {
            res.json(result[0])
        }
    })
})

//update a payment status
app.put('/payment/:payment_id/update/status', (req, res) => {
    const { status } = req.body;
    const paymentId = req.params.payment_id
    const query = 'UPDATE payment SET status =? WHERE id =?'
    db.query(query, [status, paymentId], (err, result) => {
        if (err) {
            console.error('error updating payment status : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.status(200).json({ message : 'Payment status updated successfully' })
        }
    })
})

//update payment methode
app.put('/payment/:payment_id/update/methode', (req, res,)=>{
    const { payment_methode } = req.body;
    const paymentId = req.params.payment_id
    const query = 'UPDATE payment SET payment_methode =? WHERE id =?'
    db.query(query, [payment_methode, paymentId], (err, result) => {
        if (err) {
            console.error('error updating payment methode : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.status(200).json({ message : 'Payment methode updated successfully' })
        }
    })
})

//delete a payment by ID
app.delete('/payment/:payment_id', (req, res) => {
    const paymentId = req.params.payment_id
    const query = 'DELETE FROM payment WHERE id =?'
    db.query(query, [paymentId], (err, result) => {
        if (err) {
            console.error('Error deleting payment:', err);
            res.status(500).json({ error: 'Failed to delete payment' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Payment not found' });
        } else {
            res.status(204).send();
        }
    });
})