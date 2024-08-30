const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173'], 
    credentials: true, 
  }));
app.options('*', cors());

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.options('*', cors());

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
    console.log(`User service running on port ${PORT}`);
});

// Create a new user
app.post('/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error creating user:', err);
                res.status(500).json({ error: err });
            } else {
                res.status(201).json({ id: result.insertId, username, email });
            }
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Failed to hash password' });
    }
});

// Sign in endpoint
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error retrieving user:', err);
            return res.status(500).json({ message: 'Failed to retrieve user' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        try {
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.username},
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000,
            });

            res.json({ user_id: user.id });
        } catch (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).json({ error: 'Failed to compare passwords' });
        }
    });
});

// Sign out endpoint
app.post('/signout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Signed out successfully' });
});

// Get all users
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving users:', err);
            res.status(500).json({ error: 'Failed to retrieve users' });
        } else {
            res.json(results);
        }
    });
});

// Get a single user by ID
app.get('/users/:id', (req, res) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error retrieving user:', err);
            res.status(500).json({ error: 'Failed to retrieve user' });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(result[0]);
        }
    });
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
    const { username, email } = req.body;
    try {
        const query = 'UPDATE users SET username = ?, email = ?, WHERE id = ?';
        db.query(query, [username, email, req.params.id], (err, result) => {
            if (err) {
                console.error('Error updating user:', err);
                res.status(500).json({ error: 'Failed to update user' });
            } else if (result.affectedRows === 0) {
                res.status(404).json({ message: 'User not found' });
            } else {
                res.json({ id: req.params.id, username, email });
            }
        });
    }catch(err){
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete a user by ID
app.delete('/users/:id', (req, res) => {
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ error: 'Failed to delete user' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(204).send();
        }
    });
});

// Create a new role
app.post('/roles', (req, res) => {
    const { role } = req.body;
    const query = 'INSERT INTO role (name) VALUES (?)';
    db.query(query, [role], (err, result) => {
        if (err) {
            console.error('Error creating role:', err);
            res.status(500).json({ error: err.message});
        } else {
            res.status(201).json({ id: result.insertId, role });
        }
    });
});

// Get all roles
app.get('/roles', (req, res) => {
    const query = 'SELECT * FROM role';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving roles:', err);
            res.status(500).json({ error: 'Failed to retrieve roles' });
        } else {
            res.json(results);
        }
    });
});

//get a role by ID
app.get('/roles/:id', (req, res) => {
    const query = 'SELECT * FROM role WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error retrieving role:', err);
            res.status(500).json({ error: 'Failed to retrieve role' });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Role not found' });
        } else {
            res.json(result[0]);
        }
    });
});

// Assign role to user
app.post('/user_roles', (req, res) => {
    const { user_id, role_id } = req.body;
    const query = 'INSERT INTO user_role (user_id, role_id) VALUES (?, ?)';
    db.query(query, [user_id, role_id], (err, result) => {
        if (err) {
            console.error('Error assigning role to user:', err);
            res.status(500).json({ error: 'Failed to assign role to user' });
        } else {
            res.status(201).json({ id: result.insertId, user_id, role_id });
        }
    });
});

// Get all user roles
app.get('/user_roles', (req, res) => {
    const query = 'SELECT * FROM user_role';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving user roles:', err);
            res.status(500).json({ error: 'Failed to retrieve user roles' });
        } else {
            res.json(results);
        }
    });
});

// Get user roles by user ID
app.get('/user_roles/:user_id', (req, res) => {
    const query = 'SELECT * FROM user_role WHERE user_id = ?';
    db.query(query, [req.params.user_id], (err, results) => {
        if (err) {
            console.error('Error retrieving user roles:', err);
            res.status(500).json({ error: 'Failed to retrieve user roles' });
        } else {
            res.json(results);
        }
    });
});

//update a user role 
app.put('/user_roles/:user_id/:role_id', (req, res) => {
    const { role_id } = req.body;
    const query = 'UPDATE user_role SET role_id = ? WHERE user_id = ? AND role_id = ?';
    db.query(query, [role_id, req.params.user_id, req.params.role_id], (err, result) => {
        if (err) {
            console.error('Error updating user role:', err);
            res.status(500).json({ error: 'Failed to update user role' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User role not found' });
        } else {
            res.json({ user_id: req.params.user_id, role_id: req.params.role_id });
        }
    })
})

// Verify token middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

// Exemple d'endpoint protégé
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

//Add an address to a user
app.post('/user/:id/address', (req, res) => {
    const { address } = req.body
    const query = 'INSERT INTO address (user_id, address) VALUES (?,?)'
    db.query(query, [req.params.id, address], (err, result) => {
        if (err) {
            console.error('Error adding address:', err)
            res.status(500).json({ error: 'Failed to add address' })
        } else {
            res.status(201).json({ id: result.insertId, user_id: req.params.id, address })
        }
    })
})

// Get all addresses for a user

app.get('/user/:id/addresses', (req, res) => {
    const query = 'SELECT * FROM address WHERE user_id = ?'
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error retrieving addresses:', err)
            res.status(500).json({ error: 'Failed to retrieve addresses' })
        } else {
            res.json(results)
        }
    })
})

// Update an address for a user
app.put('/user/:id/addresses/:address_id', (req, res) => {
    const { address } = req.body
    const query = 'UPDATE address SET address = ? WHERE id = ? AND user_id = ?'
    db.query(query, [address, req.params.address_id, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating address:', err)
            res.status(500).json({ error: 'Failed to update address' })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Address not found or user not authorized' })
        } else {
            res.json({ id: req.params.address_id, user_id: req.params.id, address })
        }
    })
})

// Delete an address for a user

app.delete('/user/:id/addresses/:address_id', (req, res) => {
    const query = 'DELETE FROM address WHERE id = ? AND user_id = ?'
    db.query(query, [req.params.address_id, req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting address:', err)
            res.status(500).json({ error: 'Failed to delete address' })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Address not found or user not authorized' })
        } else {
            res.status(204).send()
        }
    })
})

//Add a phone number to a user
app.post('/user/:id/phone_numbers', (req, res) => {
    const { phone_number } = req.body
    const query = 'INSERT INTO user_phone (user_id, phone_number) VALUES (?,?)'
    db.query(query, [req.params.id, phone_number], (err, result) => {
        if (err) {
            console.error('Error adding phone number:', err)
            res.status(500).json({ error: 'Failed to add phone number' })
        } else {
            res.status(201).json({ id: result.insertId, user_id: req.params.id, phone_number })
        }
    })
})

// Get all phone numbers for a user

app.get('/user/:id/phone_numbers', (req, res) => {
    const query = 'SELECT * FROM user_phone WHERE user_id = ?'
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error retrieving phone numbers:', err)
            res.status(500).json({ error: 'Failed to retrieve phone numbers' })
        } else {
            res.json(results)
        }
    })
})

//update phone number 
app.put('/user/:id/phone_number/:phone_number_id', (req, res) => {
    const { phone_number } = req.body
    const query = 'UPDATE user_phone SET phone_number =? WHERE id =? AND user_id =?'
    db.query(query, [phone_number, req.params.phone_number_id, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating phone number:', err)
            res.status(500).json({ error: 'Failed to update phone number' })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Phone number not found or user not authorized' })
        } else {
            res.json({ id: req.params.phone_number_id, user_id: req.params.id, phone_number })
        }
    })
})

// Delete a phone number for a user
app.delete('/user/:id/phone_numbers/:phone_number_id', (req, res) => {
    const query = 'DELETE FROM user_phone WHERE id = ? AND user_id = ?'
    db.query(query, [req.params.phone_number_id, req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting phone number:', err)
            res.status(500).json({ error: 'Failed to delete phone number' })
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Phone number not found or user not authorized' })
        } else {
            res.status(204).send()
        }
    })
})