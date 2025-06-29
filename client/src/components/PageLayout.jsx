// 📦 React Router imports for navigation and current route tracking
import { useNavigate, useLocation } from 'react-router-dom';
// 🎨 Custom themed styles for layout background and header
import './PageLayout.css'; 

// 🧩 PageLayout is a reusable wrapper for all app pages
export default function PageLayout({ children, onLogout, user, showBack = true }) {
  const navigate = useNavigate(); // Enables programmatic navigation
  const location = useLocation(); // Access current route

  // 🧭 Determine what page we're on
  const isHome = location.pathname === '/home' || location.pathname === '/';
  const isHistory = location.pathname === '/history';
  const isDemo = location.pathname === '/demo';

  // 🔐 If user is logged in, we show extra buttons in the header
  const showHeaderButtons = !!user;
  const showHomeButton = showHeaderButtons && !isHome;
  const showHistoryButton = showHeaderButtons && !isHistory;

  return (
    <div className="layout-wrapper d-flex flex-column min-vh-100">
      
      {/* 🔝 Sticky top header with title and user actions */}
      <header className="header-bar d-flex justify-content-between align-items-center px-4 py-3">
        
        {/* 🧟‍♀️ Creepy animated game title — clickable to go Home */}
        <div
          className="creepy-header"
          role="button"
          onClick={() => navigate('/home')}
        >
          Stuff Happens
        </div>

        {/* 🧩 Buttons on the right: greeting, nav, logout */}
        <div className="d-flex gap-3 align-items-center">
          
          {/* 👋 Personalized greeting if user is logged in and not on home */}
          {user && !isHome && (
            <span className="text-light">Hi, {user.username}!</span>
          )}

          {/* 🔘 Logged-in user actions */}
          {onLogout ? (
            <>
              {/* 🕰 History button shown unless already on history page */}
              {showHistoryButton && (
                <button className="btn btn-outline-light" onClick={() => navigate('/history')}>
                  Game History
                </button>
              )}
              
              {/* 🏠 Home button if not already on home */}
              {showHomeButton && (
                <button className="btn btn-outline-light" onClick={() => navigate('/home')}>
                  Home Page
                </button>
              )}

              {/* 🔒 Logout not shown on demo */}
              {!isDemo && (
                <button className="btn btn-outline-light" onClick={onLogout}>
                  Logout
                </button>
              )}
            </>
          ) : (
            // 🧭 For demo/unauthenticated users, show Back to Login
            showBack && (
              <button className="btn btn-outline-light" onClick={() => navigate('/')}>
                Back to Login
              </button>
            )
          )}
        </div>
      </header>

      {/* 📄 Main content area (injects child page components) */}
      <main className="flex-fill container py-4">
        {children}
      </main>
    </div>
  );
}
