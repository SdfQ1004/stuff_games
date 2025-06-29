// 📦 Import necessary modules
import sqlite3 from 'sqlite3'; // SQLite3 driver
import { open } from 'sqlite'; // Promisified SQLite interface
import path from 'path';
import { fileURLToPath } from 'url';

// 🔄 Convert module file URL to __dirname (Node.js ES Module equivalent)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Define absolute path to SQLite database
const dbPath = path.resolve(__dirname, '../db/database.sqlite');

// 🔌 Open connection to the SQLite database
const db = await open({
  filename: dbPath,
  driver: sqlite3.Database,
});

// 🧹 Clear existing card data before reseeding
await db.run('DELETE FROM cards');

// 🧠 Array of dream scenario names (card titles)
const themes = [
  "Trapped in an elevator with no escape",
  "You forgot your identity",
  "Stuck in an endless fall",
  "Attacked by shadows",
  "Can't find your way home",
  "Chased by a creature with no face",
  "You’re buried alive",
  "Sinking in quicksand",
  "Phone won’t dial for help",
  "Alone in a flooded building",
  "Mouth is sewn shut",
  "You forgot how to breathe",
  "Being watched through mirrors",
  "Screams echo but no one hears",
  "Falling into darkness",
  "Endless school test with no answers",
  "Everyone turns into strangers",
  "Stuck in a looping hallway",
  "You’re invisible and ignored",
  "You’re shrinking uncontrollably",
  "Rooms melt around you",
  "Sky turns to fire",
  "Family doesn’t recognize you",
  "All clocks are frozen",
  "Legs won’t move",
  "Being dragged underwater",
  "Every word you speak vanishes",
  "Your hands vanish",
  "Time is running backwards",
  "Something’s in your bed",
  "Being erased from photos",
  "Stuck behind a glass wall",
  "No doors or windows",
  "Losing teeth one by one",
  "Being watched from the ceiling",
  "Tied down in a storm",
  "Clones of you attack",
  "You're the only person left on Earth",
  "Blood on your hands",
  "Endless staircase",
  "You're replaced by a puppet",
  "You’re stuck in static",
  "Eyes stitched closed",
  "Doors lead to nowhere",
  "You're falling up",
  "Everyone speaks in riddles",
  "You're erased from everyone's memory",
  "Everything is underwater",
  "A shadow follows your every move",
  "Every mirror shows a different you"
];

// 🖼️ Convert a card name into a corresponding filename-safe format
function getImageFilename(theme) {
  return theme
    .toLowerCase() // lowercase
    .replace(/’/g, '') // remove smart apostrophes
    .replace(/'/g, '') // remove regular apostrophes
    .replace(/[^a-z0-9]+/g, '_') // replace all non-alphanumeric characters with underscores
    .replace(/^_|_$/g, '') + '.png'; // remove leading/trailing underscores and add .png
}

// 🎴 Build the final list of card objects with image paths and indexes
const cards = themes.map((name, i) => ({
  name,
  imageURL: `/images/cards/${getImageFilename(name)}`, // where images are stored (under /public)
  badLuckIndex: (i + 1) * 2, // unique index for sorting
  theme: 'bad dreams',
}));

// 💾 Insert each card into the database
for (const card of cards) {
  await db.run(
    `INSERT INTO cards (name, imageURL, badLuckIndex, theme) VALUES (?, ?, ?, ?)`,
    [card.name, card.imageURL, card.badLuckIndex, card.theme]
  );
}

// ✅ Confirmation message
console.log(`🌙 Inserted ${cards.length} "Bad Dreams" cards into database at ${dbPath}`);
