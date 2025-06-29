// 🔐 login(username, password)
// Attempts to authenticate a user by sending credentials to the backend.
// Makes a POST request to the /api/login route with username and password in the request body.
// Uses `credentials: 'include'` to ensure session cookies are sent and received (important for login).
export async function login(username, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    credentials: 'include', // 🔑 Includes cookies (e.g., session ID) in the request
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }) // 👤 Send the user credentials as JSON
  });

  // ❌ If the server responds with a non-OK status (e.g. 401 Unauthorized), throw an error
  if (!res.ok) throw new Error('Login failed');

  // ✅ If successful, return the parsed JSON user object from the server (e.g. { id, username })
  return await res.json();
}

// 👀 getSession()
// Checks if a user is already logged in (i.e. has a valid session cookie).
// Sends a GET request to /api/session and includes cookies.
// If the session is valid, returns user data. If not, returns null.
export async function getSession() {
  const res = await fetch('/api/session', {
    credentials: 'include', // 🔐 Includes session cookie in the request
  });

  // ⚠️ If the response is not OK (likely 401 Unauthorized), return null (not logged in)
  if (!res.ok) return null;

  // ✅ If logged in, return the parsed JSON user object
  return await res.json();
}
