const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors("*"));

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});
const upload = multer({ storage: storage });

// MySQL connection
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

// Create 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Define routes

// Add a product with multiple images
app.post('/products', upload.array('photos', 5), (req, res) => {
    console.log('Request Body:', req.body);
    console.log('Files:', req.files);

    const { name, price, description, stock, category_id, subcategory_id } = req.body;

    if (!name) {
        return res.status(400).json({ error: "The 'name' field is required." });
    }

    const checkSubcategoryQuery = 'SELECT id FROM subcategory WHERE id = ?';
    db.query(checkSubcategoryQuery, [subcategory_id], (err, results) => {
        if (err) {
            console.error('Error checking subcategory:', err);
            return res.status(500).json({ error: 'Failed to check subcategory' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid subcategory_id' });
        }

        const productQuery = 'INSERT INTO product (name, price, description, stock, category_id, subcategory_id) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(productQuery, [name, price, description, stock, category_id, subcategory_id], (err, result) => {
            if (err) {
                console.error('Error creating product:', err);
                return res.status(500).json({ error: 'Failed to create product' });
            }

            const productId = result.insertId;
            const imageQueries = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const imageQuery = 'INSERT INTO product_image (product_id, image_path, isprimary) VALUES (?, ?, ?)';
                    db.query(imageQuery, [productId, file.path, false], (err, result) => {
                        if (err) {
                            console.error('Error saving image:', err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            });

            Promise.all(imageQueries)
                .then(() => res.status(201).json({ id: productId, name, price, description, stock, category_id, subcategory_id }))
                .catch(err => res.status(500).json({ error: 'Failed to save images' }));
        });
    });
});


// Get all products with category and subcategory names
app.get('/products', (req, res) => {
    const query = `
        SELECT p.*, 
               c.name AS category_name, 
               s.name AS subcategory_name 
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        LEFT JOIN subcategory s ON p.subcategory_id = s.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving products:', err);
            res.status(500).json({ error: 'Failed to retrieve products' });
        } else {
            res.json(results);
        }
    });
});


// Get a single product by ID
app.get('/products/:id', (req, res) => {
    const query = 'SELECT * FROM product WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error retrieving product:', err);
            res.status(500).json({ error: 'Failed to retrieve product' });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.json(result[0]);
        }
    });
});

// Get all images for a product by product ID
app.get('/products/:id/images', (req, res) => {
    const query = 'SELECT * FROM product_image WHERE product_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error retrieving images:', err);
            return res.status(500).json({ error: 'Failed to retrieve images' });
        }
        res.json(results);
    });
});

// Get primary image for a product by ID
app.get('/products/:id/primary-image', (req, res) => {
    const query = 'SELECT * FROM product_image WHERE product_id =? AND isprimary = true';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error retrieving primary image:', err);
            return res.status(500).json({ error: 'Failed to retrieve primary image' });
        } else if (result.length === 0) {
            return res.status(404).json({ message: 'Primary image not found' });
        } else {
            res.json(result[0]);
        }
    });
});

// Update a product by ID
app.put('/products/:id', (req, res) => {
    console.log('Request Body:', req.body);

    const { id } = req.params;
    const { name, price, description, stock, category_id, subcategory_id } = req.body;

    if (!name) {
        return res.status(400).json({ error: "The 'name' field is required." });
    }

    const productQuery = 'UPDATE product SET name = ?, price = ?, description = ?, stock = ?, category_id = ?, subcategory_id = ? WHERE id = ?';
    db.query(productQuery, [name, price, description, stock, category_id, subcategory_id, id], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: 'Failed to update product' });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        } else {
            return res.status(200).json({ id, name, price, description, stock, category_id, subcategory_id });
        }
    });
});


//update stock
app.put('/products/:id/stock', (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    if (!stock) {
        return res.status(400).json({ error: "The'stock' field is required." });
    }

    const query = 'UPDATE product SET stock = ? WHERE id = ?';
    db.query(query, [stock, id], (err, result) => {
        if (err) {
            console.error('Error updating stock:', err);
            return res.status(500).json({ error: 'Failed to update stock' });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json({ id, stock });
        }
    }
    )
})

// Delete a product by ID
app.delete('/products/:id', (req, res) => {
    const query = 'DELETE FROM product WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            res.status(500).json({ error: 'Failed to delete product' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(204).send();
        }
    });
});

// Delete a product image by image ID
app.delete('/images/:id', (req, res) => {
    const query = 'DELETE FROM product_image WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting image:', err);
            return res.status(500).json({ error: 'Failed to delete image' });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Image not found' });
        } else {
            return res.status(204).send();
        }
    });
});

// Create a promotion
app.post('/promotions', (req, res) => {
    const { code, description, type, valeur, date_debut, date_fin } = req.body;

    const query = 'INSERT INTO promotions (code, description, type, valeur, date_debut, date_fin) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [code, description, type, valeur, date_debut, date_fin], (err, result) => {
        if (err) {
            console.error('Error creating promotion:', err);
            return res.status(500).json({ error: 'Failed to create promotion' });
        }
        res.status(201).json({ id: result.insertId, code, description, type, valeur, date_debut, date_fin });
    });
});

// Get all promotions
app.get('/promotions', (req, res) => {
    const query = 'SELECT * FROM promotions';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving promotions:', err);
            return res.status(500).json({ error: 'Failed to retrieve promotions' });
        }
        res.json(results);
    });
});

// Get a single promotion by ID
app.get('/promotions/:id', (req, res) => {
    const query = 'SELECT * FROM promotions WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error retrieving promotion:', err);
            return res.status(500).json({ error: 'Failed to retrieve promotion' });
        } else if (result.length === 0) {
            return res.status(404).json({ message: 'Promotion not found' });
        } else {
            return res.json(result[0]);
        }
    });
});

// Update a promotion by ID
app.put('/promotions/:id', (req, res) => {
    const { id } = req.params;
    const { code, description, type, valeur, date_debut, date_fin } = req.body;

    const query = 'UPDATE promotions SET code = ?, description = ?, type = ?, valeur = ?, date_debut = ?, date_fin = ? WHERE id = ?';
    db.query(query, [code, description, type, valeur, date_debut, date_fin, id], (err, result) => {
        if (err) {
            console.error('Error updating promotion:', err);
            return res.status(500).json({ error: 'Failed to update promotion' });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Promotion not found' });
        } else {
            return res.status(200).json({ id, code, description, type, valeur, date_debut, date_fin });
        }
    });
});

// Delete a promotion by ID
app.delete('/promotions/:id', (req, res) => {
    const query = 'DELETE FROM promotions WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting promotion:', err);
            return res.status(500).json({ error: 'Failed to delete promotion' });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Promotion not found' });
        } else {
            return res.status(204).send();
        }
    });
});

// Assign a promotion to a product
app.post('/product_promotion', (req, res) => {
    const { product_id, promotion_id } = req.body;

    const query = 'INSERT INTO product_promotion (product_id, promotion_id) VALUES (?, ?)';
    db.query(query, [product_id, promotion_id], (err, result) => {
        if (err) {
            console.error('Error assigning promotion to product:', err);
            return res.status(500).json({ error: 'Failed to assign promotion to product' });
        }
        return res.status(201).json({ id: result.insertId, product_id, promotion_id });
    });
});

// get all products with promotion 
app.get('/products-with-promotion', (req, res) => {
    const querry = 'SELECT * FROM product_promotion'
    db.query(querry, (err, result) => {
        if (err) {
            console.error('Error retrieving products with promotion:', err);
            return res.status(500).json({ error: 'Failed to retrieve products with promotion' });
        }
        res.json(result)
    })
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
