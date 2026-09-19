CREATE DATABASE IF NOT EXISTS smartdesk;

USE smartdesk;

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Open',
    category VARCHAR(30) NOT NULL DEFAULT 'General',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    summary VARCHAR(500),
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    old_status VARCHAR(30) NOT NULL,
    new_status VARCHAR(30) NOT NULL,
    remark VARCHAR(500) NOT NULL,
    changed_by VARCHAR(100) NOT NULL,
    changed_at DATETIME NOT NULL,

    CONSTRAINT fk_status_history_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE
);