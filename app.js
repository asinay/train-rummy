const RULES = [
  {id:'obj',icon:'🎯',name:'Objective',desc:'Goal of the game',html:`<div class="d-icon">🎯</div><div class="d-title">Objective</div><div class="r-block"><div class="r-label">Goal</div><div class="r-body">Score as many points as possible before the train reaches North Station. The player with the <strong>highest score</strong> wins!</div></div><div class="r-block"><div class="r-label">How you score</div><div class="r-body"><strong>Positive:</strong> every card you meld adds to your score.<br><br><strong>Negative:</strong> cards left in hand are <em>subtracted</em> as penalties.</div></div>`},
  {id:'deal',icon:'🃏',name:'Setup & Deal',desc:'Starting a round',html:`<div class="d-icon">🃏</div><div class="d-title">Setup & Deal</div><div class="r-block"><div class="r-label">Decks</div><div class="r-body">Use <strong>2 standard 52-card decks</strong> plus <strong>2 Jokers</strong> (104 cards total).</div></div><div class="r-block"><div class="r-label">Dealing</div><div class="r-body">Each player receives <strong>14 cards</strong>. Flip one card to start the discard pile.</div></div><div class="r-block"><div class="r-label">First player</div><div class="r-body">Player to the dealer's left goes first. Play is <strong>clockwise</strong>.</div></div>`},
  {id:'turn',icon:'🔄',name:'Taking a Turn',desc:'Draw, meld, discard',html:`<div class="d-icon">🔄</div><div class="d-title">Taking a Turn</div><div class="r-block"><div class="r-label">1 — Draw</div><div class="r-body">Take the top card from the draw pile, or take the <strong>entire discard pile</strong> (must immediately use top card in a new meld).</div></div><div class="r-block"><div class="r-label">2 — Meld</div><div class="r-body">Lay down <strong>sets</strong> or <strong>sequences</strong>, and/or add to existing melds.</div></div><div class="r-block"><div class="r-label">3 — Discard</div><div class="r-body">End your turn placing one card face-up on the discard pile. You cannot discard a Joker.</div></div>`},
  {id:'melds',icon:'🤝',name:'Melds',desc:'Sets & sequences',html:`<div class="d-icon">🤝</div><div class="d-title">Melds</div><div class="r-block"><div class="r-label">Set</div><div class="r-body">3+ cards of the <strong>same rank</strong>, different suits.<br>Example: <span class="rtag">7♠</span> <span class="rtag">7♥</span> <span class="rtag">7♣</span></div></div><div class="r-block"><div class="r-label">Sequence</div><div class="r-body">3+ cards of the <strong>same suit</strong> in order.<br>Example: <span class="rtag">4♥</span> <span class="rtag">5♥</span> <span class="rtag">6♥</span></div></div><div class="r-block"><div class="r-label">First meld rule</div><div class="r-body">Your first meld must total at least <span class="rtag">51 points</span>.</div></div>`},
  {id:'score',icon:'🔢',name:'Scoring',desc:'Positive & penalty values',html:`<div class="d-icon">🔢</div><div class="d-title">Scoring</div><div class="r-block"><div class="r-label">Melded cards (positive)</div><div class="cv-tbl"><div class="cv-row"><div class="cv-c hd">Card</div><div class="cv-c hd">Points</div></div><div class="cv-row"><div class="cv-c">Ace high (Q–K–A)</div><div class="cv-c">+15</div></div><div class="cv-row"><div class="cv-c">Ace low (A–2–3)</div><div class="cv-c">+5</div></div><div class="cv-row"><div class="cv-c">J, Q, K, 10</div><div class="cv-c">+10</div></div><div class="cv-row"><div class="cv-c">2–9, Joker</div><div class="cv-c">+5</div></div></div></div><div class="r-block"><div class="r-label">Hand cards (penalty)</div><div class="cv-tbl"><div class="cv-row"><div class="cv-c hd">Card</div><div class="cv-c hd">Penalty</div></div><div class="cv-row"><div class="cv-c">Ace</div><div class="cv-c">−15</div></div><div class="cv-row"><div class="cv-c">J, Q, K, 10</div><div class="cv-c">−10</div></div><div class="cv-row"><div class="cv-c">2–9, Joker</div><div class="cv-c">−5</div></div></div></div>`},
  {id:'jokers',icon:'🌟',name:'Jokers',desc:'Wild card rules',html:`<div class="d-icon">🌟</div><div class="d-title">Jokers (Wild Cards)</div><div class="r-block"><div class="r-label">How they work</div><div class="r-body">A Joker is <strong>wild</strong> and substitutes for any card. A meld may have <strong>at most one Joker</strong>.</div></div><div class="r-block"><div class="r-label">Stealing</div><div class="r-body">Replace a tabled Joker with the exact natural card it represents to take it.</div></div><div class="r-block"><div class="r-label">Penalty</div><div class="r-body">Joker in hand = <span class="rtag r">−5 pts</span>. You may not discard a Joker.</div></div>`},
  {id:'out',icon:'🚪',name:'Going Out',desc:'Ending a round',html:`<div class="d-icon">🚪</div><div class="d-title">Going Out</div><div class="r-block"><div class="r-label">How</div><div class="r-body">Play all cards from your hand by melding/extending. Your last card is discarded or added to a meld.</div></div><div class="r-block"><div class="r-label">Remi!</div><div class="r-body">Meld all cards in a <strong>single turn</strong> with no prior melds — all others take <span class="rtag r">double penalties</span>.</div></div>`},
  {id:'special',icon:'⭐',name:'Special Rules',desc:'Edge cases & tips',html:`<div class="d-icon">⭐</div><div class="d-title">Special Rules</div><div class="r-block"><div class="r-label">Empty draw pile</div><div class="r-body">Shuffle the discard pile (except top card) to form a new draw pile.</div></div><div class="r-block"><div class="r-label">Ace</div><div class="r-body">High (Q–K–A) = <span class="rtag g">+15</span>, low (A–2–3) = <span class="rtag g">+5</span>. No wrap-around. Always <span class="rtag r">−15</span> in hand.</div></div>`},
];

// ── State ──────────────────────────────────────────────────────────────────
let sb = null;
let adminCode = 'asaf';

// players = [{id, name, total}] for current game
// playerRecords = [{id, display_name}] from DB roster
let players = [], playerRecords = [], rounds = [];
let panelOpen = true, focusedPlayer = null;
let currentRoom = null, currentGameId = null, syncInterval = null, lastSyncTime = 0;

// ── Supabase ───────────────────────────────────────────────────────────────
function getSupabase() {
  if (sb) return sb;
  const { supabaseUrl, supabaseAnonKey } = window.APP_CONFIG || {};
  if (!supabaseUrl || supabaseUrl.includes('PASTE_YOUR')) {
    throw new Error('Add your Supabase URL and anon key to APP_CONFIG in index.html');
  }
  sb = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  return sb;
}

// ── Storage: four surgical replacements ───────────────────────────────────

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
    .single();
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

  await client.from('game_history').insert({
    game_id: currentGameId,
    room_code: currentRoom,
    winner_name: winner.name,
    winner_score: winner.total,
    rounds_count: numRounds,
    player_names: finalPlayers.map(p => p.name),
    legs_json: legSummaries
  });

  if (currentGameId) {
    await client.from('game_rooms').update({ status: 'ended' }).eq('id', currentGameId);
  }
}

async function loadHistory() {
  const client = getSupabase();
  const { data } = await client.from('game_history')
    .select('*')
    .order('played_at', { ascending: false })
    .limit(50);
  return (data || []).map(g => ({
    date: new Date(g.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ts: new Date(g.played_at).getTime(),
    winner: g.winner_name,
    winnerScore: g.winner_score,
    players: g.player_names.map(name => {
      const found = (g.legs_json || []).flatMap(l => l.players || []).find(p => p.name === name);
      return { name, total: found?.legTotal || 0 };
    }),
    legs: g.legs_json || [],
    rounds: g.rounds_count,
    room: g.room_code
  }));
}

// ── App settings & roster loading ─────────────────────────────────────────

async function loadAppSettings() {
  try {
    const client = getSupabase();
    const { data } = await client.from('app_settings').select('admin_code').single();
    if (data?.admin_code) adminCode = data.admin_code.toLowerCase();
  } catch (e) {}
}

async function loadPlayerRoster() {
  try {
    const client = getSupabase();
    const { data } = await client.from('players')
      .select('id, display_name')
      .eq('is_active', true)
      .order('sort_order');
    playerRecords = data || [];
    renderPlayerChips();
  } catch (e) {
    document.getElementById('player-chips').innerHTML =
      '<div class="chips-loading" style="color:var(--red)">Could not load players</div>';
  }
}

async function saveNewPlayerToRoster(name) {
  const client = getSupabase();
  const maxOrder = playerRecords.length ? Math.max(...playerRecords.map((_, i) => i + 1)) : 0;
  const { data, error } = await client.from('players')
    .insert({ display_name: name, sort_order: maxOrder + 1 })
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

// ── Screen routing ─────────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'stats') renderStats();
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
  const state = await loadGameState(code);
  if (!state) { showToast('Room not found'); return; }
  currentRoom = code;
  players = state.players;
  rounds = state.rounds;

  // find the game_id from DB
  const { data: room } = await getSupabase().from('game_rooms')
    .select('id').eq('room_code', code).single();
  currentGameId = room?.id || null;

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
  setGameEnded(false); startSync(); showScreen('game'); render();
}

function render() {
  renderScoreboard(); renderEntries(); renderHistory();
  document.getElementById('round-lbl').textContent = `Round ${rounds.length + 1}`;
  document.getElementById('room-badge').textContent = currentRoom || '';
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
    d.className = 'p-row' + (rank === 0 ? ' leader' : '');
    d.innerHTML = `<div class="p-rank">${rank + 1}</div>
      <div class="p-info">
        <div class="p-name">${p.name}${rank === 0 ? ' 👑' : ''}</div>
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
      <input class="e-inp" type="number" id="e${i}" placeholder="0" inputmode="numeric" autocomplete="off">`;
    c.appendChild(d);
    setTimeout(() => {
      const inp = document.getElementById('e' + i);
      if (inp) {
        inp.addEventListener('focus', () => focusedPlayer = i);
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
  renderHelpers();
}

function renderHelpers() {
  const PENS = [
    { label: 'A −15', val: -15 }, { label: 'J/Q/K −10', val: -10 }, { label: '2–9 −5', val: -5 },
    { label: '+5', val: 5 }, { label: '+10', val: 10 }, { label: '+15', val: 15 }
  ];
  const row = document.getElementById('helper-row'); row.innerHTML = '';
  PENS.forEach(p => {
    const btn = document.createElement('button'); btn.className = 'helper-chip'; btn.textContent = p.label;
    btn.onclick = () => applyPenalty(p.val); row.appendChild(btn);
  });
}

function applyPenalty(val) {
  if (focusedPlayer === null) { showToast('Tap a score field first'); return; }
  const inp = document.getElementById('e' + focusedPlayer);
  if (!inp) return;
  inp.value = (parseInt(inp.value) || 0) + val; inp.focus();
}

async function submitRound() {
  const client = getSupabase();
  const roundNum = rounds.length + 1;
  const scores = players.map((_, i) => parseInt(document.getElementById('e' + i)?.value) || 0);

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
  players.forEach((_, i) => { const inp = document.getElementById('e' + i); if (inp) inp.value = ''; });
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

function togglePanel() {
  panelOpen = !panelOpen;
  document.getElementById('panel-body').style.display = panelOpen ? '' : 'none';
  document.getElementById('ep-chev').className = 'ep-chev' + (panelOpen ? ' open' : '');
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
  cur.innerHTML = players.map(p => `
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--card2);border:1.5px solid var(--border);border-radius:12px;padding:12px 16px">
      <span style="font-size:15px;font-weight:600;color:var(--text)">${p.name}</span>
      <span style="font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:var(--amber)">${p.total}</span>
    </div>`).join('');

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

  // From roster chips
  document.querySelectorAll('#ap-chips .player-chip.selected').forEach(chip => {
    const rec = playerRecords.find(p => p.id === chip.dataset.id);
    if (rec && !existing.has(rec.id)) toAdd.push({ id: rec.id, name: rec.display_name });
  });

  // From free-text inputs (new players)
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

// ── End Game / Winner ──────────────────────────────────────────────────────

async function endGame() {
  if (!rounds.length) { showToast('No rounds recorded yet'); return; }
  const sorted = [...players].map((p, i) => ({ ...p, i })).sort((a, b) => b.total - a.total);
  await saveGameToHistory(sorted[0], players, rounds.length);
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

  const overall = [...players].map((p, pi) => ({ ...p, pi })).sort((a, b) => b.total - a.total);
  const winner = overall[0];
  document.getElementById('win-name').textContent = winner.name;
  document.getElementById('win-sc').textContent = `${winner.total} pts overall · ${rounds.length} round${rounds.length !== 1 ? 's' : ''}`;
  document.getElementById('win-summary').innerHTML = html;
  setGameEnded(true); showScreen('winner');
}

function newGame() {
  if (syncInterval) clearInterval(syncInterval);
  currentRoom = null; currentGameId = null; players = []; rounds = [];
  selectedPlayerIds.clear();
  setGameEnded(false);
  renderPlayerChips();
  document.getElementById('join-code').value = '';
  showScreen('setup');
}

// ── Stats ──────────────────────────────────────────────────────────────────

function showStats() { showScreen('stats'); }

async function renderStats() {
  const body = document.getElementById('stats-body');
  body.innerHTML = '<div class="empty-state">Loading…</div>';
  const history = await loadHistory();
  if (!history.length) {
    body.innerHTML = '<div class="empty-state">No completed games yet.<br>Finish a game to see stats here!</div>';
    return;
  }

  const pmap = {};
  const ensure = name => { if (!pmap[name]) pmap[name] = { name, games: 0, legWins: 0, roundWins: 0, totalRounds: 0, totalScore: 0 }; };
  history.forEach(g => {
    g.players.forEach(p => { ensure(p.name); pmap[p.name].games++; pmap[p.name].totalScore += p.total; });
    const legs = g.legs || [{ winner: g.winner, rounds: g.rounds, players: g.players.map(p => ({ name: p.name, roundWins: p.roundWins || 0 })) }];
    legs.forEach(leg => {
      leg.players.forEach(p => { ensure(p.name); pmap[p.name].roundWins += (p.roundWins || 0); pmap[p.name].totalRounds += leg.rounds; });
      if (leg.winner) { ensure(leg.winner); pmap[leg.winner].legWins++; }
    });
  });

  const allPlayers = Object.values(pmap).map(p => ({
    ...p,
    rwPct: p.totalRounds ? Math.round(100 * p.roundWins / p.totalRounds) : 0,
    avgPerRound: p.totalRounds ? Math.round(p.totalScore / p.totalRounds) : 0,
  })).sort((a, b) => b.rwPct - a.rwPct || b.avgPerRound - a.avgPerRound || b.totalScore - a.totalScore);

  const medals = ['🥇', '🥈', '🥉'];
  const leaderRows = allPlayers.map((p, i) => `
    <div class="stat-row">
      <div class="stat-medal">${medals[i] || ''}</div>
      <div class="stat-name">${p.name}</div>
      <div class="stat-vals">
        <div class="stat-main">${p.rwPct}% <span style="font-size:13px;color:var(--text-3)">rounds won</span></div>
        <div class="stat-sub">${p.roundWins}/${p.totalRounds} rounds · ${p.legWins} leg win${p.legWins !== 1 ? 's' : ''}</div>
        <div class="stat-sub">avg ${p.avgPerRound >= 0 ? '+' : ''}${p.avgPerRound}/round · total ${p.totalScore}</div>
      </div>
    </div>`).join('');

  const histRows = history.slice(0, 12).map(g => `
    <div class="game-hist-row">
      <div class="gh-date">${g.date}</div>
      <div class="gh-info">
        <div class="gh-winner">🏆 ${g.winner}</div>
        <div class="gh-players">${g.players.map(p => p.name).join(', ')} · ${g.rounds} rounds</div>
      </div>
      <div class="gh-pts">${g.winnerScore}</div>
    </div>`).join('');

  body.innerHTML = `
    <div class="stat-section"><div class="stat-sec-title">Leaderboard</div><div class="stat-card">${leaderRows}</div></div>
    <div class="stat-section"><div class="stat-sec-title">Recent Games</div><div class="stat-card">${histRows}</div></div>`;
}

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
function checkAdminAuth() {
  const val = document.getElementById('admin-code-inp').value.trim().toLowerCase();
  if (val === adminCode) {
    document.getElementById('admin-lock').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'flex';
  } else {
    document.getElementById('admin-error').style.display = 'block';
  }
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
  } catch (e) {
    showToast('Reset failed — try again');
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Init ───────────────────────────────────────────────────────────────────

buildTopics();
loadAppSettings();
loadPlayerRoster();
