import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import './Home.css'; // 👈 Custom CSS for spooky theme and layout

export default function Home({ user, onLogout }) {
  const navigate = useNavigate(); // Used for redirecting the user to another route

  return (
    // 🧱 Wraps the page content with header (logout, nav) and background layout
    <PageLayout user={user} onLogout={onLogout}>
      {/* 🧟‍♂️ Main content area, vertically and horizontally centered */}
      <div className="home-page text-center d-flex flex-column align-items-center justify-content-center py-5">
        
        {/* 🎃 Welcome Title with creepy themed font */}
        <h1 className="home-title mb-3">
          Welcome, {user.username}!
        </h1>

        {/* 💀 Brief game description */}
        <p className="home-subtitle mb-4">
          Try to escape your nightmares by placing each bad dream in the right order...
        </p>

        {/* 🔘 Giant "Start Game" button */}
        <div className="d-flex justify-content-center">
          <button
            className="btn start-button"
            onClick={() => navigate('/game')} // 🔁 Navigate to game start screen
          >
            Start Game
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
