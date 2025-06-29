import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

// Routes
import authRoutes from './auth/auth.mjs';      // 🔐 Handles login, logout, session
import apiRoutes from './routes/api.mjs';      // 🎯 Handles game logic & endpoints

const app = express();
const PORT = 3001;

// 🌐 Allow cross-origin requests from frontend
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend dev server
  credentials: true,                // Allow sending cookies
}));

// 🖼️ Serve static images from public folder (e.g., card images, background)
app.use('/images', express.static('public/images'));

// 🧠 Parse JSON bodies for incoming requests
app.use(express.json());

// 🛡️ Setup session middleware for storing user state on the server
app.use(session({
  secret: 'a_super_secret_key', // Use a strong key in production!
  resave: false,                // Avoid saving unchanged sessions
  saveUninitialized: false,     // Don't save empty sessions
}));

// 🔐 Initialize Passport authentication system
import './auth/passport-config.mjs'; // Must import config before using Passport
app.use(passport.initialize());     // Start Passport
app.use(passport.session());        // Enable persistent login via session

// 🧭 Mount API routes (prefixed with /api)
app.use('/api', authRoutes);  // login, logout, session
app.use('/api', apiRoutes);   // game-related API endpoints

// 🚀 Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
