-- SmartCampus database schema

CREATE DATABASE IF NOT EXISTS smartcampus;
USE smartcampus;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    department VARCHAR(100),
    phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150),
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    location_accuracy DECIMAL(10,2) NULL,
    image_path VARCHAR(255),
    status ENUM('Pending', 'In Progress', 'Resolved', 'Rejected') NOT NULL DEFAULT 'Pending',
    priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category_location (category, location)
);

-- If you already ran this file before (table exists without image_path),
-- run this one line manually instead of the whole file:
-- ALTER TABLE complaints ADD COLUMN image_path VARCHAR(255) AFTER location;
-- To add optional GPS data to an existing complaints table, run:
-- ALTER TABLE complaints ADD COLUMN latitude DECIMAL(10,7) NULL, ADD COLUMN longitude DECIMAL(10,7) NULL, ADD COLUMN location_accuracy DECIMAL(10,2) NULL;

-- Default admin login: admin@smartcampus.edu / admin123
-- NOTE: passwords are stored in plain text here for simplicity; hash them (e.g. BCrypt) before production use.
INSERT INTO users (name, email, password, role, department, phone)
VALUES ('Admin', 'admin@smartcampus.edu', 'admin123', 'admin', 'Administration', '0000000000')
ON DUPLICATE KEY UPDATE email = email;
