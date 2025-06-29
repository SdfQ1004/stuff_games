import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import './LoginForm.css'; // 🎨 Custom styling for dark creepy login screen

export default function LoginForm({ onLogin }) {
  // 🧠 Component state: holds form inputs and UI flags
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);           // Store any login failure message
  const [showInstructions, setShowInstructions] = useState(false); // Toggles instruction modal

  const navigate = useNavigate(); // 📍 Used to programmatically navigate (e.g. to demo route)

  // 🔐 Submits credentials to login route and handles success or error
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    try {
      const user = await login(username, password); // Attempt login via API
      onLogin(user); // Notify parent of success (sets logged-in state)
    } catch {
      setError('Login failed'); // Show error to user
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center vh-100">
      {/* 🎴 Login Form UI Card */}
      <div className="login-box text-center p-4">
        <h1 className="login-title mb-4">Bad luck guessing</h1>

        {/* ❗ Login error display */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* 📝 Login Input Form */}
        <form onSubmit={handleSubmit}>
          <input
            className="form-control form-control-lg mb-3 login-input"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control form-control-lg mb-4 login-input"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn login-button w-100 mb-2">
            Login
          </button>
        </form>

        {/* 👻 Demo Mode Shortcut */}
        <button
          className="btn btn-outline-light w-100 mb-2"
          onClick={() => navigate('/demo')}
        >
          Try Demo Game
        </button>

        {/* 🧠 How to Play Modal Trigger */}
        <button
          className="btn btn-outline-secondary w-100 mb-2"
          onClick={() => setShowInstructions(true)}
        >
          Show Instructions
        </button>

        <div className="text-center mt-2">
          <small className="text-light">No account needed to try the demo!</small>
        </div>
      </div>

      {/* 📘 Instructions Modal */}
      {showInstructions && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">How to Play Stuff Happens</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowInstructions(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <ul className="small">
                    <li>You’ll face surreal nightmares each round.</li>
                    <li>You start with 3 cards showing weird situations.</li>
                    <li>Your goal is to place the next card correctly based on how disturbing it is (Bad Luck Index).</li>
                    <li>You have 30 seconds to guess. If you're wrong or timeout, you lose that card.</li>
                    <li>Win by collecting 6 cards. Lose after 3 wrong guesses.</li>
                    <li><strong>Demo users</strong> get only one round.</li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowInstructions(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 🔲 Modal background overlay (clicking it closes the modal too) */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowInstructions(false)}
          ></div>
        </>
      )}
    </div>
  );
}
