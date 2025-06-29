import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import './GameStart.css';

export default function GameStart({ onLogout, user }) {
  // 🌟 Game State Variables
  const [cards, setCards] = useState([]);                  // Cards collected by the player
  const [roundCard, setRoundCard] = useState(null);        // The current card being guessed
  const [result, setResult] = useState(null);              // Feedback for the user's guess
  const [failures, setFailures] = useState(0);             // Number of wrong guesses
  const [gameOver, setGameOver] = useState(false);         // Indicates if the game is over
  const [initialCards, setInitialCards] = useState([]);    // Starting 3 cards
  const [roundResults, setRoundResults] = useState([]);    // Stores result of each round
  const [timer, setTimer] = useState(30);                  // Countdown timer in seconds

  const timerRef = useRef(null);                           // Ref to manage timer interval
  const navigate = useNavigate();                          // Navigation utility

  // 🎨 Style timer color based on time remaining
  const getTimerStyle = () => {
    return {
      color: timer <= 5 ? '#ff4444' : '#ffe8b3',
      fontWeight: 'bold',
    };
  };

  // 🚀 Start game when component mounts
  useEffect(() => {
    startNewGame();
  }, []);

  // 🔁 Start or reset a game
  const startNewGame = () => {
    setCards([]);
    setRoundCard(null);
    setResult(null);
    setFailures(0);
    setGameOver(false);
    setInitialCards([]);
    setRoundResults([]);
    setTimer(30);
    clearInterval(timerRef.current);

    fetch('/api/cards/init', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCards(data);
        setInitialCards(data);
      });
  };

  // ⏱️ Handle countdown when a new round starts
  useEffect(() => {
    if (!roundCard) return;

    setTimer(30);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [roundCard]);

  // ⏰ Handle time expiration
  const handleTimeout = () => {
    setRoundResults(prev => [...prev, { card: roundCard, correct: false }]);
    const newFail = failures + 1;
    setFailures(newFail);
    setResult({ correct: false, message: '⏰ Time expired! Card discarded.' });

    if (newFail === 3) {
      endGame('lose');
      setGameOver('lose');
    }

    setRoundCard(null);
  };

  // ➕ Fetch a new round card (excluding used cards)
  const getNextCard = async () => {
    setResult(null);
    const excludeIds = cards.map(card => card.id).concat(
      roundResults.filter(r => !r.correct).map(r => r.card.id)
    );

    const res = await fetch('/api/round', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ excludeIds }),
    });

    const card = await res.json();
    setRoundCard(card);
  };

  // 💾 Save game result on server
  const endGame = async (outcome) => {
    await fetch('/api/game/end', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outcome,
        roundsLost: failures,
        initialCards,
        roundResults
      })
    });
  };

  // 🧠 Submit a user's guess
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
    setRoundResults(prev => [...prev, { card: data.fullCard || roundCard, correct: data.correct }]);

    if (data.correct) {
      const updated = [...cards, data.fullCard].sort((a, b) => a.badLuckIndex - b.badLuckIndex);
      setCards(updated);
      setResult({ correct: true, message: `✅ Correct! Index: ${data.fullCard.badLuckIndex}` });

      if (updated.length === 6) {
        await endGame('win');
        setGameOver('win');
      }
    } else {
      const newFail = failures + 1;
      setFailures(newFail);
      setResult({ correct: false, message: '❌ Wrong! Card discarded.' });

      if (newFail === 3) {
        await endGame('lose');
        setGameOver('lose');
      }
    }

    setRoundCard(null);
  };

  return (
    <PageLayout user={user} onLogout={onLogout}>
      <div className="gamestart-container">
        <h2>Your Nightmares</h2>

        {/* 🎯 Score + Error Tracker */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-success fw-semibold">Collected: {cards.length} / 6</span>
          <span className="text-danger fw-semibold">Wrong: {failures} / 3</span>
        </div>

        {/* ✅ Collection Progress Bar */}
        <div className="progress mb-3" style={{ height: '20px' }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${(cards.length / 6) * 100}%` }}
          >
            {cards.length} / 6
          </div>
        </div>

        {/* ❌ Failure Progress Bar */}
        <div className="progress mb-4" style={{ height: '20px' }}>
          <div
            className="progress-bar bg-danger"
            style={{ width: `${(failures / 3) * 100}%` }}
          >
            {failures} / 3
          </div>
        </div>

        {/* 🧠 Display all cards collected */}
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

        {/* 🧩 Show "Next Card" if no current round */}
        {!roundCard && !result && !gameOver && (
          <div className="d-flex justify-content-center mt-4">
            <button className="btn btn-primary" onClick={getNextCard}>
              Next Card
            </button>
          </div>
        )}

        {/* 🎲 Active guessing round */}
        {roundCard && (
          <div className="text-center mt-4">
            <h4>Where does this card go?</h4>
            <img src={roundCard.imageURL} alt={roundCard.name} width="160" />
            <p className="mt-2"><strong>{roundCard.name}</strong></p>

            {/* ⏲️ Countdown Timer */}
            <p style={getTimerStyle()}>
              Time remaining: {timer}s
            </p>

            <div className="progress mb-3" style={{ height: '10px' }}>
              <div
                className={`progress-bar ${timer <= 5 ? 'bg-danger' : 'bg-warning'}`}
                style={{ width: `${(timer / 30) * 100}%` }}
              />
            </div>

            {/* 📍 Guess Position Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
              {cards.map((card, i) => (
                <button key={i} className="btn btn-outline-primary" onClick={() => submitGuess(i)}>
                  Before "{card.name}"
                </button>
              ))}
              <button className="btn btn-outline-primary" onClick={() => submitGuess(cards.length)}>
                After "{cards[cards.length - 1].name}"
              </button>
            </div>
          </div>
        )}

        {/* 🧾 Feedback after guess */}
        {result && !gameOver && (
          <div className="alert alert-info text-center mt-4">
            <h5>{result.message}</h5>
            <button className="btn btn-primary mt-2" onClick={getNextCard}>Next Round</button>
          </div>
        )}

        {/* 🏁 Game Over Summary */}
        {gameOver && (
          <div className="mt-5">
            <h3 className="text-center">{gameOver === 'win' ? '🎉 You won!' : '💀 You lost!'}</h3>
            <div className="row g-3 mt-3">
              {cards.map(card => (
                <div key={card.id} className="col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm">
                    <img src={card.imageURL} className="card-img-top" alt={card.name} />
                    <div className="card-body text-center">
                      <h6>{card.name}</h6>
                      <p><strong>{card.badLuckIndex}</strong></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-grid gap-2 col-6 mx-auto mt-4">
              <button className="btn btn-success btn-lg" onClick={startNewGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
