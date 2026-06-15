-- Bauchi State AI Governor Assistant Database Schema
-- Phase 1: Foundation

CREATE DATABASE IF NOT EXISTS bauchi_governor_db;
USE bauchi_governor_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) DEFAULT 'New Conversation',
    language ENUM('en', 'ha') DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    sources JSON,
    audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    category VARCHAR(100),
    ministry_id INT,
    uploaded_by INT,
    status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_ministry (ministry_id)
);

-- Ministries table
CREATE TABLE IF NOT EXISTS ministries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ha VARCHAR(255),
    description TEXT,
    commissioner_name VARCHAR(255),
    commissioner_photo VARCHAR(500),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_ha VARCHAR(255),
    description TEXT,
    ministry_id INT,
    budget DECIMAL(15,2),
    status ENUM('planned', 'ongoing', 'completed', 'delayed') DEFAULT 'planned',
    start_date DATE,
    completion_date DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE SET NULL
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_ha VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    ministry_id INT,
    completion_date DATE,
    source_document_id INT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- System settings
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user (password: ChangeMe@2025)
-- Password hash is for 'ChangeMe@2025' - change on first login
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('admin@kauranbauchi.ai', '$2b$10$YourHashHereWillBeReplaced', 'System Administrator', 'admin');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type) VALUES
('site_name', 'Bauchi AI Governor Assistant', 'string'),
('site_description', 'Official AI Assistant of Bauchi State Governor', 'string'),
('primary_color', '#B84A2C', 'string'),
('logo_url', '/images/logo-placeholder.svg', 'string'),
('governor_name', 'Alh. Dr. Bala Mohammed', 'string'),
('governor_title', 'Executive Governor of Bauchi State', 'string'),
('default_language', 'en', 'string'),
('widget_enabled', 'true', 'boolean'),
('voice_enabled', 'true', 'boolean');

-- Sample ministries
INSERT INTO ministries (name, name_ha, commissioner_name) VALUES
('Ministry of Education', 'Ma\'aikatar Ilimi', 'Dr. Aliyu Tilde'),
('Ministry of Health', 'Ma\'aikatar Lafiya', 'Dr. Adamu Sani'),
('Ministry of Works and Transport', 'Ma\'aikatar Ayyuka da Sufuri', 'Arc. Ibrahim Galadima'),
('Ministry of Agriculture', 'Ma\'aikatar Noma', 'Alh. Muhammad Bello');