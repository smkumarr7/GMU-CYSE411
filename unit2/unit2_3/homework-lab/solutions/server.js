const express = require('express');

const app = express();

// !!! FIXING REFLECTED XSS
// !!! The following code fixes reflected XSS by replacing special characters in the `name` parameter with their corresponding HTML entities
// preventing malicious scripts from being executed when the parameter is reflected in the HTML response.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// CSP for all responses (defense-in-depth)
/// !!! The following code adds a Content Security Policy (CSP) header to all responses, restricting resource loading to the same origin and allowing scripts only from the same origin. 
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'"
  );
  next();
});

app.get('/login', (req, res) => {
  // !!! The following line checks if the application is running in production mode and sets the `secure` flag on the session cookie accordingly. 
  // This ensures that the cookie is only sent over HTTPS in production, while allowing it to work in development environments without HTTPS.
  const isProd = process.env.NODE_ENV === 'production';

  /// !!! The following code sets a secure session cookie with appropriate flags to enhance security.
  res.cookie('sessionId', 'SESSION-ABC-123', {
    httpOnly: true,       // JavaScript CANNOT access the cookie
    sameSite: 'lax',      // tests accept lax or strict --> Cookie only sent on safe requests
    secure: isProd        // true only in production (HTTPS expected). HTTP allowed if false (HTTP needed locally)
  });

  res.send(`
    <h1>Logged in</h1>
    <p>Secure session cookie set.</p>
    <a href="/profile?name=Guest">Go to profile</a>
  `);
});

app.get('/profile', (req, res) => {
  /// !!! The following code retrieves the `name` parameter from the query string, applies output encoding to prevent XSS, and then embeds it safely into the HTML response.
  const name = escapeHtml(req.query.name || 'Guest');

  res.send(`
    <h1>Profile</h1>
    <p>Hello ${name}</p>
    <p>Try XSS:</p>
    <pre>/profile?name=&lt;script&gt;alert(document.cookie)&lt;/script&gt;</pre>
  `);
});

const PORT = process.env.PORT || 3000;

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Secure app listening on http://localhost:${PORT}`);
  });
}
