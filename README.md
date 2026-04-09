# 😂 JokeByName

> **Roll Nos. 1–9 Assignment** — A personalised joke website using **JokeAPI v2**, built with **Express.js**, **Node.js** & **Axios**.

---

## ✨ What it does

Enter your name → the server hashes it to pick a **joke category** → **Axios** fetches a joke from JokeAPI on the server → you get a personalised joke every time!

Same name = same category (deterministic), so *your* humour type is tied to *your* name.

---

## 🗂️ Project Structure

```
joke-app/
├── server.js              ← Express server + Axios API calls
├── package.json
├── .gitignore
├── README.md
└── public/
    ├── index.html         ← Pure HTML frontend (no React/Vue)
    ├── css/
    │   └── style.css      ← Full custom stylesheet
    └── js/
        └── app.js         ← Vanilla JS client logic
```

---

## 🔁 Architecture

```
Browser (fetch)
      │
      ▼  GET /api/joke?name=Alice
Express (server.js)
      │  hash("alice") → category = "Pun"
      │
      ▼  Axios GET https://v2.jokeapi.dev/joke/Pun
JokeAPI v2
      │
      ▼  JSON { type, joke / setup+delivery }
Express → clean JSON response
      │
      ▼
Client JS renders joke card
```

---

## 🛠️ Express API Endpoints

| Route | Method | Description |
|---|---|---|
| `/api/joke?name=NAME` | GET | Personalised joke for a name |
| `/api/joke/random` | GET | Completely random joke |
| `/api/categories` | GET | List of joke categories |

---

## 🚀 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm run dev        # dev mode (nodemon)
npm start          # production

# 3. Open browser
# http://localhost:3000
```

No API key needed — JokeAPI is completely free!

---

## ☁️ Deploy to GitHub + Render

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: JokeByName"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/joke-app.git
git push -u origin main
```

### Deploy on Render (free)
1. [render.com](https://render.com) → **New → Web Service**
2. Connect your repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Deploy — live in ~2 minutes!

---

## 📚 Objectives Covered

- ✅ **Public API integration** — JokeAPI v2 (`https://sv443.net/jokeapi/v2/`)
- ✅ **Express.js server-side programming** — multiple routes, middleware
- ✅ **Axios HTTP client** — pre-configured instance, params, error handling
- ✅ **Client-server communication** — browser `fetch` → Express → Axios → JokeAPI
- ✅ **Data manipulation** — name hashing for category, normalising joke types
- ✅ **User-friendly presentation** — loading state, copy button, toast notifications
- ✅ **Pure HTML/CSS/JS frontend** — no React, no frameworks

---

## 📄 License
MIT
