import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs'; // 📅 For formatting timestamps

// Convert module URL to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../db/database.sqlite'); // 📂 Absolute path to SQLite DB

const router = express.Router(); // Create Express router for API endpoints

// 🔌 Utility function to open DB connection
const getDB = () =>
  open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

/* 📦 TEST ENDPOINT — Returns 5 cards from DB (for sanity check) */
router.get('/cards/test', async (req, res) => {
  const db = await getDB();
  const cards = await db.all('SELECT * FROM cards LIMIT 5');
  res.json(cards);
});

/* 🔄 INIT ROUND — Randomly fetch 3 cards to begin the game */
router.get('/cards/init', async (req, res) => {
  try {
    const db = await getDB();
    const cards = await db.all(`
      SELECT * FROM cards
      ORDER BY RANDOM()
      LIMIT 3
    `);
    res.json(cards);
  } catch (err) {
    console.error('Error fetching init cards:', err);
    res.status(500).json({ error: 'Failed to fetch initial cards' });
  }
});

/* 🎯 NEXT ROUND CARD — Fetch one card not previously used */
router.post('/round', async (req, res) => {
  try {
    const db = await getDB();
    const { excludeIds } = req.body; // List of card IDs to exclude

    // 🧷 Protect against SQL injection with placeholders
    const placeholders = excludeIds.map(() => '?').join(', ');
    const query = `
      SELECT id, name, imageURL
      FROM cards
      WHERE id NOT IN (${placeholders})
      ORDER BY RANDOM()
      LIMIT 1
    `;

    const nextCard = await db.get(query, excludeIds);

    if (!nextCard) {
      return res.status(404).json({ error: 'No more cards available' });
    }

    res.json(nextCard);
  } catch (err) {
    console.error('Error in /round:', err);
    res.status(500).json({ error: 'Failed to get round card' });
  }
});

/* ❓ GUESS ROUND — Evaluate the position guessed by the player */
router.post('/round/guess', async (req, res) => {
  try {
    const db = await getDB();
    const { cardId, guessIndex, knownCards } = req.body;

    // Fetch full details of the card guessed
    const card = await db.get('SELECT * FROM cards WHERE id = ?', [cardId]);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    // Determine correct index placement based on badLuckIndex
    const sorted = knownCards
      .map(c => c.badLuckIndex)
      .sort((a, b) => a - b);

    const index = card.badLuckIndex;
    let correctIndex = sorted.findIndex(i => index < i);
    if (correctIndex === -1) correctIndex = sorted.length;

    // ✅ Check if player's guess matches correct index
    const isCorrect = guessIndex === correctIndex;

    res.json({
      correct: isCorrect,
      fullCard: card, // Return full card info to frontend
    });
  } catch (err) {
    console.error('Error in /round/guess:', err);
    res.status(500).json({ error: 'Failed to evaluate guess' });
  }
});

/* 🧠 END GAME — Save game outcome, cards and guesses to DB */
router.post('/game/end', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await getDB();
    const { outcome, roundsLost, initialCards, roundResults } = req.body;

    // Insert game summary row into games table
    const result = await db.run(`
      INSERT INTO games (userId, outcome, date, roundsLost)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, outcome, dayjs().format('YYYY-MM-DD HH:mm:ss'), roundsLost]);

    const gameId = result.lastID;

    // ⬇️ Insert all starting cards (marked as initial)
    for (const card of initialCards) {
      await db.run(`
        INSERT INTO gameCards (gameId, cardId, won, roundNumber, isInitialCard)
        VALUES (?, ?, 1, NULL, 1)
      `, [gameId, card.id]);
    }

    // ⬇️ Insert each round result (win/loss + order)
    for (let i = 0; i < roundResults.length; i++) {
      const { card, correct } = roundResults[i];
      await db.run(`
        INSERT INTO gameCards (gameId, cardId, won, roundNumber, isInitialCard)
        VALUES (?, ?, ?, ?, 0)
      `, [gameId, card.id, correct ? 1 : 0, i + 1]);
    }

    res.json({ success: true, gameId });
  } catch (err) {
    console.error('Error saving game:', err);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

/* 📜 HISTORY LIST — Retrieve all games for the logged-in user */
router.get('/history/games', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await getDB();

    // Fetch summary of all games, including total cards collected
    const games = await db.all(`
      SELECT g.id, g.date, g.outcome,
        COUNT(gc.id) AS cardsCollected
      FROM games g
      JOIN gameCards gc ON gc.gameId = g.id
      WHERE g.userId = ?
        AND (gc.won = 1 OR gc.isInitialCard = 1)
      GROUP BY g.id
      ORDER BY g.date DESC
    `, [req.user.id]);

    res.json(games);
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ error: 'Failed to load game history' });
  }
});

/* 🔍 HISTORY DETAIL — Load specific game with all card data */
router.get('/history/game/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await getDB();
    const gameId = req.params.id;

    // Confirm game exists and belongs to this user
    const game = await db.get('SELECT * FROM games WHERE id = ? AND userId = ?', [gameId, req.user.id]);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Retrieve all cards associated with this game (initial + rounds)
    const cards = await db.all(`
      SELECT 
        c.id, c.name, c.imageURL, c.badLuckIndex,
        gc.isInitialCard,
        gc.won,
        gc.roundNumber
      FROM gameCards gc
      JOIN cards c ON c.id = gc.cardId
      WHERE gc.gameId = ?
      ORDER BY gc.isInitialCard DESC, gc.roundNumber ASC
    `, [gameId]);

    res.json({ game, cards });
  } catch (err) {
    console.error('Error fetching game details:', err);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

export default router;
