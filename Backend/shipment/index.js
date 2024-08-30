const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3015;

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
    console.log(`Shipment service running on port ${PORT}`);
});

// Create a new transporter
app.post('/shipment/transporter', (req, res) => {
    const { name, phone_number, address, email } = req.body;
    const sql = `INSERT INTO transporter (name, phone_number, address, email) VALUES (?,?,?,?)`;
    db.query(sql, [name, phone_number, address, email], (err, result) => {
        if (err) throw err;
        res.send(`New transporter added with id: ${result.insertId}`);
    });
});

// Get all transporters
app.get('/shipment/transporters', (req, res) => {
    const sql = 'SELECT * FROM transporter';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Get transporter by id
app.get('/shipment/transporters/:id', (req, res) => {
    const sql = 'SELECT * FROM transporter WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.status(404).json({ message: 'Transporter not found' });
        }
        res.json(result[0]);
    });
});

// Update transporter by id
app.put('/shipment/transporters/:id', (req, res) => {
    const { name, phone_number, address, email } = req.body;
    const sql = 'UPDATE transporter SET name = ?, phone_number = ?, address = ?, email = ? WHERE id = ?';
    db.query(sql, [name, phone_number, address, email, req.params.id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Transporter not found' });
        }
        res.json({ message: 'Transporter updated successfully' });
    });
});

// Delete transporter by id
app.delete('/shipment/transporters/:id', (req, res) => {
    const sql = 'DELETE FROM transporter WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Transporter not found' });
        }
        res.json({ message: 'Transporter deleted successfully' });
    });
});

// Create a new shipment
app.post('/shipment', (req, res) => {
    const { user_id, transporter_id, order_id, address_id, shipment_date, estimated_delivery_date, status } = req.body;
    const sql = `INSERT INTO shipment (user_id, transporter_id, order_id, address_id, shipment_date, estimated_delivery_date, status) VALUES (?,?,?,?,?,?,?)`;
    db.query(sql, [user_id, transporter_id, order_id, address_id, shipment_date, estimated_delivery_date, status], (err, result) => {
        if (err) throw err;
        res.send(`New shipment added with id: ${result.insertId}`);
    });
});

// Get all shipments
app.get('/shipment', (req, res) => {
    const sql = 'SELECT * FROM shipment';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Get shipment by id
app.get('/shipment/:id', (req, res) => {
    const sql = 'SELECT * FROM shipment WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        res.json(result[0]);
    });
});

// Get Shipment by order id
app.get('/shipments/order/:order_id' ,(req, res) => {
    const sql = 'SELECT * FROM shipment WHERE order_id =?';
    db.query(sql, [req.params.order_id], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.status(404).json({ message: 'No shipments found for this order' });
        }
        res.json(result);
    });
})

// Update shipment by id
app.put('/shipment/:id', (req, res) => {
    const { user_id, transporter_id, order_id, address_id, shipment_date, estimated_delivery_date, status } = req.body;
    const sql = 'UPDATE shipment SET user_id = ?, transporter_id = ?, order_id = ?, address_id = ?, shipment_date = ?, estimated_delivery_date = ?, status = ? WHERE id = ?';
    db.query(sql, [user_id, transporter_id, order_id, address_id, shipment_date, estimated_delivery_date, status, req.params.id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        res.json({ message: 'Shipment updated successfully' });
    });
});

// Delete shipment by id
app.delete('/shipment/:id', (req, res) => {
    const sql = 'DELETE FROM shipment WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        res.json({ message: 'Shipment deleted successfully' });
    });
});
