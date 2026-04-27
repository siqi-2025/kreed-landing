-- Migration: 0001_create_waitlist_table
CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  source TEXT DEFAULT 'website'
);
