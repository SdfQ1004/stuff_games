[![(deadline 2025-06-19 at 23:59)]]
# Exam #1: "Stuff Happens"
## Student: s338701 QURESHI SADAF 

## React Client Application Routes
- Route `/`: Login page with username/password and modal instructions
- Route `/demo`: One-round preview of the game, no login required
- Route `/home`: Welcome page with "Start Game" button after login
- Route `/game`: Full game experience — collect 6 cards before 3 failures
- Route `/history`: Shows all games completed by the logged-in user
- Route `/history/game/:id`: Details of one game, including each card and round result (param: `id` is game ID)
---

## API Server

- **POST `/api/login`**
  - Body: `{ username: string, password: string }`
  - Response: `{ id, username }` on success, `401` error on failure

- **POST `/api/logout`**
  - No body
  - Response: `{ message: "Logged out" }`

- **GET `/api/session`**
  - No parameters
  - Response: `{ id, username }` if authenticated, `401` otherwise

- **GET `/api/cards/init`**
  - No parameters
  - Response: Array of 3 random cards (name, imageURL, badLuckIndex, etc.)

- **POST `/api/round`**
  - Body: `{ excludeIds: number[] }`
  - Response: One random new card (not in exclude list)

- **POST `/api/round/guess`**
  - Body: `{ cardId: number, guessIndex: number, knownCards: Card[] }`
  - Response: `{ correct: boolean, fullCard: Card }`

- **POST `/api/game/end`**
  - Body: `{ outcome: "win"|"lose", roundsLost: number, initialCards: Card[], roundResults: { card, correct }[] }`
  - Response: `{ success: true, gameId: number }`

- **GET `/api/history/games`**
  - Requires login
  - Response: List of past games for user: `{ id, date, outcome, cardsCollected }[]`

- **GET `/api/history/game/:id`**
  - Param: `id` (game ID)
  - Response: `{ game, cards }` with all card and round information from that game

---

## Database Tables

- Table `users` – contains `id`, `username`, `passwordHash`, and `salt`
- Table `cards` – contains `id`, `name`, `imageURL`, `badLuckIndex`, `theme`
- Table `games` – contains `id`, `userId`, `outcome`, `date`, `roundsLost`
- Table `gameCards` – links each game with cards played, contains `id`, `gameId`, `cardId`, `won`, `roundNumber`, `isInitialCard`

---
## Main React Components

- `LoginForm` (in `LoginForm.jsx`): Handles user login, includes modal for gameplay instructions and link to demo mode
- `PageLayout` (in `PageLayout.jsx`): Wraps all pages, adds navigation header and theme layout
- `Home` (in `Home.jsx`): Post-login page with "Start Game" button and welcome message
- `DemoGame` (in `DemoGame.jsx`): Plays a single round using random cards, displays result
- `GameStart` (in `GameStart.jsx`): Main game logic, card collection, rounds, timer, and result tracking
- `History` (in `History.jsx`): Shows list of all finished games for the user
- `GameDetail` (in `GameDetail.jsx`): Shows every card and outcome for a specific finished game

---
## Screenshot
![Game History](./img/history.png)

### Game In Progress  
![Game In Progress](./img/ingame.png)

---

## Users Credentials

- `alice`, `test123`
- `bob`, `test123`

(These users are pre-seeded in the database with bcrypt hashed passwords.)#   f i n a l - g a m e - o f - t h e - s t u f f - g a m e s  
 