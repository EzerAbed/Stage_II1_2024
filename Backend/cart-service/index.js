const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors("*"));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database : ', err) ;
        return ;
    }

    console.log('Connected to the MySQL database.')
})

app.listen(PORT, () => {
    console.log(`Cart service running on port ${PORT}`);
});

//Create a new cart 
app.post('/cart', (req, res) => {
    const { user_id } = req.body;
    const query = `INSERT INTO cart (user_id) VALUES (?)`;
    db.query(query, [user_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        } else {
            res.status(201).send({ cart_id: result.insertId, user_id });
        }
    });
})

// Get all carts
app.get('/carts', (req, res) => {
    const query = 'SELECT * FROM cart'
    db.query(query, (err, result) => {
        if (err) {
            console.error('error retrieving the carts : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.json(result)
        }
    })
})

// Get a cart by ID
app.get('/carts/:id', (req, res) => {
    const query = 'SELECT * FROM cart WHERE id =?'
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('error retrieving the cart : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.length === 0) {
            res.status(404).json({ message : 'Cart not found' })
        } else {
            res.json(result[0])
        }
    })
})

//Get a cart of a specific user
app.get('/cart/user/:user_id', (req, res) => {
    const query = 'SELECT * FROM cart WHERE user_id =?'
    db.query(query, [req.params.user_id], (err, result) => {
        if (err) {
            console.error('error retrieving the carts : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.length === 0) {
            res.status(404).json({ message : 'Cart not found for this user' })
        } else {
            res.json(result[0])
        }
    })
})

//delete cart by id
app.delete('/cart/:id', (req, res) => {
    const query = 'DELETE FROM cart WHERE id =?'
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('error deleting the cart : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message : 'Cart not found' })
        } else {
            res.status(204).send()
        }
    })
})

//add item to cart
app.post('/cart/:id/items', (req, res) => {
    const { product_id, quantity, unit_price } = req.body;
    const cartId = req.params.id;
    const query = 'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
    db.query(query, [cartId, product_id, quantity, unit_price], (err, result) => {
        if (err) {
            console.error('error adding item to cart : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.status(201).json({id : result.insertId ,cart_id : cartId, product : product_id, Quantity : quantity, Uprice : unit_price})
        }
    })
})

//get items in a cart
app.get('/cart/:id/items', (req, res) => {
    const cartId = req.params.id;
    const query = 'SELECT * FROM cart_items WHERE cart_id =?'
    db.query(query, [cartId], (err, result) => {
        if (err) {
            console.error('error retrieving items from cart : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.json(result)
        }
    })
})

//Count the number of items in the cart
app.get('/cart/:id/items/count', (req, res) => {
    const cartId = req.params.id;
    const query = 'SELECT SUM(quantity) as count FROM cart_items WHERE cart_id =?'
    db.query(query, [cartId], (err, result) => {
        if (err) {
            console.error('error counting items in cart : ', err)
            res.status(500).json({ message : err.message })
        } else {
            res.json(result[0])
        }
    })
})

//update quantity of an item in a cart
app.put('/cart/:id/items/:item_id', (req, res) => {
    const { quantity } = req.body;
    const cartId = req.params.id;
    const itemId = req.params.item_id;
    const query = 'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?'
    db.query(query, [quantity, cartId, itemId], (err, result) => {
        if (err) {
            console.error('error updating item quantity in cart : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message : 'Item not found in the cart' })
        } else {
            res.status(200).json({cartId, itemId, quantity})
        }
    })
})

//delete an item from a cart
app.delete('/cart/:id/items/:item_id', (req, res) => {
    const cartId = req.params.id;
    const itemId = req.params.item_id;
    const query = 'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?'
    db.query(query, [cartId, itemId], (err, result) => {
        if (err) {
            console.error('error deleting item from cart : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message : 'Item not found in the cart' })
        } else {
            res.status(204).send()
        }
    })
})

//clear a cart 
app.delete('/cart/:id/items', (req, res) => {
    const cartId = req.params.id;
    const query = 'DELETE FROM cart_items WHERE cart_id = ?'
    db.query(query, [cartId], (err, result) => {
        if (err) {
            console.error('error deleting all items from cart : ', err)
            res.status(500).json({ message : err.message })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message : 'Cart not found or no items in the cart' })
        } else {
            res.status(204).send()
        }
    })
})