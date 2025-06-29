import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from 'react-router-dom';

import Home from './pages/Home';
import GameStart from './pages/GameStart';
import GameDetail from './pages/GameDetail';
import History from './pages/History';
import LoginForm from './components/LoginForm';
import DemoGame from './pages/DemoGame';

/**
 * Handles all route-based rendering and authentication logic.
 * Props:
 * - user: currently logged-in user (null if not logged in)
 * - setUser: function to update user state (on login/logout)
 */
function AppRoutes({ user, setUser }) {
  const navigate = useNavigate();

  // 🔓 Logout logic: calls /api/logout and resets session state
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // 🔐 needed to include session cookie
      });
      setUser(null);           // clear user on logout
      navigate('/');           // go back to login
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Routes>
      {/* 🧑‍💻 Routes for authenticated users */}
      {user ? (
        <>
          <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
          <Route path="/home" element={<Home user={user} onLogout={handleLogout} />} />
          <Route path="/game" element={<GameStart user={user} onLogout={handleLogout} />} />
          <Route path="/history" element={<History user={user} onLogout={handleLogout} />} />
          <Route path="/history/game/:id" element={<GameDetail user={user} onLogout={handleLogout} />} />
        </>
      ) : (
        // 🧪 Routes for guests / demo users
        <>
          <Route path="/" element={<LoginForm onLogin={setUser} />} />
          <Route path="/demo" element={<DemoGame />} />
        </>
      )}
    </Routes>
  );
}

/**
 * The root component for the app.
 * Handles:
 * - fetching the session to check login state
 * - passing user data to routes
 */
export default function App() {
  const [user, setUser] = useState(null); // null if not logged in

  // 🔁 Check session on initial load
  useEffect(() => {
    fetch('/api/session', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null)) // if session is valid, get user
      .then(setUser)                             // update state
      .catch(() => setUser(null));               // fallback to null on error
  }, []);

  return (
    <Router>
      <AppRoutes user={user} setUser={setUser} />
    </Router>
  );
}
