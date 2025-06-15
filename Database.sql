create database if not Exists SweetShop;
use SweetShop;


-- 1. User Table (Admin & Customer)
CREATE TABLE if not EXISTS Users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') NOT NULL
);

-- New Address Table (normalized)
CREATE TABLE if not exists Address (
    addressId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    addressLine TEXT NOT NULL,
    label VARCHAR(50), -- e.g., 'Home', 'Work'
    city VARCHAR(50),
    pincode VARCHAR(10),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'India',
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- 2. Product Table
CREATE TABLE if not EXISTS Product (
    productId INT AUTO_INCREMENT PRIMARY KEY,
    productName VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    productDescription TEXT
);

-- 3. Cart Table
CREATE TABLE Cart (
    cartId INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT,
    totalPrice DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (customerId) REFERENCES Users(userId)
);

-- 4. CartItem Table
CREATE TABLE if not EXISTS CartItem (
    cartItemId INT AUTO_INCREMENT PRIMARY KEY,
    cartId INT,
    productId INT,
    quantity INT NOT NULL,
    FOREIGN KEY (cartId) REFERENCES Cart(cartId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Product(productId)
);

-- 5. Order Table
CREATE TABLE if not EXISTS Orders (
    orderId INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT,
    totalPrice DECIMAL(10, 2) NOT NULL,
    orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    paymentMode ENUM('Online', 'CashOnShop') NOT NULL,
    status ENUM('Placed', 'Prepared', 'Collected') DEFAULT 'Placed',
    FOREIGN KEY (customerId) REFERENCES Users(userId)
);

-- 6. OrderItem Table
CREATE TABLE if not EXISTS OrderItem (
    orderItemId INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT,
    productId INT,
    quantity INT NOT NULL,
    FOREIGN KEY (orderId) REFERENCES Orders(orderId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Product(productId)
);

-- 7. FestivalSpecial Table
CREATE TABLE if not EXISTS FestivalSpecial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT,
    FOREIGN KEY (productId) REFERENCES Product(productId)
);

-- 8. Optional: Payment Table (for tracking online payments)
CREATE TABLE if not EXISTS Payment (
    paymentId INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT,
    amount DECIMAL(10, 2) NOT NULL,
    paymentTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    paymentMethod ENUM('UPI', 'Card', 'NetBanking') NOT NULL,
    paymentStatus ENUM('Success', 'Failed', 'Pending') NOT NULL,
    FOREIGN KEY (orderId) REFERENCES Orders(orderId)
);



-- Admin
INSERT INTO Users (name, email, phone, password, role)
VALUES 
('Admin User', 'admin@sweetshop.com', '9999999999', 'adminpass123', 'admin');

-- Customers
INSERT INTO Users (name, email, phone, password, role)
VALUES 
('Roshan Kumar', 'roshan@example.com', '9876543210', 'pass123', 'customer'),
('Priya Sharma', 'priya@example.com', '9123456789', 'priya123', 'customer');


INSERT INTO Product (productName, category, price, stock, productDescription)
VALUES 
('Rasgulla', 'Sweet', 22.00, 120, 'Spongy syrupy dessert made from chenna'),
('Kachori', 'Namkeen', 18.00, 150, 'Deep-fried snack stuffed with spicy lentils'),
('Vanilla Ice Cream', 'Dessert', 90.00, 40, 'Creamy vanilla flavored frozen dessert'),
('Idli', 'South Indian', 25.00, 80, 'Soft steamed rice cakes served with chutney'),
('Chips', 'Snack', 12.00, 250, 'Crispy and salty potato chips'),

('Barfi', 'Sweet', 25.00, 90, 'Dense milk-based sweet topped with nuts'),
('Pakora', 'Namkeen', 20.00, 180, 'Fritters made with gram flour and vegetables'),
('Gajar Halwa', 'Dessert', 100.00, 35, 'Sweet carrot pudding with ghee and dry fruits'),
('Uttapam', 'South Indian', 45.00, 60, 'Thick savory pancake with vegetables'),
('Khari Biscuit', 'Snack', 8.00, 280, 'Crispy and flaky puff pastry snack');






-- Let's say Roshan (userId = 2) has a cart
INSERT INTO Cart (customerId, totalPrice)
VALUES (2, 0.00);


-- Adding 2 Gulab Jamun and 3 Samosas
INSERT INTO CartItem (cartId, productId, quantity)
VALUES 
(1, 1, 2),  -- 2 Gulab Jamun
(1, 2, 3);  -- 3 Samosas


INSERT INTO Orders (customerId, totalPrice, paymentMode, status)
VALUES (2, 85.00, 'CashOnShop', 'Placed');


INSERT INTO OrderItem (orderId, productId, quantity)
VALUES 
(1, 1, 2),  -- 2 Gulab Jamun
(1, 2, 3);  -- 3 Samosas


INSERT INTO FestivalSpecial (productId)
VALUES 
(1),  -- Gulab Jamun
(3);  -- Chocolate Cake


-- New order by Priya Sharma (userId = 3)
INSERT INTO Orders (customerId, totalPrice, paymentMode, status)
VALUES (3, 120.00, 'Online', 'Placed');

-- Payment for the second order (orderId = 2)
INSERT INTO Payment (orderId, amount, paymentMethod, paymentStatus)
VALUES (2, 120.00, 'UPI', 'Success');

-- Order items
INSERT INTO OrderItem (orderId, productId, quantity)
VALUES 
(2, 3, 1);  -- 1 Chocolate Cake


select * from product;

select * from users;


select * from cart;


ALTER TABLE Orders 
MODIFY COLUMN paymentMode ENUM('Online', 'CashOnShop', 'UPI', 'Cash') NOT NULL;




