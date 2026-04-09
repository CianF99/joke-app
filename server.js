// ================================================================
//  Joke-by-Name  —  Express.js + Node.js + Axios
//  Public API:   https://sv443.net/jokeapi/v2/
//
//  HOW IT WORKS
//  ─────────────────────────────────────────────────────────────
//  1. User submits their name via the HTML form (GET /joke)
//  2. Express picks a joke category based on a hash of the name
//  3. Axios fetches a joke from JokeAPI (server-side HTTP call)
//  4. Server sends back JSON  →  client JS renders it
//  5. A second route GET /joke/random always returns a random joke
// ================================================================

const express = require('express');
const axios   = require('axios');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Axios instance pre-configured for JokeAPI ────────────────
const jokeClient = axios.create({
  baseURL: 'https://v2.jokeapi.dev',
  timeout: 8_000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'JokeByName/1.0',
  },
});

// ── Static files + JSON body parser ──────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Helper: pick a category deterministically from a name ────
const CATEGORIES = [
  'Programming',
  'Misc',
  'Pun',
  'Spooky',
  'Christmas',
  'Dark',
];

function categoryForName(name) {
  // Simple hash: sum of char codes mod number-of-categories
  const hash = [...name.toLowerCase()]
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CATEGORIES[hash % CATEGORIES.length];
}

// ── Route: serve the SPA shell ────────────────────────────────
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Route: GET /api/joke?name=Alice ──────────────────────────
//    Fetches a personalised joke for the given name.
//    The category is derived from the name so the same person
//    always gets the same *type* of humour (fun detail!).
app.get('/api/joke', async (req, res) => {
  const name = (req.query.name || '').trim();

  if (!name) {
    return res.status(400).json({ ok: false, error: 'Please enter your name.' });
  }
  if (name.length > 60) {
    return res.status(400).json({ ok: false, error: 'Name is too long (max 60 chars).' });
  }

  const category = categoryForName(name);

  try {
    // ── Axios GET — the key integration point ────────────────
    const { data } = await jokeClient.get(`/joke/${category}`, {
      params: {
        blacklistFlags: 'nsfw,racist,sexist',  // keep it clean
        amount: 1,
        safe: true,
      },
    });

    if (data.error) {
      // JokeAPI itself returned an error object
      return res.status(502).json({ ok: false, error: data.message || 'JokeAPI error.' });
    }

    // Normalise: JokeAPI has two joke types — "single" and "twopart"
    const joke = data.type === 'twopart'
      ? { type: 'twopart', setup: data.setup, delivery: data.delivery }
      : { type: 'single',  joke: data.joke };

    res.json({ ok: true, name, category, joke, id: data.id });

  } catch (err) {
    console.error('[JokeAPI]', err.message);
    const status = err.response?.status || 500;
    res.status(status).json({ ok: false, error: 'Could not reach JokeAPI. Try again.' });
  }
});

// ── Route: GET /api/joke/random  (no name needed) ────────────
app.get('/api/joke/random', async (_req, res) => {
  try {
    const { data } = await jokeClient.get('/joke/Any', {
      params: { blacklistFlags: 'nsfw,racist,sexist', safe: true },
    });
    if (data.error) return res.status(502).json({ ok: false, error: data.message });

    const joke = data.type === 'twopart'
      ? { type: 'twopart', setup: data.setup, delivery: data.delivery }
      : { type: 'single',  joke: data.joke };

    res.json({ ok: true, category: data.category, joke, id: data.id });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Could not reach JokeAPI.' });
  }
});

// ── Route: GET /api/categories  (used by client filters) ─────
app.get('/api/categories', (_req, res) => {
  res.json({ ok: true, data: CATEGORIES });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`😂  Joke-by-Name running → http://localhost:${PORT}`);
});
