const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

let WORD_PAIRS = [
  ["pencil", "pen"],
  ["coffee", "tea"],
  ["river", "lake"],
  ["pizza", "burger"],
  ["moon", "star"],
  ["cat", "dog"],
  ["keyboard", "piano"],
  ["glasses", "goggles"],
];

async function loadWordPairs() {
  try {
    const response = await fetch('./words.json');
    if (!response.ok) throw new Error('Network response was not ok');
    WORD_PAIRS = await response.json();
    console.log('Word pairs loaded');
  } catch (err) {
    console.error('Failed to load word pairs:', err);
  }
}

// Call this once at the start
loadWordPairs();

const state = {
  players: [],
  undercoverCount: 1,
  blankCount: 0,
  words: null,
  phase: "setup", // setup -> reveal -> discuss -> vote 
  revealIndex: 0,
};

function save() {
  localStorage.setItem("undercover_state", JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem("undercover_state");
  if (!raw) return;
  try {
    Object.assign(state, JSON.parse(raw));
  } catch {}
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickWords() {
  const words = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
  const civilian = words[Math.random() < 0.5 ? 0 : 1];
  const undercover = civilian === words[0] ? words[1] : words[0];

  state.words = {
    civilian,
    undercover
  };
}

function assignRoles() {
  const n = state.players.length;

  if (n < 3) {
    alert("Need at least 3 players.");
    return false;
  }

  if (state.undercoverCount + state.blankCount >= n) {
    alert("Too many special roles.");
    return false;
  }

  pickWords();

  let roles = Array(n).fill("civilian");

  for (let i = 0; i < state.undercoverCount; i++)
    roles[i] = "undercover";

  for (let i = state.undercoverCount; i < state.undercoverCount + state.blankCount; i++)
    roles[i] = "blank";

  roles = shuffle(roles);

  state.players = state.players.map((name, i) => ({
    name,
    role: roles[i]
  }));

  state.phase = "reveal";
  state.revealIndex = 0;

  save();
  render();

  return true;
}

function resetAll() {
  Object.assign(state, {
    players: [],
    undercoverCount: 1,
    blankCount: 0,
    words: null,
    phase: "setup",
    revealIndex: 0
  });
  save();
  render();
}

function screenSetup() {
  const el = document.createElement('div');
  el.className = 'card grid';
  el.innerHTML = `
    <div class="grid" style="gap:12px">
      <div class="row" style="justify-content:space-between; align-items:center">
        <div class="tag">Players: <strong>${state.players.length}</strong></div>
        <div class="row">
          <button id="clearPlayers" class="ghost">Clear</button>
        </div>
      </div>
      <div class="row">
        <input id="playerName" placeholder="Add player name" autocomplete="off" />
        <button id="addPlayer" class="accent full">Add</button>
      </div>
      <div class="list" id="playerList"></div>
    </div>
    <hr/>
    <div class="grid two">
      <div class="card" style="padding:18px 6px;display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px">
        <label>Undercover</label>
        <input id="ucCount" type="number" min="1" max="3" value="${state.undercoverCount}" />
      </div>
      <div class="card" style="padding:6px;display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px">
        <label>Blank</label>
        <input id="blankCount" type="number" min="0" max="2" value="${state.blankCount}" />
      </div>
    </div>
    <button id="startBtn" class="full">Start & Reveal</button>
    <p class="small">Tip: Pass the phone. Each player taps <kbd>Reveal</kbd> to see their word privately.</p>
  `;

  el.querySelector('#addPlayer').onclick = () => {
    const name = qs('#playerName').value.trim();
    if (!name) return;
    state.players.push(name);
    qs('#playerName').value = '';
    save();
    render();
  };

  el.querySelector('#clearPlayers').onclick = () => {
    state.players = [];
    save();
    render();
  };

  el.querySelector('#ucCount').oninput = (e) => {
    state.undercoverCount = Math.max(1, Math.min(3, +e.target.value || 1));
    save();
  };

  el.querySelector('#blankCount').oninput = (e) => {
    state.blankCount = Math.max(0, Math.min(2, +e.target.value || 0));
    save();
  };

  el.querySelector('#startBtn').onclick = () => assignRoles();

  const list = el.querySelector('#playerList');

  state.players.forEach((name, idx) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `<span class="name">${name}</span><button class="bad" data-i="${idx}">Remove</button>`;
    item.querySelector('button').onclick = (e) => {
      const i = +e.currentTarget.dataset.i;
      state.players.splice(i, 1);
      save();
      render();
    };
    list.appendChild(item);
  });

  return el;
}

function screenReveal() {
  const i = state.revealIndex;
  const total = state.players.length;
  const p = state.players[i];
  const role = p.role;
  const word = role === 'civilian' ? state.words.civilian : role === 'undercover' ? state.words.undercover : '(blank)';

  const el = document.createElement('div');
  el.className = 'card reveal';
  el.innerHTML = `
    <div class="tag">${i+1} / ${total}</div>
    <div class="name">${p.name}</div>
    <div class="word">••••••</div>
    <div class="note">Role: ••••••</div>
    <div class="row">
      <button id="revealBtn" class="ghost">reveal</button>
      <button id="nextBtn" class="accent">Next</button>
    </div>
    <p class="small center">Keep your word secret. Describe it vaguely so others guess you’re legit.</p>
  `;

  el.querySelector('#revealBtn').onclick = () => {
    el.querySelector('.word').textContent = word;
    el.querySelector('.note').innerHTML = `Role: <span class="role">${role}</span>`;
  }

  el.querySelector('#nextBtn').onclick = () => {
    state.revealIndex++;
    if (state.revealIndex >= total) {
      state.phase = 'discuss';
    }
    save();
    render();
  };
  return el;
}

function screenDiscuss() {
  const el = document.createElement('div');
  el.className = 'grid';
  el.innerHTML = `
    <div class="card" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
      <h2 class="center" style="margin:0;">Discussion Phase</h2>
      <p class="small center">Talk it out. Then each player votes.</p>
      <div class="row" style="justify-content:center; margin-top:8px">
        <div class="tag">Civilians: <strong>${state.players.filter(p=>p.role==='civilian').length}</strong></div>
        <div class="tag">Undercovers: <strong>${state.players.filter(p=>p.role==='undercover').length}</strong></div>
        <div class="tag">Blanks: <strong>${state.players.filter(p=>p.role==='blank').length}</strong></div>
      </div>
    </div>
    <div class="card">
      <div class="list" id="roster"></div>
    </div>
  `;

  const roster = el.querySelector('#roster');
  const voteCount = el.querySelector('#voteCount');

  state.players.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <span class="name">${p.name}</span>
      <button class="ghost" data-i="${idx}">Vote</button>
    `;

    item.querySelector('button').onclick = (e) => {
      if (confirm(`Confirm eliminating ${p.name}?`)) {
        alert(`${p.name} (${p.role}) is eliminated!`);
        state.players = state.players.filter(w => w !== p);

        const civs = state.players.filter(p => p.role === 'civilian').length;
        const ucs = state.players.filter(p => p.role === 'undercover').length;

        if (ucs === 0) {
          alert('Civilians win!');
          resetAll();
          return;
        }

        if (ucs >= civs) {
          alert('Undercovers win!');
          resetAll();
          return;
        }

        state.phase = 'discuss';

        state.players.splice(idx, 1);
        roster.removeChild(roster.children[idx]);
      }

      save();
      render();
    };
    roster.appendChild(item);
  });

  return el;
}

function render() {
  const root = qs('#screen');
  root.innerHTML = '';
  let s = null;
  if (state.phase === 'setup') s = screenSetup();
  else if (state.phase === 'reveal') s = screenReveal();
  else s = screenDiscuss();
  root.appendChild(s);
}

let deferredPrompt = null;

qs('#resetLink').addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm("Reset the game?")) {
    resetAll();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

load();
render();