// 📦 Import necessary modules
import sqlite3 from 'sqlite3';          // SQLite3 driver
import { open } from 'sqlite';         // Promisified wrapper for SQLite
import bcrypt from 'bcrypt';           // Library to hash passwords securely
import path from 'path';               // Path utility module
import { fileURLToPath } from 'url';   // Convert import.meta.url to file path

// 📍 Resolve absolute path to the database file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../db/database.sqlite');

// 🔌 Open a connection to the SQLite database
const db = await open({
  filename: dbPath,
  driver: sqlite3.Database,
});

// 🧪 Function to create test users (with same password)
const createTestUsers = async () => {
  const salt = await bcrypt.genSalt(10);                 // 🔐 Generate salt
  const passwordHash = await bcrypt.hash('test123', salt); // 🔐 Hash the password using the salt

  await db.run('DELETE FROM users'); // 🚨 Optional: Clear all users for clean slate (use only in dev!)

  // 👤 Insert test user: alice
  await db.run(
    `INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)`,
    ['alice', passwordHash, salt]
  );

  // 👤 Insert test user: bob
  await db.run(
    `INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)`,
    ['bob', passwordHash, salt]
  );

  // ✅ Log success
  console.log('✅ Users seeded: alice, bob (password: test123)');
};

// 🚀 Run the seeding function
await createTestUsers();
