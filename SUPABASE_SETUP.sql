-- Supabase Setup Script for LCL
-- Run this in Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Levels table (for both approved and pending)
CREATE TABLE IF NOT EXISTS levels (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  level_id INTEGER NOT NULL,
  url TEXT,
  youtube_url TEXT,
  thumbnail TEXT,
  difficulty TEXT,
  submitted_by TEXT NOT NULL,
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (single row for global settings)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  dark_background BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (for future security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_levels_status ON levels(status);
CREATE INDEX IF NOT EXISTS idx_levels_submitted_date ON levels(submitted_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Initial data (optional - comment out if you don't want default data)
INSERT INTO users (id, email, display_name, password, is_admin)
VALUES ('admin1', 'maencopra@gmail.com', 'Admin', 'maenissocool12345gGs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id, theme, language, dark_background)
VALUES (1, 'dark', 'en', true)
ON CONFLICT (id) DO NOTHING;
