CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'super_admin', 'branch_admin', 'accountant',
        'transport_manager', 'house_master', 'librarian',
        'staff', 'headmaster', 'pta_chairman', 'student',
        'it_admin', 'security_officer'
    ) NOT NULL,
    branch_id VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_code VARCHAR(50) UNIQUE NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    status ENUM('active', 'inactive') DEFAULT 'active'
);