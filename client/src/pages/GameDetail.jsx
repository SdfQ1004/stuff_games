import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import './GameDetail.css'; // 🎨 Custom styling for themed game detail page

export default function GameDetail({ user, onLogout }) {
  // 🔢 Get game ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();

  // 🧠 Local state
  const [game, setGame] = useState(null);       // Stores main game metadata
  const [cards, setCards] = useState([]);       // Stores all cards involved in game
  const [error, setError] = useState(null);     // Error tracking

  // 🛰️ Fetch game details on mount
  useEffect(() => {
    fetch(`/api/history/game/${id}`, {
      credentials: 'include', // includes session cookie
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch game details');
        return res.json();
      })
      .then(data => {
        setGame(data.game);     // metadata (date, outcome)
        setCards(data.cards);   // full card list
      })
      .catch(err => setError(err.message));
  }, [id]);

  // ❌ Show error if fetch fails
  if (error) {
    return (
      <PageLayout user={user} onLogout={onLogout}>
        <p className="text-danger">{error}</p>
      </PageLayout>
    );
  }

  // ⌛ Show loading spinner while waiting
  if (!game) {
    return (
      <PageLayout user={user} onLogout={onLogout}>
        <p>Loading game...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout user={user} onLogout={onLogout}>
      <div className="gamedetail-container">
        {/* 🧾 Game Summary */}
        <h2>Game #{game.id}</h2>
        <p><strong>Date:</strong> {game.date}</p>
        <p><strong>Outcome:</strong> {game.outcome}</p>
        <p><strong>Rounds Lost:</strong> {game.roundsLost}</p>

        {/* 🃏 All cards from this game */}
        <h4 className="mt-4">Cards Involved</h4>
        <div className="table-responsive rounded border-0 shadow-sm">
          <table className="gamedetail-table table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th>Bad Luck Index</th>
                <th>Type</th>
                <th>Round</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id}>
                  <td>{card.name}</td>
                  <td>
                    <img src={card.imageURL} alt={card.name} width="60" />
                  </td>
                  <td>{card.badLuckIndex}</td>
                  <td>
                    {card.isInitialCard
                      ? 'Initial'
                      : card.won
                      ? 'Won'
                      : 'Missed'}
                  </td>
                  <td>{card.roundNumber ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔙 Back navigation */}
        <div className="mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/history')}
          >
            ← Back to Game History
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
