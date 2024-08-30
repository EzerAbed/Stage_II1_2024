-- Product table --
CREATE TABLE product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    stock INT NOT NULL,
    category_id INT,
    subcategory_id INT,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategory_id) REFERENCES subcategory(id) ON DELETE SET NULL
);

-- Product_images table --
CREATE TABLE product_image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    image_path VARCHAR(255) NOT NULL,
    isprimary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

-- Promotions table --
CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    type ENUM('pourcentage', 'montant fixe') NOT NULL,
    valeur DECIMAL(10, 2) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL
);

-- product_promotion table --
CREATE TABLE product_promotion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    promotion_id INT,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);
