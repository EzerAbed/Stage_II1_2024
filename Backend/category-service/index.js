const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

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
    console.log(`Category service running on port ${PORT}`);
});

//create a new category
app.post('/categories', (req, res) => {
    const { name } = req.body
    console.log('creation of a new category named : ', name ) //Debugging purposes

    try{
        const query = 'INSERT INTO category (name) VALUES (?)'
        db.query(query, [name], (err, result) => {
            if (err){
                console.error('Error creating category : ', err)
                res.status(500).json({ message: 'Failed to create category.' })
            } else{
                res.status(201).json({ id: result.insertId, name })
            }
        })
    }catch(err){
        res.status(500).json({ message : err.message })
    }
})

//get all categories
app.get('/categories', (req, res) => {
    const query = 'SELECT * FROM category'
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving categories : ', err)
            res.status(500).json({ message: 'Failed to retrieve categories.' })
        } else {
            res.json(results)
        }
    })
})

//get a single category by id
app.get('/categories/:id', (req, res) => {
    const query = 'SELECT * FROM category WHERE id =?'
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error retrieving category : ', err)
            res.status(500).json({ message: 'Failed to retrieve category.' })
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Category not found.' })
        } else {
            res.json(result[0])
        }
    })
})

//update a category by id
app.put('/categories/:id', (req, res) => {
    const { name } = req.body
    const query = 'UPDATE category SET name = ? WHERE id = ?'
    db.query(query, [name, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating category : ', err)
            res.status(500).json({ message: 'Failed to update category.' })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Category not found.' })
        } else {
            res.json({ message: 'Category updated successfully.' })
        }
    })
})

//delete a category by id
app.delete('/categories/:id', (req, res) => {
    const query = 'DELETE FROM category WHERE id = ?'
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting category : ', err)
            res.status(500).json({ message: 'Failed to delete category.' })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Category not found.' })
        } else {
            res.json({ message: 'Category deleted successfully.' })
        }
    })
})

//create a sub-category 
app.post('/sub_category', (req, res) => {
    const { name, category_id} = req.body
    console.log('creation of a new sub-category named : ', name, 'with parent id : ', category_id ) //Debugging purposes

    try{
        const query = 'INSERT INTO subcategory (name, category_id) VALUES (?, ?)'

        db.query(query, [name, category_id], (err, result) => {
            if (err){
                console.error('Error creating sub-category : ', err)
                res.status(500).json({ message: 'Failed to create sub-category.' })
            } else{
                res.status(201).json({ id: result.insertId, name, category_id })
            }
        })
    }catch(err){
        res.status(500).json({ message: err.message })
    }
})

//get all sub-categories
app.get('/sub_categories', (req, res) => {
    const query = 'SELECT * FROM subcategory'
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving sub-categories : ', err)
            res.status(500).json({ message: 'Failed to retrieve sub-categories.' })
        } else {
            res.json(results)
        }
    })
})

//get all sub-categories of a specific category
app.get('/sub_categories/category/:parent_id', (req, res) => {
    const query = 'SELECT * FROM subcategory WHERE category_id =?'
    db.query(query, [req.params.parent_id], (err, results) => {
        if (err) {
            console.error('Error retrieving sub-categories : ', err)
            res.status(500).json({ message: 'Failed to retrieve sub-categories.' })
        } else {
            res.json(results)
        }
    })
})

//get a single sub-category by id
app.get('/sub_categories/:id', (req, res) => {
    const query = 'SELECT * FROM subcategory WHERE id =?'
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error retrieving sub-category : ', err)
            res.status(500).json({ message: 'Failed to retrieve sub-category.' })
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Sub-category not found.' })
        } else {
            res.json(result[0])
        }
    })
})

//update a sub-category by id
app.put('/sub_categories/:id', (req, res) => {
    const { name, category_id } = req.body
    const query = 'UPDATE subcategory SET name = ?, category_id = ? WHERE id = ?'
    db.query(query, [name, category_id, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating sub-category : ', err)
            res.status(500).json({ message: 'Failed to update sub-category.' })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Sub-category not found.' })
        } else {
            res.json({ message: 'Sub-category updated successfully.' })
        }
    })
})

//delete a sub-category by id
app.delete('/sub_categories/:id', (req, res) => {
    const query = 'DELETE FROM subcategory WHERE id = ?'
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting sub-category : ', err)
            res.status(500).json({ message: 'Failed to delete sub-category.' })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Sub-category not found.' })
        } else {
            res.json({ message: 'Sub-category deleted successfully.' })
        }
    })
})