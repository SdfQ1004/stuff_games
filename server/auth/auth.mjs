import express from 'express';
import passport from 'passport';

const router = express.Router();

// 🔐 LOGIN ROUTE
// This route handles login using Passport's 'local' strategy.
// It verifies the username/password and establishes a session if successful.
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err); // If an internal error occurs during authentication
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' }); // If credentials are incorrect

    // Log the user in (establish session)
    req.logIn(user, err => {
      if (err) return next(err); // Handle login failure
      res.json({ id: user.id, username: user.username }); // Respond with basic user info
    });
  })(req, res, next); // Manually invoke the middleware function
});

// 🚪 LOGOUT ROUTE
// This route logs the user out and destroys their session.
router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err); // Handle logout error
    req.session?.destroy(() => {
      res.clearCookie('connect.sid'); // Optional: clear session cookie
      res.json({ message: 'Logged out' }); // Confirm logout
    });
  });
});

// 🔍 SESSION CHECK ROUTE
// This route checks if a user is currently authenticated (used to persist login state).
router.get('/session', (req, res) => {
  if (req.isAuthenticated?.() && req.user) {
    // Return current session user info
    res.json({ id: req.user.id, username: req.user.username });
  } else {
    // No valid session
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
