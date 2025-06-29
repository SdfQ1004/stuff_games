import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { getUserByUsername, getUserById } from '../models/userModel.mjs';

// 🔐 Configure Local Strategy for username + password authentication
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    // 1. Look up user in the database by username
    const user = await getUserByUsername(username);
    if (!user) return done(null, false, { message: 'User not found' });

    // 2. Compare password with the stored password hash
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return done(null, false, { message: 'Incorrect password' });

    // 3. If successful, pass user object to Passport
    return done(null, user);
  } catch (err) {
    // Handle any unexpected errors
    console.error('Auth error:', err);
    return done(err);
  }
}));

// 📦 Serialize user — stores only the user ID in the session
passport.serializeUser((user, done) => {
  done(null, user.id); // Save user.id into the session
});

// 🔄 Deserialize user — retrieves full user object from session ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id); // Get full user from DB
    if (!user) return done(new Error('User not found'));
    done(null, user); // Attach user object to req.user
  } catch (err) {
    console.error('Deserialize error:', err);
    done(err); // Fail gracefully
  }
});
