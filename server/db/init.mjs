import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔁 Convert ES module path to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Construct absolute path to the SQLite database file
const dbPath = path.resolve(__dirname, '../db/database.sqlite');

// 🏗️ Function to set up the database schema
const setupDB = async () => {
  // 📡 Open connection to the SQLite database using sqlite3 driver
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // 🧱 Create all necessary tables if they don't already exist
  await db.exec(`
    -- 👤 Users table stores login info (hashed passwords & unique usernames)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL
    );

    -- 🎴 Cards table stores all game cards
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      imageURL TEXT NOT NULL,
      badLuckIndex REAL NOT NULL UNIQUE,
      theme TEXT NOT NULL
    );

    -- 🕹️ Games table tracks individual game sessions for users
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      outcome TEXT, -- win/lose
      date TEXT, -- ISO string
      roundsLost INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    -- 📦 gameCards links cards to a game and tracks outcomes
    CREATE TABLE IF NOT EXISTS gameCards (
      id INTEGER PRIMARY KEY,
      gameId INTEGER,
      cardId INTEGER,
      won INTEGER, -- 1 if correct guess, 0 if wrong
      roundNumber INTEGER,
      isInitialCard INTEGER, -- 1 for initial 3 cards
      FOREIGN KEY(gameId) REFERENCES games(id),
      FOREIGN KEY(cardId) REFERENCES cards(id)
    );
  `);

  // ✅ Confirm setup success
  console.log('✅ Database initialized at:', dbPath);
};

// 🚀 Run the setup
setupDB();
