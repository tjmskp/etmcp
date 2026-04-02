CREATE DATABASE IF NOT EXISTS mcp_db;
USE mcp_db;

CREATE TABLE IF NOT EXISTS mcp_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role ENUM('admin','system') NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcp_conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  platform VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES mcp_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS mcp_messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  sender VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  intent VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES mcp_conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mcp_leads (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  intent VARCHAR(100),
  score INT,
  status ENUM('new','qualified','high_value'),
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcp_service_mapping (
  id VARCHAR(36) PRIMARY KEY,
  intent VARCHAR(255) NOT NULL UNIQUE,
  services JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS mcp_logs (
  id VARCHAR(36) PRIMARY KEY,
  request JSON,
  response JSON,
  error TEXT,
  platform VARCHAR(100),
  processing_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcp_settings (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` TEXT
);

CREATE TABLE IF NOT EXISTS mcp_training_data (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('json','text') NOT NULL,
  payload JSON NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcp_users_api_key ON mcp_users(api_key);
CREATE INDEX idx_mcp_conversations_user_id ON mcp_conversations(user_id);
CREATE INDEX idx_mcp_messages_conversation_id ON mcp_messages(conversation_id);
CREATE INDEX idx_mcp_leads_status ON mcp_leads(status);
CREATE INDEX idx_mcp_service_mapping_intent ON mcp_service_mapping(intent);
CREATE INDEX idx_mcp_logs_created_at ON mcp_logs(created_at);
CREATE INDEX idx_mcp_training_data_name ON mcp_training_data(name);
