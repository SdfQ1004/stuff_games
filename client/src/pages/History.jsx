// Import core React hooks and routing/navigation tools
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Reusable layout wrapper for consistent UI structure
import PageLayout from '../components/PageLayout';

// Custom styling for the History page
import './History.css'; // 👈 Add this CSS file for visual style

// History component displays the list of completed games for the logged-in user
export default function History({ user, onLogout }) {
  const [games, setGames] = useState([]);       // State to store list of games fetched from server
  const [error, setError] = useState(null);     // State to track fetch errors
  const navigate = useNavigate();               // Hook for programmatic navigation

  // Fetch game history from the backend API when component mounts
  useEffect(() => {
    fetch('/api/history/games', {
      credentials: 'include', // Includes cookies/session for authentication
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated'); // Handle unauthorized access
        return res.json(); // Parse the JSON if successful
      })
      .then(setGames) // Update games state with fetched data
      .catch(err => setError(err.message)); // Capture and display any errors
  }, []); // Empty dependency array means this runs only once on mount

  return (
    // Wrap content inside the consistent PageLayout
    <PageLayout user={user} onLogout={onLogout}>
      <div className="history-wrapper">
        {/* Page Heading */}
        <h2 className="history-title">Your Game History</h2>

        {/* Display error message if fetch failed */}
        {error ? (
          <p className="text-danger">{error}</p>

        // If there are no games in history, show a fallback message
        ) : games.length === 0 ? (
          <p className="history-empty">You haven't completed any games yet.</p>

        // If games are available, render the data table
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover custom-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Outcome</th>
                  <th>Cards Collected</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Render each game row */}
                {games.map(game => (
                  <tr key={game.id}>
                    <td>{game.date}</td>
                    <td>{game.outcome}</td>
                    <td>{game.cardsCollected}</td>
                    <td>
                      {/* View button navigates to detailed view of selected game */}
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => navigate(`/history/game/${game.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Navigation button to return to the Home page */}
        <div className="d-flex justify-content-center mt-4">
          <button
            className="btn btn-outline-light back-home-button"
            onClick={() => navigate('/home')}
          >
            ← Back to Home Page
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
