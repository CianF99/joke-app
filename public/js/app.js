// ============================================================
//  JokeByName — Client JS
//  All API calls go to our Express backend  (which uses Axios)
//  No React. No Vue. Pure vanilla JS.
// ============================================================

// ── Element refs ────────────────────────────────────────────
const form        = document.getElementById('joke-form');
const nameInput   = document.getElementById('name-input');
const submitBtn   = document.getElementById('submit-btn');
const loading     = document.getElementById('loading');
const resultSec   = document.getElementById('result-section');
const jokeCard    = document.getElementById('joke-card');
const resultName  = document.getElementById('result-name');
const resultCat   = document.getElementById('result-cat');
const btnAnother  = document.getElementById('btn-another');
const btnRandom   = document.getElementById('btn-random');
const btnShare    = document.getElementById('btn-share');
const toast       = document.getElementById('toast');

// ── State ────────────────────────────────────────────────────
let currentJoke   = null;   // last fetched joke object
let currentName   = '';     // last searched name

// ── Helpers ─────────────────────────────────────────────────
function showLoading(show) {
  loading.classList.toggle('hidden', !show);
  submitBtn.disabled = show;
}

function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className   = `toast ${type}`.trim();
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add('hidden'), 3000);
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Render a joke into the card ──────────────────────────────
function renderJoke(joke, id) {
  let inner = '';

  if (joke.type === 'twopart') {
    inner = `
      <p class="joke-setup">${escHtml(joke.setup)}</p>
      <div class="joke-delivery-wrap">
        <div class="joke-punchline-label">Punchline 🥁</div>
        <p class="joke-delivery">${escHtml(joke.delivery)}</p>
      </div>`;
  } else {
    inner = `<p class="joke-single">${escHtml(joke.joke)}</p>`;
  }

  jokeCard.innerHTML = inner + (id ? `<span class="joke-id">Joke #${id}</span>` : '');
  jokeCard.style.animation = 'none';
  // Force reflow to restart animation
  void jokeCard.offsetWidth;
  jokeCard.style.animation = 'fadeUp .4s ease both';
}

// ── Core: fetch joke by name ─────────────────────────────────
async function fetchJokeByName(name) {
  showLoading(true);
  resultSec.classList.add('hidden');

  try {
    const res  = await fetch(`/api/joke?name=${encodeURIComponent(name)}`);
    const json = await res.json();

    if (!json.ok) throw new Error(json.error || 'Unknown error');

    currentJoke = json.joke;
    currentName = json.name;

    // Update meta bar
    resultName.textContent = `Hey, ${json.name}! 👋`;
    resultCat.textContent  = json.category;

    // Render joke
    renderJoke(json.joke, json.id);

    // Show result
    resultSec.classList.remove('hidden');
    resultSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (err) {
    showToast('😬 ' + err.message, 'error');
  } finally {
    showLoading(false);
  }
}

// ── Core: fetch a completely random joke ─────────────────────
async function fetchRandomJoke() {
  showLoading(true);

  try {
    const res  = await fetch('/api/joke/random');
    const json = await res.json();

    if (!json.ok) throw new Error(json.error || 'Unknown error');

    currentJoke = json.joke;

    resultName.textContent = '🎲 Random joke!';
    resultCat.textContent  = json.category;

    renderJoke(json.joke, json.id);
    resultSec.classList.remove('hidden');
    resultSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (err) {
    showToast('😬 ' + err.message, 'error');
  } finally {
    showLoading(false);
  }
}

// ── Form submit ───────────────────────────────────────────────
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    showToast('Please enter your name first!', 'error');
    return;
  }
  fetchJokeByName(name);
});

// ── "Another joke" — re-fetch with same name ─────────────────
btnAnother.addEventListener('click', () => {
  if (currentName) {
    fetchJokeByName(currentName);
  } else {
    fetchRandomJoke();
  }
});

// ── Random joke button ────────────────────────────────────────
btnRandom.addEventListener('click', fetchRandomJoke);

// ── Copy joke to clipboard ────────────────────────────────────
btnShare.addEventListener('click', async () => {
  if (!currentJoke) return;

  let text = '';
  if (currentJoke.type === 'twopart') {
    text = `${currentJoke.setup}\n\n${currentJoke.delivery}`;
  } else {
    text = currentJoke.joke;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ Joke copied to clipboard!', 'success');
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('✅ Joke copied!', 'success');
  }
});

// ── Focus name input on page load ────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  nameInput.focus();
});
