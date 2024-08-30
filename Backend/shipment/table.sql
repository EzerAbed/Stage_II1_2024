-- transporter table --
CREATE TABLE transporter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE,
    address VARCHAR(255) NOT NULL
);

-- Shipment table --
CREATE TABLE shipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    transporter_id INT,
    order_id INT,
    address_id INT,
    shipment_date DATE,
    estimated_delivery_date DATE,
    status ENUM('pending', 'shipped', 'delivered', 'canceled') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (transporter_id) REFERENCES transporter(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES address(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
