-- KARMA OPS EDITOR Database Schema
-- Run this file to set up your PostgreSQL database

-- Create database (run separately if needed)
-- CREATE DATABASE karma_editing;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  youtube_id VARCHAR(50),
  youtube_url VARCHAR(255),
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT[],
  status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  n8n_execution_id VARCHAR(100),
  file_size BIGINT,
  duration INTEGER,
  file_path TEXT,
  original_filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  progress INTEGER DEFAULT 0,
  current_step VARCHAR(100) DEFAULT 'uploading'
);

-- Executions table
CREATE TABLE IF NOT EXISTS executions (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  status VARCHAR(50),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Settings table for API keys and configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_video_id ON executions(video_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Insert default user (password: karma2024)
-- Password hash generated with bcrypt (10 rounds)
INSERT INTO users (username, password_hash)
VALUES ('kevin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (username) DO NOTHING;
