const RULES = [
  {id:'obj',icon:'🎯',name:'Objective',desc:'Goal of the game',html:`<div class="d-icon">🎯</div><div class="d-title">Objective</div><div class="r-block"><div class="r-label">Goal</div><div class="r-body">Score as many points as possible before the train reaches North Station. The player with the <strong>highest score</strong> wins!</div></div><div class="r-block"><div class="r-label">How you score</div><div class="r-body"><strong>Positive:</strong> every card you meld adds to your score.<br><br><strong>Negative:</strong> cards left in hand are <em>subtracted</em> as penalties.</div></div>`},
  {id:'deal',icon:'🃏',name:'Setup & Deal',desc:'Starting a round',html:`<div class="d-icon">🃏</div><div class="d-title">Setup & Deal</div><div class="r-block"><div class="r-label">Decks</div><div class="r-body">Use <strong>2 standard 52-card decks</strong> (104 cards total). No jokers.</div></div><div class="r-block"><div class="r-label">Dealing</div><div class="r-body">Each player receives <strong>14 cards</strong>. Flip one card to start the discard pile.</div></div><div class="r-block"><div class="r-label">First player</div><div class="r-body">Player to the dealer's left goes first. Play is <strong>clockwise</strong>.</div></div>`},
  {id:'turn',icon:'🔄',name:'Taking a Turn',desc:'Draw, meld, discard',html:`<div class="d-icon">🔄</div><div class="d-title">Taking a Turn</div><div class="r-block"><div class="r-label">1 — Draw</div><div class="r-body">Take the top card from the draw pile, or take the <strong>entire discard pile</strong> (must immediately use top card in a new meld).</div></div><div class="r-block"><div class="r-label">2 — Meld</div><div class="r-body">Lay down <strong>sets</strong> or <strong>sequences</strong>, and/or add to existing melds.</div></div><div class="r-block"><div class="r-label">3 — Discard</div><div class="r-body">End your turn by placing one card face-up on the discard pile.</div></div>`},
  {id:'melds',icon:'🤝',name:'Melds',desc:'Sets & sequences',html:`<div class="d-icon">🤝</div><div class="d-title">Melds</div><div class="r-block"><div class="r-label">Set</div><div class="r-body">3+ cards of the <strong>same rank</strong>, different suits.<br>Example: <span class="rtag">7♠</span> <span class="rtag">7♥</span> <span class="rtag">7♣</span></div></div><div class="r-block"><div class="r-label">Sequence</div><div class="r-body">3+ cards of the <strong>same suit</strong> in order.<br>Example: <span class="rtag">4♥</span> <span class="rtag">5♥</span> <span class="rtag">6♥</span></div></div><div class="r-block"><div class="r-label">First meld rule</div><div class="r-body">Your first meld must total at least <span class="rtag">51 points</span>.</div></div>`},
  {id:'score',icon:'🔢',name:'Scoring',desc:'Positive & penalty values',html:`<div class="d-icon">🔢</div><div class="d-title">Scoring</div><div class="r-block"><div class="r-label">Melded cards (positive)</div><div class="cv-tbl"><div class="cv-row"><div class="cv-c hd">Card</div><div class="cv-c hd">Points</div></div><div class="cv-row"><div class="cv-c">Ace high (Q–K–A)</div><div class="cv-c">+15</div></div><div class="cv-row"><div class="cv-c">Ace low (A–2–3)</div><div class="cv-c">+5</div></div><div class="cv-row"><div class="cv-c">J, Q, K, 10</div><div class="cv-c">+10</div></div><div class="cv-row"><div class="cv-c">2–9</div><div class="cv-c">+5</div></div></div></div><div class="r-block"><div class="r-label">Hand cards (penalty)</div><div class="cv-tbl"><div class="cv-row"><div class="cv-c hd">Card</div><div class="cv-c hd">Penalty</div></div><div class="cv-row"><div class="cv-c">Ace</div><div class="cv-c">−15</div></div><div class="cv-row"><div class="cv-c">J, Q, K, 10</div><div class="cv-c">−10</div></div><div class="cv-row"><div class="cv-c">2–9</div><div class="cv-c">−5</div></div></div></div>`},
  {id:'out',icon:'🚪',name:'Going Out',desc:'Ending a round',html:`<div class="d-icon">🚪</div><div class="d-title">Going Out</div><div class="r-block"><div class="r-label">How</div><div class="r-body">Play all cards from your hand by melding/extending. Your last card is discarded or added to a meld.</div></div><div class="r-block"><div class="r-label">Remi!</div><div class="r-body">Meld all cards in a <strong>single turn</strong> with no prior melds — all others take <span class="rtag r">double penalties</span>.</div></div>`},
  {id:'special',icon:'⭐',name:'Special Rules',desc:'Edge cases & tips',html:`<div class="d-icon">⭐</div><div class="d-title">Special Rules</div><div class="r-block"><div class="r-label">Empty draw pile</div><div class="r-body">Shuffle the discard pile (except top card) to form a new draw pile.</div></div><div class="r-block"><div class="r-label">Ace</div><div class="r-body">High (Q–K–A) = <span class="rtag g">+15</span>, low (A–2–3) = <span class="rtag g">+5</span>. No wrap-around. Always <span class="rtag r">−15</span> in hand.</div></div>`},
];

// ── State ──────────────────────────────────────────────────────────────────
let sb = null;
let adminCode = 'asaf';
let supportEmail = '';

// players = [{id, name, total}] for current game
// playerRecords = [{id, display_name}] — full global roster
let players = [], playerRecords = [], rounds = [];
let focusedPlayer = null;
let currentRoom = null, currentGameId = null, currentPassword = null;
let syncInterval = null, lastSyncTime = 0;

// ── Supabase ───────────────────────────────────────────────────────────────
function getSupabase() {
  if (sb) return sb;
  const { supabaseUrl, supabaseAnonKey } = window.APP_CONFIG || {};
  if (!supabaseUrl || supabaseUrl.includes('PASTE_YOUR')) {
    throw new Error('Add your Supabase URL and anon key to APP_CONFIG in index.html');
  }
  sb = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
  return sb;
}

// ── Session persistence (survive refresh) ─────────────────────────────────
function saveSession() {
  if (!currentRoom || !currentGameId) return;
  sessionStorage.setItem('tr_session', JSON.stringify({
    room: currentRoom, gameId: currentGameId
  }));
  // Keep ?room= in the URL so the link is shareable
  const url = new URL(window.location.href);
  url.searchParams.set('room', currentRoom);
  history.replaceState(null, '', url.toString());
}

function clearSession() {
  sessionStorage.removeItem('tr_session');
  history.replaceState(null, '', window.location.pathname);
}

async function maybeRestoreSession() {
  try {
    const raw = sessionStorage.getItem('tr_session');
    if (!raw) return;
    const { room, gameId } = JSON.parse(raw);
    if (!room || !gameId) return;

    showToast('Resuming game…');
    const state = await loadGameState(room);
    if (!state) { clearSession(); return; }

    currentRoom = room;
    currentGameId = gameId;
    players = state.players;
    rounds = state.rounds;
    setGameEnded(false); startSync(); showScreen('game'); render();
  } catch (e) {
    clearSession();
  }
}

// ── Storage ────────────────────────────────────────────────────────────────

async function saveGameState() {
  if (!currentGameId) return;
  const client = getSupabase();
  await client.from('game_rooms')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', currentGameId);
}

async function loadGameState(code) {
  const client = getSupabase();
  const { data: room } = await client.from('game_rooms')
    .select('id, room_code, status, updated_at')
    .eq('room_code', code)
    .eq('status', 'active')
    .maybeSingle();
  if (!room) return null;

  const { data: gamePlayers } = await client.from('game_players')
    .select('player_id, joined_at_round, sort_order, players(display_name)')
    .eq('game_id', room.id)
    .order('sort_order');

  const { data: scores } = await client.from('round_scores')
    .select('round_number, player_id, score')
    .eq('game_id', room.id)
    .order('round_number');

  const playerList = (gamePlayers || []).map(gp => ({
    id: gp.player_id,
    name: gp.players.display_name,
    joinedAtRound: gp.joined_at_round,
    total: 0
  }));

  const maxRound = scores?.length ? Math.max(...scores.map(s => s.round_number)) : 0;
  const roundsArr = [];
  for (let r = 1; r <= maxRound; r++) {
    const row = playerList.map(p => {
      const s = scores.find(sc => sc.round_number === r && sc.player_id === p.id);
      return s ? s.score : null;
    });
    roundsArr.push(row);
  }
  playerList.forEach((p, i) => {
    p.total = roundsArr.reduce((sum, r) => sum + (r[i] ?? 0), 0);
  });

  return { players: playerList, rounds: roundsArr, updatedAt: new Date(room.updated_at).getTime() };
}

async function saveGameToHistory(winner, finalPlayers, numRounds) {
  const client = getSupabase();
  const numP = finalPlayers.length;
  const legStarts = [0];
  for (let pi = 0; pi < numP; pi++) {
    const first = rounds.findIndex(r => r[pi] !== null);
    if (first > 0 && !legStarts.includes(first)) legStarts.push(first);
  }
  legStarts.sort((a, b) => a - b);
  const legs = legStarts.map((start, i) => ({ start, end: legStarts[i + 1] || rounds.length }));

  const legSummaries = legs.map(leg => {
    const legRounds = rounds.slice(leg.start, leg.end);
    const activePlayers = finalPlayers.map((p, pi) => ({ ...p, pi }))
      .filter(p => legRounds.some(r => r[p.pi] !== null));
    const legTotals = activePlayers
      .map(p => ({ name: p.name, legTotal: legRounds.reduce((sum, r) => sum + (r[p.pi] || 0), 0) }))
      .sort((a, b) => b.legTotal - a.legTotal);
    const roundWins = {};
    activePlayers.forEach(p => roundWins[p.name] = 0);
    legRounds.forEach(r => {
      let best = -Infinity, bestIdx = -1;
      r.forEach((s, i) => { if (s !== null && s > best) { best = s; bestIdx = i; } });
      if (bestIdx >= 0) roundWins[finalPlayers[bestIdx].name] = (roundWins[finalPlayers[bestIdx].name] || 0) + 1;
    });
    return {
      winner: legTotals[0]?.name,
      rounds: legRounds.length,
      players: legTotals.map(p => ({ ...p, roundWins: roundWins[p.name] || 0 }))
    };
  });

  const { error: histError } = await client.from('game_history').insert({
    game_id: currentGameId,
    room_code: currentRoom,
    winner_name: winner.name,
    winner_score: winner.total,
    rounds_count: numRounds,
    player_names: finalPlayers.map(p => p.name),
    legs_json: legSummaries
  });
  if (histError) console.warn('game_history insert:', histError.message);

  if (currentGameId) {
    await client.from('game_rooms').update({ status: 'ended' }).eq('id', currentGameId);
  }
}

async function loadHistory() {
  const client = getSupabase();
  const { data } = await client.from('game_history').select('*').order('played_at', { ascending: false });
  return (data || []).map(g => {
    const legs = g.legs_json || [];
    const playerTotals = {};
    legs.forEach(leg => {
      (leg.players || []).forEach(p => {
        playerTotals[p.name] = (playerTotals[p.name] || 0) + (p.legTotal || 0);
      });
    });
    return {
      date: new Date(g.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ts: new Date(g.played_at).getTime(),
      winner: g.winner_name,
      winnerScore: g.winner_score,
      players: g.player_names.map(name => ({ name, total: playerTotals[name] || 0 })),
      legs,
      rounds: g.rounds_count,
      room: g.room_code,
      gameId: g.game_id
    };
  });
}

// ── App settings & roster loading ─────────────────────────────────────────

async function loadAppSettings() {
  try {
    const client = getSupabase();
    const { data } = await client.from('app_settings').select('admin_code, support_email').single();
    if (data?.admin_code) adminCode = data.admin_code.toLowerCase();
    if (data?.support_email) { supportEmail = data.support_email; renderFeedbackLink(); }
  } catch (e) {}
}

function renderFeedbackLink() {
  const el = document.getElementById('feedback-link');
  if (!el) return;
  if (supportEmail) {
    el.onclick = () => { window.location.href = `mailto:${supportEmail}?subject=Train Rummy feedback`; };
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}

async function loadPlayerRoster() {
  try {
    const client = getSupabase();
    const { data, error } = await client.from('players')
      .select('id, display_name')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    playerRecords = data || [];
    renderPlayerChips();
  } catch (e) {
    console.error('loadPlayerRoster failed:', e);
    document.getElementById('player-chips').innerHTML =
      `<div class="chips-loading" style="color:var(--red)">Could not load players: ${e.message}</div>`;
  }
}

async function saveNewPlayerToRoster(name) {
  const client = getSupabase();
  const maxOrder = playerRecords.length ? playerRecords.length + 1 : 1;
  const { data, error } = await client.from('players')
    .insert({ display_name: name, sort_order: maxOrder })
    .select('id, display_name')
    .single();
  if (error) throw error;
  playerRecords.push(data);
  return data;
}

// ── Player chip UI ─────────────────────────────────────────────────────────

const selectedPlayerIds = new Set();

function renderPlayerChips() {
  const container = document.getElementById('player-chips');
  container.innerHTML = '';
  playerRecords.forEach(p => {
    const chip = document.createElement('button');
    chip.className = 'player-chip' + (selectedPlayerIds.has(p.id) ? ' selected' : '');
    chip.textContent = p.display_name;
    chip.onclick = () => toggleChip(p.id, chip);
    container.appendChild(chip);
  });
}

function toggleChip(id, el) {
  if (selectedPlayerIds.has(id)) {
    selectedPlayerIds.delete(id);
    el.classList.remove('selected');
  } else {
    selectedPlayerIds.add(id);
    el.classList.add('selected');
  }
}

function getSelectedPlayers() {
  return playerRecords.filter(p => selectedPlayerIds.has(p.id));
}

// ── New player sheet (setup) ───────────────────────────────────────────────

function openAddPlayerSheet() {
  document.getElementById('new-player-inp').value = '';
  document.getElementById('newplayer-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('new-player-inp').focus(), 100);
}
function closeNewPlayer() { document.getElementById('newplayer-overlay').style.display = 'none'; }
function maybeCloseNewPlayer(e) { if (e.target === document.getElementById('newplayer-overlay')) closeNewPlayer(); }

async function saveNewPlayer() {
  const name = document.getElementById('new-player-inp').value.trim();
  if (!name) { showToast('Enter a name'); return; }
  if (playerRecords.some(p => p.display_name.toLowerCase() === name.toLowerCase())) {
    showToast('Player already exists'); return;
  }
  try {
    const record = await saveNewPlayerToRoster(name);
    selectedPlayerIds.add(record.id);
    renderPlayerChips();
    closeNewPlayer();
    showToast(`${name} added!`);
  } catch (e) {
    showToast('Could not save player');
  }
}

// ── Animations ─────────────────────────────────────────────────────────────

function playTrainAnimation() {
  const overlay = document.getElementById('train-overlay');
  overlay.classList.add('running');
  overlay.addEventListener('animationend', () => overlay.classList.remove('running'), { once: true });
}

function playConfetti() {
  const crown = document.getElementById('win-crown');
  if (crown) { crown.classList.remove('animate'); void crown.offsetWidth; crown.classList.add('animate'); }
  if (typeof confetti !== 'function') return;
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#b07a20','#1b6e3f','#b52a1f','#f5f0e8','#ffffff'] });
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 }, angle: 60 }), 350);
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 }, angle: 120 }), 700);
}

// ── Screen routing ─────────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'stats') renderStats();
  if (id === 'game') playTrainAnimation();
  if (id === 'winner') playConfetti();
}

// ── Room / Sync ────────────────────────────────────────────────────────────

function genRoomCode() {
  const w = ['TRAIN', 'NORTH', 'RUMMY', 'CARDS', 'DEALT', 'MELD'];
  return w[Math.floor(Math.random() * w.length)] + '-' + Math.floor(1000 + Math.random() * 9000);
}

async function joinRoom() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (!code) { showToast('Enter a room code'); return; }

  showToast('Joining…');
  const client = getSupabase();

  const { data: room } = await client.from('game_rooms')
    .select('id, room_code, status')
    .eq('room_code', code)
    .eq('status', 'active')
    .maybeSingle();

  if (!room) { showToast('Room not found'); return; }

  const state = await loadGameState(code);
  if (!state) { showToast('Room not found'); return; }

  currentRoom = code;
  currentGameId = room.id;
  players = state.players;
  rounds = state.rounds;
  saveSession();
  setGameEnded(false); startSync(); showScreen('game'); render();
}

// Password prompt overlay (for resume-game flow if we ever need it)
let _pendingJoinCode = null;
function openPasswordPrompt(code) {
  _pendingJoinCode = code;
  document.getElementById('prompt-password').value = '';
  document.getElementById('prompt-error').style.display = 'none';
  document.getElementById('password-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('prompt-password').focus(), 100);
}
function closePasswordPrompt() {
  document.getElementById('password-overlay').style.display = 'none';
  _pendingJoinCode = null;
}
function maybeClosePasswordPrompt(e) {
  if (e.target === document.getElementById('password-overlay')) closePasswordPrompt();
}
async function submitPasswordPrompt() {
  const password = document.getElementById('prompt-password').value.trim();
  if (!password) return;
  const code = _pendingJoinCode;
  closePasswordPrompt();

  const client = getSupabase();
  const { data: room } = await client.from('game_rooms')
    .select('id, room_code, status, room_password')
    .eq('room_code', code)
    .eq('status', 'active')
    .maybeSingle();

  if (!room) { showToast('Room not found'); return; }
  if (room.room_password && room.room_password !== password) {
    document.getElementById('prompt-error').style.display = 'block';
    openPasswordPrompt(code); return;
  }

  const state = await loadGameState(code);
  if (!state) { showToast('Room not found'); return; }
  currentRoom = code;
  currentGameId = room.id;
  currentPassword = password;
  players = state.players;
  rounds = state.rounds;
  saveSession();
  setGameEnded(false); startSync(); showScreen('game'); render();
}

async function syncNow() {
  if (!currentRoom) return;
  const state = await loadGameState(currentRoom);
  if (!state) return;
  players = state.players; rounds = state.rounds;
  renderScoreboard(); renderHistory();
  document.getElementById('round-lbl').textContent = `Round ${rounds.length + 1}`;
  lastSyncTime = Date.now(); setSyncDot(true);
}

function startSync() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(async () => {
    if (!currentRoom) return;
    const state = await loadGameState(currentRoom);
    if (!state) return;
    if (state.updatedAt > lastSyncTime) {
      players = state.players; rounds = state.rounds;
      renderScoreboard(); renderHistory();
      document.getElementById('round-lbl').textContent = `Round ${rounds.length + 1}`;
      lastSyncTime = state.updatedAt; setSyncDot(true);
    }
  }, 4000);
}

function setSyncDot(fresh) {
  const d = document.getElementById('sync-dot');
  if (d) d.className = 'sync-dot' + (fresh ? '' : ' stale');
}

// ── Game ───────────────────────────────────────────────────────────────────

async function startGame() {
  const selected = getSelectedPlayers();
  if (selected.length < 2) { showToast('Select at least 2 players'); return; }

  currentRoom = genRoomCode();
  const client = getSupabase();

  const { data: room, error } = await client.from('game_rooms')
    .insert({ room_code: currentRoom, status: 'active' })
    .select('id')
    .single();
  if (error) { showToast('Could not create game'); return; }
  currentGameId = room.id;

  await client.from('game_players').insert(
    selected.map((p, i) => ({ game_id: currentGameId, player_id: p.id, joined_at_round: 0, sort_order: i }))
  );

  players = selected.map(p => ({ id: p.id, name: p.display_name, total: 0, joinedAtRound: 0 }));
  rounds = [];
  saveSession();
  setGameEnded(false); startSync(); showScreen('game'); render();
}

function render() {
  renderScoreboard(); renderEntries(); renderHistory();
  document.getElementById('round-lbl').textContent = `Round ${rounds.length + 1}`;
  const inlineBadge = document.getElementById('room-badge-inline');
  if (inlineBadge) inlineBadge.textContent = currentRoom || '';
}

function renderScoreboard() {
  const sorted = players.map((p, i) => ({ ...p, i })).sort((a, b) => b.total - a.total);
  const board = document.getElementById('scoreboard'); board.innerHTML = '';
  sorted.forEach((p, rank) => {
    const hist = rounds.map(r => r[p.i]);
    const chips = hist.slice(-6).map(s =>
      s === null ? '' : `<span class="chip ${s > 0 ? 'pos' : s < 0 ? 'neg' : ''}">${s > 0 ? '+' + s : s}</span>`
    ).join(' ');
    const d = document.createElement('div');
    const isLeader = rank === 0 && rounds.length > 0;
    d.className = 'p-row' + (isLeader ? ' leader' : '');
    d.innerHTML = `<div class="p-rank">${rank + 1}</div>
      <div class="p-info">
        <div class="p-name">${p.name}${isLeader ? ' 👑' : ''}</div>
        <div class="p-chips">${chips || '<span style="color:var(--text-4)">—</span>'}</div>
      </div>
      <div class="p-total">${p.total}</div>`;
    board.appendChild(d);
  });
}

function renderEntries() {
  const c = document.getElementById('entries'); c.innerHTML = '';
  players.forEach((p, i) => {
    const d = document.createElement('div'); d.className = 'e-card';
    d.innerHTML = `<div class="e-name">${p.name}</div>
      <div class="e-inp-row">
        <button class="e-sign-btn" id="esign${i}" type="button" onclick="toggleSign(${i})">+</button>
        <input class="e-inp" type="text" id="e${i}" placeholder="0" inputmode="numeric" pattern="[0-9]*" autocomplete="off" autocorrect="off" autocapitalize="none">
      </div>
      <div class="e-hint" id="ehint${i}"></div>`;
    c.appendChild(d);
    setTimeout(() => {
      const inp = document.getElementById('e' + i);
      if (inp) {
        inp.addEventListener('focus', () => { focusedPlayer = i; clearEntryError(i); });
        inp.addEventListener('blur', () => validateEntry(i));
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const nx = document.getElementById('e' + (i + 1));
            if (nx) nx.focus(); else inp.blur();
          }
        });
      }
    }, 0);
  });
}

function toggleSign(i) {
  const btn = document.getElementById('esign' + i);
  const inp = document.getElementById('e' + i);
  if (!btn || !inp) return;
  const isNeg = btn.classList.toggle('neg');
  btn.textContent = isNeg ? '−' : '+';
  inp.classList.toggle('neg', isNeg);
}

function validateEntry(i) {
  const inp = document.getElementById('e' + i);
  const hint = document.getElementById('ehint' + i);
  if (!inp || !hint) return;
  const raw = inp.value.trim();
  if (!raw) { clearEntryError(i); return; }
  const val = parseInt(raw);
  if (isNaN(val) || val % 5 !== 0) {
    inp.classList.add('invalid');
    hint.textContent = 'Must be a multiple of 5';
  } else {
    clearEntryError(i);
  }
}

function clearEntryError(i) {
  document.getElementById('e' + i)?.classList.remove('invalid');
  const hint = document.getElementById('ehint' + i);
  if (hint) hint.textContent = '';
}

async function submitRound() {
  const client = getSupabase();
  const roundNum = rounds.length + 1;
  const scores = players.map((_, i) => {
    const val = Math.abs(parseInt(document.getElementById('e' + i)?.value) || 0);
    const neg = document.getElementById('esign' + i)?.classList.contains('neg');
    return neg ? -val : val;
  });

  const bad = scores.map((s, i) => s % 5 !== 0 ? players[i].name : null).filter(Boolean);
  if (bad.length) {
    showToast(`Scores must be divisible by 5 (${bad.join(', ')})`, 3500);
    return;
  }

  const inserts = players.map((p, i) => ({
    game_id: currentGameId,
    round_number: roundNum,
    player_id: p.id,
    score: scores[i]
  }));
  await client.from('round_scores').insert(inserts);

  rounds.push(scores);
  players.forEach((p, i) => p.total += scores[i]);
  await saveGameState(); render();
  players.forEach((_, i) => {
    const inp = document.getElementById('e' + i);
    if (inp) { inp.value = ''; inp.classList.remove('neg'); }
    const btn = document.getElementById('esign' + i);
    if (btn) { btn.classList.remove('neg'); btn.textContent = '+'; }
    clearEntryError(i);
  });
  focusedPlayer = null;
  window.scrollTo({ top: 0, behavior: 'smooth' }); setSyncDot(true);
}

async function undoRound() {
  if (!rounds.length) { showToast('Nothing to undo'); return; }
  const client = getSupabase();
  const roundNum = rounds.length;
  await client.from('round_scores')
    .delete()
    .eq('game_id', currentGameId)
    .eq('round_number', roundNum);

  const last = rounds.pop();
  players.forEach((p, i) => { if (last[i] !== null) p.total -= last[i]; });
  await saveGameState(); render(); showToast('Round undone ↩');
}

function renderHistory() {
  const inner = document.getElementById('hist-inner');
  if (!rounds.length) {
    inner.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-4);font-size:13px">No rounds yet</div>';
    return;
  }
  const hdr = `<div class="h-row h-head"><div class="hc rn">#</div>${players.map(p => `<div class="hc">${p.name.split(' ')[0]}</div>`).join('')}</div>`;
  const rows = [...rounds].reverse().map((r, ri) => {
    const n = rounds.length - ri;
    return `<div class="h-row"><div class="hc rn">${n}</div>${r.map(s =>
      s === null
        ? `<div class="hc" style="color:var(--text-4)">—</div>`
        : `<div class="hc ${s > 0 ? 'pos' : s < 0 ? 'neg' : ''}">${s > 0 ? '+' + s : s}</div>`
    ).join('')}</div>`;
  }).join('');
  inner.innerHTML = hdr + rows;
}


function setGameEnded(ended) {
  document.getElementById('end-btn').style.display = ended ? 'none' : '';
  document.getElementById('undo-btn').style.display = ended ? 'none' : '';
  document.getElementById('add-players-btn').style.display = ended ? 'none' : '';
  document.getElementById('entry-panel').style.display = ended ? 'none' : '';
  document.getElementById('back-to-home').style.display = ended ? '' : 'none';
}

// ── Add Players (mid-game) ─────────────────────────────────────────────────

function openAddPlayers() {
  const cur = document.getElementById('ap-current');
  cur.innerHTML = '';
  players.forEach(p => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--card2);border:1.5px solid var(--border);border-radius:12px;padding:12px 16px;gap:10px';
    row.innerHTML = `
      <span style="font-size:15px;font-weight:600;color:var(--text);flex:1">${p.name}</span>
      <span style="font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:var(--amber)">${p.total}</span>
      <button class="del-btn" style="border-color:var(--red);color:var(--red)" onclick="removePlayerFromGame('${p.id}','${p.name.replace(/'/g,"\\'")}',this.closest('[style]'))">✕</button>`;
    cur.appendChild(row);
  });

  const existing = new Set(players.map(p => p.id));
  const chipsEl = document.getElementById('ap-chips');
  chipsEl.innerHTML = '';
  playerRecords.filter(p => !existing.has(p.id)).forEach(p => {
    const chip = document.createElement('button');
    chip.className = 'player-chip';
    chip.textContent = p.display_name;
    chip.dataset.id = p.id;
    chip.dataset.name = p.display_name;
    chip.onclick = () => chip.classList.toggle('selected');
    chipsEl.appendChild(chip);
  });
  if (!chipsEl.children.length) {
    chipsEl.innerHTML = '<span style="font-size:13px;color:var(--text-4)">All roster players are already in the game</span>';
  }

  document.getElementById('ap-new-list').innerHTML = '';
  document.getElementById('addplayers-overlay').style.display = 'flex';
}

function apAddRow(name = '') {
  const nl = document.getElementById('ap-new-list');
  const row = document.createElement('div'); row.className = 'player-row';
  row.innerHTML = `<input class="player-inp" type="text" placeholder="New player name" value="${name}" autocorrect="off">
    <button class="del-btn" onclick="this.parentElement.remove()">✕</button>`;
  nl.appendChild(row);
}

function closeAddPlayers() { document.getElementById('addplayers-overlay').style.display = 'none'; }
function maybeCloseAddPlayers(e) { if (e.target === document.getElementById('addplayers-overlay')) closeAddPlayers(); }

async function confirmAddPlayers() {
  const client = getSupabase();
  const existing = new Set(players.map(p => p.id));
  const toAdd = [];

  document.querySelectorAll('#ap-chips .player-chip.selected').forEach(chip => {
    const rec = playerRecords.find(p => p.id === chip.dataset.id);
    if (rec && !existing.has(rec.id)) toAdd.push({ id: rec.id, name: rec.display_name });
  });

  const newNames = [...document.querySelectorAll('#ap-new-list .player-inp')]
    .map(i => i.value.trim()).filter(Boolean);
  for (const name of newNames) {
    if (playerRecords.some(p => p.display_name.toLowerCase() === name.toLowerCase())) {
      showToast(`${name} is already in the roster — select from chips above`);
      return;
    }
    const record = await saveNewPlayerToRoster(name);
    toAdd.push({ id: record.id, name: record.display_name });
  }

  if (!toAdd.length) { showToast('Select or enter at least one player'); return; }

  const joinRound = rounds.length;
  await client.from('game_players').insert(
    toAdd.map((p, i) => ({
      game_id: currentGameId,
      player_id: p.id,
      joined_at_round: joinRound,
      sort_order: players.length + i
    }))
  );

  toAdd.forEach(p => players.push({ id: p.id, name: p.name, total: 0, joinedAtRound: joinRound }));
  rounds.forEach(r => toAdd.forEach(() => r.push(null)));

  await saveGameState(); closeAddPlayers(); render();
  showToast(`${toAdd.map(p => p.name).join(', ')} joined!`);
}

async function removePlayerFromGame(playerId, playerName, rowEl) {
  if (players.length <= 2) { showToast('Need at least 2 players'); return; }
  if (rowEl.dataset.confirm !== '1') {
    rowEl.dataset.confirm = '1';
    rowEl.style.borderColor = 'var(--red)';
    rowEl.style.background = 'var(--red-bg)';
    rowEl.querySelector('button').textContent = 'Remove?';
    setTimeout(() => {
      delete rowEl.dataset.confirm;
      rowEl.style.borderColor = '';
      rowEl.style.background = '';
      rowEl.querySelector('button').textContent = '✕';
    }, 3000);
    return;
  }
  const client = getSupabase();
  await client.from('round_scores').delete().eq('game_id', currentGameId).eq('player_id', playerId);
  await client.from('game_players').delete().eq('game_id', currentGameId).eq('player_id', playerId);

  const idx = players.findIndex(p => p.id === playerId);
  if (idx !== -1) {
    players.splice(idx, 1);
    rounds.forEach(r => r.splice(idx, 1));
  }

  await saveGameState();
  rowEl.remove();
  render();
  showToast(`${playerName} removed from game`);
}

// ── End Game / Winner ──────────────────────────────────────────────────────

async function endGame() {
  if (!rounds.length) {
    const client = getSupabase();
    if (currentGameId) {
      await client.from('game_rooms').delete({ count: 'exact' }).eq('id', currentGameId);
      currentGameId = null;
      currentRoom = null;
    }
    clearSession();
    showScreen('setup');
    return;
  }
  const sorted = [...players].map((p, i) => ({ ...p, i })).sort((a, b) => b.total - a.total);
  try {
    await saveGameToHistory(sorted[0], players, rounds.length);
  } catch (e) {
    console.error('saveGameToHistory failed:', e);
  }
  clearSession();
  showWinner();
}

function showWinner() {
  const medals = ['🥇', '🥈', '🥉'];
  const numPlayers = players.length;
  const legStarts = [0];
  for (let pi = 0; pi < numPlayers; pi++) {
    const firstRound = rounds.findIndex(r => r[pi] !== null);
    if (firstRound > 0 && !legStarts.includes(firstRound)) legStarts.push(firstRound);
  }
  legStarts.sort((a, b) => a - b);
  const legs = legStarts.map((start, i) => ({ start, end: legStarts[i + 1] || rounds.length }));

  let html = '';
  legs.forEach((leg, li) => {
    const legRounds = rounds.slice(leg.start, leg.end);
    const activePlayers = players.map((p, pi) => ({ ...p, pi }))
      .filter(p => legRounds.some(r => r[p.pi] !== null));
    const legTotals = activePlayers
      .map(p => ({ ...p, legTotal: legRounds.reduce((sum, r) => sum + (r[p.pi] || 0), 0) }))
      .sort((a, b) => b.legTotal - a.legTotal);
    const legWinner = legTotals[0];
    const legLabel = legs.length > 1
      ? (li === 0 ? `Leg ${li + 1} — ${activePlayers.map(p => p.name).join(' & ')}` : `Leg ${li + 1} — Full group`)
      : `Game Results`;
    html += `<div style="margin-bottom:${li < legs.length - 1 ? '20px' : '0'}">
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text-3);text-transform:uppercase;margin-bottom:8px;padding:0 2px">${legLabel} · ${legRounds.length} round${legRounds.length !== 1 ? 's' : ''}</div>
      <div style="background:rgba(176,122,32,0.08);border:1.5px solid rgba(176,122,32,0.2);border-radius:14px;overflow:hidden">
        ${legTotals.map((p, rank) => `
        <div style="display:flex;align-items:center;padding:12px 14px;border-bottom:1px solid rgba(176,122,32,0.12);gap:10px">
          <span style="font-size:16px;width:24px;text-align:center">${medals[rank] || rank + 1 + '.'}</span>
          <div style="flex:1;font-size:15px;font-weight:${rank === 0 ? '700' : '500'};color:var(--text)">${p.name}${rank === 0 ? ' 👑' : ''}</div>
          <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:${rank === 0 ? 'var(--amber)' : 'var(--text-2)'}">${p.legTotal}</div>
        </div>`).join('')}
        <div style="padding:10px 14px;font-size:12px;color:var(--text-3);text-align:center">
          ${legWinner.name} won by <strong style="color:var(--amber)">${legTotals.length > 1 ? legWinner.legTotal - legTotals[1].legTotal : 0} pts</strong>
        </div>
      </div>
    </div>`;
  });

  const legWinners = [...new Map(legs.map(leg => {
    const legRounds = rounds.slice(leg.start, leg.end);
    const activePlayers = players.map((p, pi) => ({ ...p, pi })).filter(p => legRounds.some(r => r[p.pi] !== null));
    const legTotals = activePlayers.map(p => ({ ...p, legTotal: legRounds.reduce((sum, r) => sum + (r[p.pi] || 0), 0) })).sort((a, b) => b.legTotal - a.legTotal);
    return [legTotals[0]?.name, legTotals[0]];
  })).values()].filter(Boolean);

  const overall = [...players].map((p, pi) => ({ ...p, pi })).sort((a, b) => b.total - a.total);
  const winner = overall[0];

  if (legs.length > 1) {
    document.querySelector('.win-t').textContent = '👑';
    document.getElementById('win-name').innerHTML = legWinners.map(w => `<span>${w.name} 👑</span>`).join('<span style="font-size:24px;color:var(--border-strong);padding:0 8px">·</span>');
    document.getElementById('win-sc').textContent = `${legs.length} legs · ${rounds.length} round${rounds.length !== 1 ? 's' : ''}`;
  } else {
    document.querySelector('.win-t').textContent = '🏆';
    document.getElementById('win-name').textContent = winner.name;
    document.getElementById('win-sc').textContent = `${winner.total} pts · ${rounds.length} round${rounds.length !== 1 ? 's' : ''}`;
  }
  document.getElementById('win-summary').innerHTML = html;
  setGameEnded(true); showScreen('winner');
}

function newGame() {
  if (syncInterval) clearInterval(syncInterval);
  currentRoom = null; currentGameId = null; currentPassword = null;
  players = []; rounds = [];
  selectedPlayerIds.clear();
  clearSession();
  setGameEnded(false);
  document.getElementById('join-code').value = '';
  showScreen('setup');
  loadPlayerRoster();
}

// ── Stats ──────────────────────────────────────────────────────────────────

let statsHistoryExpanded = false;
const STATS_HISTORY_INITIAL = 10;

function showStats() { statsHistoryExpanded = false; _cachedHistory = null; showScreen('stats'); }

async function renderStats() {
  const body = document.getElementById('stats-body');
  body.innerHTML = '<div class="empty-state">Loading…</div>';
  const history = await loadHistory();
  if (!history.length) {
    body.innerHTML = '<div class="empty-state">No completed games yet.<br>Finish a game to see stats here!</div>';
    return;
  }

  const pmap = {};
  const ensure = name => {
    if (!pmap[name]) pmap[name] = { name, games: 0, legWins: 0, legsPlayed: 0, roundWins: 0, totalRounds: 0, totalScore: 0 };
  };
  history.forEach(g => {
    g.players.forEach(p => { ensure(p.name); pmap[p.name].games++; pmap[p.name].totalScore += p.total; });
    const legs = g.legs || [{ winner: g.winner, rounds: g.rounds, players: g.players.map(p => ({ name: p.name, roundWins: p.roundWins || 0 })) }];
    legs.forEach(leg => {
      (leg.players || []).forEach(p => {
        ensure(p.name);
        pmap[p.name].legsPlayed++;
        pmap[p.name].roundWins += (p.roundWins || 0);
        pmap[p.name].totalRounds += (leg.rounds || 0);
      });
      if (leg.winner) { ensure(leg.winner); pmap[leg.winner].legWins++; }
    });
  });

  const allPlayers = Object.values(pmap).map(p => ({
    ...p,
    lwPct: p.legsPlayed ? Math.round(100 * p.legWins / p.legsPlayed) : 0,
    rwPct: p.totalRounds ? Math.round(100 * p.roundWins / p.totalRounds) : 0,
    avgPerRound: p.totalRounds ? Math.round(p.totalScore / p.totalRounds) : 0,
  })).sort((a, b) => b.lwPct - a.lwPct || b.rwPct - a.rwPct || b.avgPerRound - a.avgPerRound);

  const medals = ['🥇', '🥈', '🥉'];
  const leaderRows = allPlayers.map((p, i) => `
    <div class="stat-row">
      <div class="stat-medal">${medals[i] || ''}</div>
      <div class="stat-name">${p.name}</div>
      <div class="stat-vals">
        <div class="stat-main">${p.lwPct}% <span style="font-size:13px;color:var(--text-3)">legs won</span></div>
        <div class="stat-sub">${p.legWins} 🏆 / ${p.legsPlayed} leg${p.legsPlayed !== 1 ? 's' : ''} · ${p.games} game${p.games !== 1 ? 's' : ''}</div>
        <div class="stat-sub">${p.rwPct}% rounds won · avg ${p.avgPerRound >= 0 ? '+' : ''}${p.avgPerRound}/round</div>
      </div>
    </div>`).join('');

  body.innerHTML = `
    <div class="stat-section"><div class="stat-sec-title">Leaderboard — ${history.length} game${history.length !== 1 ? 's' : ''} · ranked by leg wins</div><div class="stat-card">${leaderRows}</div></div>
    <div class="stat-section" id="history-section"></div>`;

  renderHistorySection(history);
}

function renderHistorySection(history) {
  const section = document.getElementById('history-section');
  if (!section) return;

  const visible = statsHistoryExpanded ? history : history.slice(0, STATS_HISTORY_INITIAL);
  const hasMore = history.length > STATS_HISTORY_INITIAL;

  const histRows = visible.map(g => {
    const legs = g.legs || [];
    const legSummary = legs.length > 1
      ? legs.map(l => `🏆 ${l.winner} <span style="color:var(--text-4)">(${l.rounds}r)</span>`).join(' · ')
      : `🏆 ${g.winner}`;
    const clickAttr = g.gameId ? `onclick="openRoundScorecard('${g.gameId}', '${g.date.replace(/'/g, '')}')"` : '';
    return `
    <div class="game-hist-row" ${clickAttr}>
      <div class="gh-date">${g.date}</div>
      <div class="gh-info">
        <div class="gh-winner">${legSummary}</div>
        <div class="gh-players">${g.players.map(p => p.name).join(', ')} · ${g.rounds} round${g.rounds !== 1 ? 's' : ''}</div>
      </div>
      <div class="gh-pts">${g.winnerScore}</div>
    </div>`;
  }).join('');

  const showMoreBtn = (!statsHistoryExpanded && hasMore)
    ? `<button onclick="expandStatsHistory()" style="width:100%;padding:14px;background:none;border:none;color:var(--amber);font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;">Show all ${history.length} games ▾</button>`
    : (statsHistoryExpanded && hasMore)
    ? `<button onclick="collapseStatsHistory()" style="width:100%;padding:14px;background:none;border:none;color:var(--text-4);font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;">Show less ▴</button>`
    : '';

  section.innerHTML = `
    <div class="stat-sec-title">Game History</div>
    <div class="stat-card">${histRows}${showMoreBtn}</div>`;
}

let _cachedHistory = null;

async function expandStatsHistory() {
  statsHistoryExpanded = true;
  if (!_cachedHistory) _cachedHistory = await loadHistory();
  renderHistorySection(_cachedHistory);
}

async function collapseStatsHistory() {
  statsHistoryExpanded = false;
  if (!_cachedHistory) _cachedHistory = await loadHistory();
  renderHistorySection(_cachedHistory);
}

// ── Round Scorecard ────────────────────────────────────────────────────────

async function openRoundScorecard(gameId, dateLabel) {
  if (!gameId) return;
  const el = document.getElementById('scorecard-overlay');
  const body = document.getElementById('scorecard-body');
  const title = document.getElementById('scorecard-title');
  title.textContent = dateLabel || 'Scorecard';
  body.innerHTML = '<div class="empty-state">Loading…</div>';
  el.style.display = 'flex';

  const client = getSupabase();

  const [{ data: gpRows }, { data: scoreRows }] = await Promise.all([
    client.from('game_players')
      .select('player_id, joined_at_round, sort_order, players(display_name)')
      .eq('game_id', gameId)
      .order('sort_order'),
    client.from('round_scores')
      .select('round_number, player_id, score')
      .eq('game_id', gameId)
      .order('round_number')
  ]);

  if (!gpRows || !gpRows.length || !scoreRows) {
    body.innerHTML = '<div class="empty-state">No round data available for this game.</div>';
    return;
  }

  const players = gpRows.map(r => ({
    id: r.player_id,
    name: r.players?.display_name || r.player_id,
    joinedAt: r.joined_at_round || 1
  }));

  // Build a map: roundNum → { playerId → score }
  const byRound = {};
  scoreRows.forEach(r => {
    if (!byRound[r.round_number]) byRound[r.round_number] = {};
    byRound[r.round_number][r.player_id] = r.score;
  });
  const roundNums = Object.keys(byRound).map(Number).sort((a, b) => a - b);

  // Running totals per player
  const totals = {};
  players.forEach(p => { totals[p.id] = 0; });

  const headerCells = players.map(p => `<th>${p.name}</th>`).join('');
  const rows = roundNums.map(rn => {
    const cells = players.map(p => {
      if (rn < p.joinedAt) return '<td style="color:var(--text-4)">—</td>';
      const s = byRound[rn][p.id];
      if (s == null) return '<td style="color:var(--text-4)">—</td>';
      totals[p.id] += s;
      const cls = s > 0 ? 'sc-winner-cell' : '';
      return `<td class="${cls}">${s > 0 ? '+' : ''}${s}</td>`;
    }).join('');
    return `<tr><td>Round ${rn}</td>${cells}</tr>`;
  }).join('');

  const totalCells = players.map(p => {
    const t = totals[p.id];
    return `<td>${t > 0 ? '+' : ''}${t}</td>`;
  }).join('');

  body.innerHTML = `
    <div class="sc-wrap">
      <table class="sc-tbl">
        <thead><tr><th></th>${headerCells}</tr></thead>
        <tbody>
          ${rows}
          <tr class="sc-total"><td>Total</td>${totalCells}</tr>
        </tbody>
      </table>
    </div>`;
}

function closeScorecard() { document.getElementById('scorecard-overlay').style.display = 'none'; }
function maybeCloseScorecard(e) { if (e.target === document.getElementById('scorecard-overlay')) closeScorecard(); }

// ── Rules ──────────────────────────────────────────────────────────────────

function buildTopics() {
  const g = document.getElementById('topic-grid'); g.innerHTML = '';
  RULES.forEach(r => {
    const c = document.createElement('div'); c.className = 't-card';
    c.innerHTML = `<div class="t-icon">${r.icon}</div><div class="t-name">${r.name}</div><div class="t-desc">${r.desc}</div>`;
    c.onclick = () => showTopic(r); g.appendChild(c);
  });
}
function openRules() { rulesBack(); document.getElementById('rules-overlay').style.display = 'flex'; }
function closeRules() { document.getElementById('rules-overlay').style.display = 'none'; }
function maybeCloseRules(e) { if (e.target === document.getElementById('rules-overlay')) closeRules(); }
function showTopic(r) {
  document.getElementById('rules-home').style.display = 'none';
  document.getElementById('rules-detail').style.display = 'flex';
  document.getElementById('det-ttl').textContent = r.name;
  document.getElementById('det-body').innerHTML = r.html;
}
function rulesBack() {
  document.getElementById('rules-detail').style.display = 'none';
  document.getElementById('rules-home').style.display = 'block';
}

// ── Admin ──────────────────────────────────────────────────────────────────

function openAdmin() {
  document.getElementById('admin-code-inp').value = '';
  document.getElementById('admin-error').style.display = 'none';
  document.getElementById('admin-lock').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-overlay').style.display = 'flex';
}
function closeAdmin() { document.getElementById('admin-overlay').style.display = 'none'; }
function maybeCloseAdmin(e) { if (e.target === document.getElementById('admin-overlay')) closeAdmin(); }

async function saveAdminSupportEmail() {
  const inp = document.getElementById('admin-support-email');
  const msg = document.getElementById('admin-support-email-msg');
  const email = inp.value.trim();
  const { error } = await getSupabase().from('app_settings').update({ support_email: email }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    msg.textContent = 'Could not save.'; msg.style.color = 'var(--red)'; msg.style.display = 'block';
  } else {
    supportEmail = email; renderFeedbackLink();
    msg.textContent = 'Saved!'; msg.style.color = 'var(--green)'; msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 2000);
  }
}

async function checkAdminAuth() {
  const val = document.getElementById('admin-code-inp').value.trim().toLowerCase();
  if (val === adminCode) {
    document.getElementById('admin-lock').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'flex';
    await loadAdminData();
  } else {
    document.getElementById('admin-error').style.display = 'block';
  }
}

async function loadAdminData() {
  const emailInp = document.getElementById('admin-support-email');
  if (emailInp) emailInp.value = supportEmail;
  await Promise.all([renderAdminPlayers(), renderAdminRooms(), renderAdminHistory()]);
}

async function renderAdminPlayers() {
  const el = document.getElementById('admin-players-list');
  const client = getSupabase();
  const { data: players } = await client
    .from('players')
    .select('id, display_name, is_active')
    .order('sort_order');

  if (!players?.length) { el.innerHTML = '<div class="chips-loading">No players.</div>'; return; }

  el.innerHTML = '';
  players.forEach(p => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.id = `admin-player-${p.id}`;
    item.innerHTML = `
      <div class="admin-item-body">
        <div class="admin-item-name">${p.display_name}</div>
        <div class="admin-item-meta">${p.is_active ? 'Active' : 'Inactive (hidden from roster)'}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="admin-toggle-btn${p.is_active ? '' : ' inactive'}"
                onclick="adminTogglePlayer('${p.id}', ${p.is_active}, this)">
          ${p.is_active ? 'Deactivate' : 'Reactivate'}
        </button>
        <button class="admin-del-btn" onclick="adminDeletePlayer('${p.id}','${p.display_name.replace(/'/g,"\\'")}',this)">Delete</button>
      </div>`;
    el.appendChild(item);
  });
}

async function adminTogglePlayer(playerId, isActive, btn) {
  const client = getSupabase();
  const { error } = await client.from('players').update({ is_active: !isActive }).eq('id', playerId);
  if (error) { showToast('Could not update player'); return; }
  const item = document.getElementById(`admin-player-${playerId}`);
  if (item) {
    const meta = item.querySelector('.admin-item-meta');
    if (isActive) {
      meta.textContent = 'Inactive (hidden from roster)';
      btn.textContent = 'Reactivate'; btn.classList.add('inactive'); btn.onclick = () => adminTogglePlayer(playerId, false, btn);
    } else {
      meta.textContent = 'Active';
      btn.textContent = 'Deactivate'; btn.classList.remove('inactive'); btn.onclick = () => adminTogglePlayer(playerId, true, btn);
    }
  }
  showToast(`Player ${isActive ? 'deactivated' : 'reactivated'}`);
  loadPlayerRoster();
}

async function adminDeletePlayer(playerId, playerName, btn) {
  if (btn.dataset.confirm !== '1') {
    btn.textContent = 'Sure?';
    btn.dataset.confirm = '1';
    setTimeout(() => { btn.textContent = 'Delete'; delete btn.dataset.confirm; }, 3000);
    return;
  }
  const client = getSupabase();
  const { data: allHistory } = await client.from('game_history').select('id, player_names, winner_name');
  for (const h of allHistory || []) {
    const names = h.player_names || [];
    if (names.length <= 1 && h.winner_name === playerName) {
      await client.from('game_history').delete().eq('id', h.id);
    } else if (names.includes(playerName)) {
      await client.from('game_history').update({ player_names: names.filter(n => n !== playerName) }).eq('id', h.id);
    }
  }
  const { error, count } = await client.from('players').delete({ count: 'exact' }).eq('id', playerId);
  if (error || count === 0) { showToast('Could not delete player'); btn.textContent = 'Delete'; delete btn.dataset.confirm; return; }
  document.getElementById(`admin-player-${playerId}`)?.remove();
  playerRecords = playerRecords.filter(p => p.id !== playerId);
  _cachedHistory = null;
  loadPlayerRoster();
  showToast(`${playerName} deleted`);
}

async function renderAdminRooms() {
  const el = document.getElementById('admin-rooms-list');
  const client = getSupabase();
  const { data: rooms } = await client
    .from('game_rooms')
    .select('id, room_code, status, updated_at, game_players(player_id, players(id, display_name))')
    .order('updated_at', { ascending: false })
    .limit(50);

  if (!rooms?.length) { el.innerHTML = '<div class="chips-loading">No game rooms.</div>'; return; }

  el.innerHTML = '';
  rooms.forEach(r => {
    const date = new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const statusBadge = r.status === 'active' ? ' 🟢' : '';
    const gamePlayers = (r.game_players || []).map(gp => gp.players).filter(Boolean);

    const item = document.createElement('div');
    item.className = 'admin-item';
    item.id = `admin-room-${r.id}`;
    item.style.flexDirection = 'column';
    item.style.alignItems = 'stretch';
    item.style.gap = '8px';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px';
    header.innerHTML = `
      <div class="admin-item-body">
        <div class="admin-item-name">${r.room_code}${statusBadge}</div>
        <div class="admin-item-meta">${date} · ${gamePlayers.map(p => p.display_name).join(', ')}</div>
      </div>
      <button class="admin-del-btn" onclick="adminDeleteRoom('${r.id}','${r.room_code}',this)">Delete</button>`;
    item.appendChild(header);
    el.appendChild(item);
  });
}

async function adminDeleteRoom(roomId, roomCode, btn) {
  if (btn.dataset.confirm !== '1') {
    btn.textContent = 'Sure?';
    btn.dataset.confirm = '1';
    setTimeout(() => { btn.textContent = 'Delete'; delete btn.dataset.confirm; }, 3000);
    return;
  }
  const client = getSupabase();
  const { error, count } = await client.from('game_rooms').delete({ count: 'exact' }).eq('id', roomId);
  if (error || count === 0) { showToast('Could not delete room'); btn.textContent = 'Delete'; delete btn.dataset.confirm; return; }
  document.getElementById(`admin-room-${roomId}`)?.remove();
  if (currentGameId === roomId) { currentRoom = null; currentGameId = null; clearSession(); }
  showToast(`${roomCode} deleted`);
}

async function renderAdminHistory() {
  const el = document.getElementById('admin-history-list');
  const client = getSupabase();
  const { data: history } = await client
    .from('game_history')
    .select('id, room_code, winner_name, played_at, player_names')
    .order('played_at', { ascending: false })
    .limit(30);

  if (!history?.length) { el.innerHTML = '<div class="chips-loading">No game history.</div>'; return; }

  el.innerHTML = '';
  history.forEach(h => {
    const date = new Date(h.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.id = `admin-hist-${h.id}`;
    item.innerHTML = `
      <div class="admin-item-body">
        <div class="admin-item-name">${h.winner_name} won · ${date}</div>
        <div class="admin-item-meta">${h.room_code} · ${(h.player_names || []).join(', ')}</div>
      </div>
      <button class="admin-del-btn" onclick="adminDeleteHistory('${h.id}', this)">Delete</button>`;
    el.appendChild(item);
  });
}

async function adminDeleteHistory(histId, btn) {
  if (btn.dataset.confirm !== '1') {
    btn.textContent = 'Sure?';
    btn.dataset.confirm = '1';
    setTimeout(() => { btn.textContent = 'Delete'; delete btn.dataset.confirm; }, 3000);
    return;
  }
  const client = getSupabase();
  const { error, count } = await client.from('game_history').delete({ count: 'exact' }).eq('id', histId);
  if (error || count === 0) { showToast('Could not delete entry'); btn.textContent = 'Delete'; delete btn.dataset.confirm; return; }
  document.getElementById(`admin-hist-${histId}`)?.remove();
  showToast('Entry deleted');
  _cachedHistory = null;
}

function showResetConfirm() {
  document.getElementById('admin-reset-btn').style.display = 'none';
  document.getElementById('admin-reset-confirm').style.display = 'flex';
}
function hideResetConfirm() {
  document.getElementById('admin-reset-confirm').style.display = 'none';
  document.getElementById('admin-reset-btn').style.display = '';
}
async function adminResetStats() {
  try {
    const client = getSupabase();
    await client.from('game_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    showToast('All stats reset ✓'); hideResetConfirm(); closeAdmin();
    _cachedHistory = null;
  } catch (e) {
    showToast('Reset failed — try again');
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────

function shareRoom() {
  const url = new URL(window.location.href);
  url.searchParams.set('room', currentRoom);
  const link = url.toString();
  if (navigator.share) {
    navigator.share({ title: 'Join Train Rummy', text: `Room: ${currentRoom}`, url: link }).catch(() => {});
  } else {
    navigator.clipboard.writeText(link).then(() => showToast('Link copied!'))
      .catch(() => { showToast(link, 4000); });
  }
}

function showToast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ── Init ───────────────────────────────────────────────────────────────────

buildTopics();
loadAppSettings();
loadPlayerRoster();

// If ?room=CODE is in the URL and we're not restoring an existing session,
// pre-fill the code and prompt for the password
(function maybeHandleRoomLink() {
  const code = new URLSearchParams(window.location.search).get('room');
  if (!code) return;
  // If sessionStorage already has this room, maybeRestoreSession handles it
  try {
    const cached = JSON.parse(sessionStorage.getItem('tr_session') || '{}');
    if (cached.room === code.toUpperCase()) return;
  } catch (e) {}
  document.getElementById('join-code').value = code.toUpperCase();
})();

maybeRestoreSession();
