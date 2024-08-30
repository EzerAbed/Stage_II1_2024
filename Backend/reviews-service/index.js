const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

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
    console.log(`Review service running on port ${PORT}`);
});

//create a review
app.post('/reviews', (req, res) => {
    const { user_id, product_id, rating, comment } = req.body;

    const query = 'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)';
    db.query(query, [user_id, product_id, rating, comment], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error creating review');
        } else {
            res.status(201).send('Review created successfully');
        }
    });
})

//get all reviews for a product
app.get('/reviews/:product_id', (req, res) => {
    const { product_id } = req.params;

    const query = 'SELECT * FROM reviews WHERE product_id = ?';
    db.query(query, [product_id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving reviews');
        }else if (results.affectedRows === 0) {
            res.status(404).json({ message : 'No found reviews for this product' })
        } else {
            res.json(results);
        }
    });
})

//get all reviews given by a specific user
app.get('/reviews/user/:user_id', (req, res) => {
    const { user_id } = req.params;

    const query = 'SELECT * FROM reviews WHERE user_id = ?';
    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving reviews');
        } else if (results.affectedRows === 0) {
            res.status(404).json({ message : 'No found reviews of this user' })
        } else {
            res.json(results);
        }
    });
})

//get all the reviews
app.get('/reviews', (req, res) => {
    const query = 'SELECT * FROM reviews';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving reviews');
        } else {
            res.json(results);
        }
    });
})

//update a review
app.put('/reviews/:review_id', (req, res) => {
    const { review_id } = req.params;
    const { user_id, product_id, rating, comment } = req.body;

    const query = 'UPDATE reviews SET user_id = ?, product_id = ?, rating = ?, comment = ? WHERE id = ?';
    db.query(query, [user_id, product_id, rating, comment, review_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating review');
        }else if (result.affectedRows === 0) {
            res.status(404).json({ message : 'No review found with the given id' + review_id });
        } else {
            res.status(200).send('Review updated successfully');
        }
    });
})

//delete a review
app.delete('/reviews/:review_id', (req, res) => {
    const { review_id } = req.params;

    const query = 'DELETE FROM reviews WHERE id = ?';
    db.query(query, [review_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting review');
        }else if (result.affectedRows === 0) {
            res.status(404).json({ message : 'No review found with the given id' + review_id });
        } else {
            res.status(200).send('Review deleted successfully');
        }
    });
})