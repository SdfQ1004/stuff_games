import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

export default function DemoGame() {
  // 🎴 State for demo cards and gameplay
  const [cards, setCards] = useState([]); // Starting 3 cards shown to user
  const [roundCard, setRoundCard] = useState(null); // New card to guess placement for
  const [result, setResult] = useState(null); // Stores the result after guessing
  const [timer, setTimer] = useState(30); // Timer for each guess
  const [demoOver, setDemoOver] = useState(false); // Only one round in demo

  const timerRef = useRef(null); // Reference to timer interval
  const navigate = useNavigate(); // For navigating back to login after round

  // 🔁 Fetch 3 random starter cards on page load
  useEffect(() => {
    fetch('/api/cards/init', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCards(data);
        getDemoCard(data); // Load one extra card to guess
      });
  }, []);

  // 🃏 Get a single card not in the initial list
  const getDemoCard = async (initialCards) => {
    const excludeIds = initialCards.map(card => card.id); // Avoid duplicates

    const res = await fetch('/api/round', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ excludeIds })
    });

    const card = await res.json();
    setRoundCard(card);
    startTimer(); // Start countdown
  };

  // ⏲️ Timer countdown logic (starts at 30s)
  const startTimer = () => {
    clearInterval(timerRef.current); // Clear old timer
    setTimer(30); // Reset timer to 30
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout(); // ⏰ Time’s up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ❌ Handle if time expires without answer
  const handleTimeout = () => {
    setResult({ correct: false, message: '⏰ Time expired! Card discarded.' });
    setRoundCard(null);
    setDemoOver(true); // End demo round
  };

  // ✅ Handle user guess submission
  const submitGuess = async (guessIndex) => {
    clearInterval(timerRef.current);

    const res = await fetch('/api/round/guess', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId: roundCard.id,
        guessIndex,
        knownCards: cards,
      }),
    });

    const data = await res.json();

    if (data.correct) {
      // Correct guess → insert card into known cards (sorted)
      const updated = [...cards, data.fullCard].sort((a, b) => a.badLuckIndex - b.badLuckIndex);
      setCards(updated);
      setResult({ correct: true, message: `✅ Correct! Index: ${data.fullCard.badLuckIndex}` });
    } else {
      // Incorrect guess
      setResult({ correct: false, message: '❌ Wrong! Card discarded.' });
    }

    setRoundCard(null);
    setDemoOver(true); // 🛑 One round only in demo
  };

  // 🎨 Timer color styling based on remaining time
  const getTimerStyle = () => {
    if (timer <= 5) {
      return { color: '#ff4444', fontWeight: 'bold' }; // 🔴 Red warning
    }
    return { color: '#ffe8b3', fontWeight: 'bold' }; // 🟡 Default soft yellow
  };

  return (
    <PageLayout showBack={!demoOver}>
      <h2 className="mb-4">Demo Game</h2>

      <p className="text-muted">Try one round. Can you guess correctly?</p>

      {/* 🧠 Display user's known cards */}
      <div className="row g-3 mb-4">
        {cards.map(card => (
          <div className="col-md-4 col-lg-3" key={card.id}>
            <div className="card shadow-sm">
              <img src={card.imageURL} className="card-img-top" alt={card.name} />
              <div className="card-body text-center">
                <h6>{card.name}</h6>
                <p><strong>{card.badLuckIndex}</strong></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🧩 Active round: place the new card */}
      {roundCard && (
        <div className="text-center mt-4">
          <h4>Where does this card go?</h4>
          <img src={roundCard.imageURL} alt={roundCard.name} width="160" />
          <p className="mt-2"><strong>{roundCard.name}</strong></p>

          {/* ⏲️ Timer Display (colored) */}
          <p style={getTimerStyle()}>
            Time remaining: {timer}s
          </p>

          <div className="progress mb-3" style={{ height: '10px' }}>
            <div
              className={`progress-bar ${timer <= 5 ? 'bg-danger' : 'bg-warning'}`}
              style={{ width: `${(timer / 30) * 100}%` }}
            />
          </div>

          {/* 🧠 Position guesses */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
            {cards.map((card, i) => (
              <button key={i} className="btn btn-outline-primary" onClick={() => submitGuess(i)}>
                Before "{card.name}"
              </button>
            ))}
            <button
              className="btn btn-outline-primary"
              onClick={() => submitGuess(cards.length)}
            >
              After "{cards[cards.length - 1].name}"
            </button>
          </div>
        </div>
      )}

      {/* 🎯 Result modal after round */}
      {result && (
        <div className="alert alert-info text-center mt-4">
          <h5>{result.message}</h5>
          <p className="text-muted">Demo complete.</p>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
            Back to Login
          </button>
        </div>
      )}

      {/* ⏳ Waiting / loading spinner */}
      {!roundCard && !result && !demoOver && (
        <div className="text-center mt-4">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
