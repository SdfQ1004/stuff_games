// 🧩 Import necessary modules
import sqlite3 from 'sqlite3';              // SQLite3 driver
import { open } from 'sqlite';             // Promisified SQLite wrapper
import path from 'path';                   // Path utilities for resolving file paths
import { fileURLToPath } from 'url';       // Allows use of __dirname with ES Modules

// 📍 Resolve the current file and directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📂 Construct absolute path to SQLite database file
const dbPath = path.resolve(__dirname, '../db/database.sqlite');

// 🔌 Create and export a shared database connection promise
const dbPromise = open({
  filename: dbPath,
  driver: sqlite3.Database,
});

// 🔍 Retrieve user by username (for login)
export async function getUserByUsername(username) {
  const db = await dbPromise; // wait for DB connection
  return db.get('SELECT * FROM users WHERE username = ?', [username]); // run SELECT query
}

// 🔍 Retrieve user by ID (for session management)
export async function getUserById(id) {
  const db = await dbPromise; // wait for DB connection
  return db.get('SELECT * FROM users WHERE id = ?', [id]); // run SELECT query
}
