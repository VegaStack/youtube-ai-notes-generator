-- schema.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT (uuid()),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  login_count INTEGER DEFAULT 0,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);