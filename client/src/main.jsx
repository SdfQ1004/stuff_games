// ✅ React core functionality
import { StrictMode } from 'react'; // Helps identify potential problems in app (recommended for dev mode)
import { createRoot } from 'react-dom/client'; // Modern React DOM rendering API

// 📦 Main app component
import App from './App.jsx';

// 🎨 Global styles
import './index.css'; // Custom global CSS styles for "Bad Dreams" theme
import 'bootstrap/dist/css/bootstrap.min.css'; // Loads Bootstrap's prebuilt styles (buttons, layout, etc.)

// 🚀 Entry point: render <App /> inside the HTML div#root
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> {/* All routing and logic begins here */}
  </StrictMode>
);
