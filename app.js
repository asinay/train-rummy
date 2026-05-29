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
let currentUser = null;   // auth.users row
let userProfile = null;   // profiles row (includes player_id)


// players = [{id, name, total}] for current game
// playerRecords = [{id, display_name}] — scoped to current group when a group is selected
// allPlayerRecords = [{id, display_name}] — full global roster, used for identity picker
let players = [], playerRecords = [], allPlayerRecords = [], rounds = [];
let panelOpen = true, focusedPlayer = null;
let currentRoom = null, currentGameId = null, syncInterval = null, lastSyncTime = 0;

// Group state
let currentGroup = null;   // {id, name, join_code, members:[{player_id, display_name}]}
let myGroups = [];          // all groups this user's player is in

// ── Supabase ───────────────────────────────────────────────────────────────
function getSupabase() {
  if (sb) return sb;
  const { supabaseUrl, supabaseAnonKey } = window.APP_CONFIG || {};
  if (!supabaseUrl || supabaseUrl.includes('PASTE_YOUR')) {
    throw new Error('Add your Supabase URL and anon key to APP_CONFIG in index.html');
  }
  sb = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });
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
    legs_json: legSummaries,
    group_id: currentGroup?.id || null
  });
  if (histError) console.warn('game_history insert:', histError.message);

  if (currentGameId) {
    const { error: roomError } = await client.from('game_rooms').update({ status: 'ended' }).eq('id', currentGameId);
    if (roomError) console.warn('game_rooms update:', roomError.message);
  }
}

async function loadHistory() {
  const client = getSupabase();
  let query = client.from('game_history').select('*').order('played_at', { ascending: false });
  if (currentGroup) query = query.eq('group_id', currentGroup.id);
  const { data } = await query;
  return (data || []).map(g => {
    const legs = g.legs_json || [];
    // Sum each player's score across all legs
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
      room: g.room_code
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
    el.href = `mailto:${supportEmail}?subject=Train Rummy feedback`;
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
    allPlayerRecords = data || [];
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
  const maxOrder = allPlayerRecords.length ? allPlayerRecords.length + 1 : 1;
  const { data, error } = await client.from('players')
    .insert({ display_name: name, sort_order: maxOrder })
    .select('id, display_name')
    .single();
  if (error) throw error;
  allPlayerRecords.push(data);
  if (currentGroup) {
    await client.from('group_members').insert({
      group_id: currentGroup.id, player_id: data.id, sort_order: maxOrder
    });
    currentGroup.members.push(data);
    // playerRecords IS currentGroup.members (same ref), so no separate push needed
  } else {
    playerRecords.push(data);
  }
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
  if (allPlayerRecords.some(p => p.display_name.toLowerCase() === name.toLowerCase())) {
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
  if (!currentUser) { openAuthSheet(); showToast('Sign in to host a game'); return; }
  const selected = getSelectedPlayers();
  if (selected.length < 2) { showToast('Select at least 2 players'); return; }

  currentRoom = genRoomCode();
  const client = getSupabase();

  const { data: room, error } = await client.from('game_rooms')
    .insert({ room_code: currentRoom, status: 'active', created_by: currentUser.id, group_id: currentGroup?.id || null })
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
      <input class="e-inp" type="number" id="e${i}" placeholder="0" inputmode="decimal" autocomplete="off">`;
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
}

async function submitRound() {
  const client = getSupabase();
  const roundNum = rounds.length + 1;
  const scores = players.map((_, i) => parseInt(document.getElementById('e' + i)?.value) || 0);

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
  if (!rounds.length) { showToast('No rounds recorded yet'); return; }
  const sorted = [...players].map((p, i) => ({ ...p, i })).sort((a, b) => b.total - a.total);
  try {
    await saveGameToHistory(sorted[0], players, rounds.length);
  } catch (e) {
    console.error('saveGameToHistory failed:', e);
  }
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

  // Collect leg winners (deduplicated for display)
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
  currentRoom = null; currentGameId = null; players = []; rounds = [];
  selectedPlayerIds.clear();
  setGameEnded(false);
  document.getElementById('join-code').value = '';
  showScreen('setup');
  // Re-render group UI (will re-scope player chips to group)
  renderGroupUI();
  loadMyActiveGames();
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

  // Build per-player stats — legs are the unit of winning
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
    return `
    <div class="game-hist-row">
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
function maybeCloseAdmin(e) { if (e.target === document.getElementById('admin-overlay')) closeAdmin(); }
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
  // Pre-fill support email field
  const emailInp = document.getElementById('admin-support-email');
  if (emailInp) emailInp.value = supportEmail;
  await Promise.all([renderAdminGroups(), renderAdminPlayers(), renderAdminHistory()]);
}

async function renderAdminGroups() {
  const el = document.getElementById('admin-groups-list');
  const client = getSupabase();

  const { data: groups } = await client
    .from('groups')
    .select('id, name, join_code, group_members(player_id, players(id, display_name))')
    .order('name');

  if (!groups?.length) { el.innerHTML = '<div class="chips-loading">No groups.</div>'; return; }

  // Fetch all rooms with players for all groups in one query
  const groupIds = groups.map(g => g.id);
  const { data: rooms } = await client
    .from('game_rooms')
    .select('id, room_code, status, updated_at, group_id, game_players(player_id, players(id, display_name))')
    .in('group_id', groupIds)
    .order('updated_at', { ascending: false });

  el.innerHTML = '';
  groups.forEach(g => {
    const groupMembers = (g.group_members || []).map(m => m.players).filter(Boolean);
    const memberCount = groupMembers.length;
    const groupRooms = (rooms || []).filter(r => r.group_id === g.id);

    const wrap = document.createElement('div');
    wrap.style.cssText = 'border:1.5px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:10px';

    // Group header row
    const header = document.createElement('div');
    header.className = 'admin-item';
    header.id = `admin-group-${g.id}`;
    header.style.cssText = 'border:none;border-radius:0;margin-bottom:0;border-bottom:1px solid var(--border)';
    header.innerHTML = `
      <div class="admin-item-body">
        <div class="admin-item-name">${g.name}</div>
        <div class="admin-item-meta">${memberCount} member${memberCount !== 1 ? 's' : ''} · Code: ${g.join_code}</div>
      </div>
      <button class="admin-del-btn" onclick="adminDeleteGroup('${g.id}','${g.name.replace(/'/g,"\\'")}',this)">Delete</button>`;
    wrap.appendChild(header);

    // Members list
    if (groupMembers.length) {
      const membersSection = document.createElement('div');
      membersSection.style.cssText = 'padding:8px 14px 4px;border-bottom:1px solid var(--border)';
      const membersLabel = document.createElement('div');
      membersLabel.style.cssText = 'font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--text-4);text-transform:uppercase;margin-bottom:6px';
      membersLabel.textContent = 'Members';
      membersSection.appendChild(membersLabel);
      groupMembers.forEach(p => {
        const mrow = document.createElement('div');
        mrow.id = `admin-group-member-${g.id}-${p.id}`;
        mrow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--card2);border-radius:8px;padding:5px 10px;margin-bottom:5px';
        mrow.innerHTML = `
          <span style="font-size:13px;color:var(--text-2)">${p.display_name}</span>
          <button class="admin-del-btn" style="height:26px;padding:0 8px;font-size:11px"
                  onclick="adminRemoveGroupMember('${g.id}','${p.id}','${p.display_name.replace(/'/g,"\\'")}',this)">Remove</button>`;
        membersSection.appendChild(mrow);
      });
      wrap.appendChild(membersSection);
    }

    // Rooms under this group
    if (groupRooms.length) {
      groupRooms.forEach(r => {
        const date = new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const statusBadge = r.status === 'active' ? ' 🟢' : ' ⚫';
        const gamePlayers = (r.game_players || []).map(gp => gp.players).filter(Boolean);

        const roomWrap = document.createElement('div');
        roomWrap.id = `admin-room-${r.id}`;
        roomWrap.style.cssText = 'border-bottom:1px solid var(--border);padding:10px 14px';

        // Room header
        const roomHeader = document.createElement('div');
        roomHeader.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:6px';
        roomHeader.innerHTML = `
          <div style="flex:1;min-width:0">
            <span style="font-size:13px;font-weight:700;color:var(--amber);letter-spacing:1px">${r.room_code}${statusBadge}</span>
            <span style="font-size:12px;color:var(--text-4);margin-left:8px">${date}</span>
          </div>
          <button class="admin-del-btn" style="height:28px;padding:0 10px;font-size:12px"
                  onclick="adminDeleteRoom('${r.id}','${r.room_code}',this)">Delete room</button>`;
        roomWrap.appendChild(roomHeader);

        // Players in room
        gamePlayers.forEach(p => {
          const prow = document.createElement('div');
          prow.id = `admin-room-player-${r.id}-${p.id}`;
          prow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--card2);border-radius:8px;padding:5px 10px;margin-bottom:4px';
          prow.innerHTML = `
            <span style="font-size:13px;color:var(--text-2)">${p.display_name}</span>
            <button class="admin-del-btn" style="height:26px;padding:0 8px;font-size:11px"
                    onclick="adminRemovePlayerFromRoom('${r.id}','${p.id}','${p.display_name.replace(/'/g,"\\'")}',this)">Remove</button>`;
          roomWrap.appendChild(prow);
        });

        wrap.appendChild(roomWrap);
      });
    } else {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:10px 14px;font-size:12px;color:var(--text-4)';
      empty.textContent = 'No game rooms yet.';
      wrap.appendChild(empty);
    }

    el.appendChild(wrap);
  });
}

async function adminDeleteGroup(groupId, groupName, btn) {
  if (btn.dataset.confirm !== '1') {
    btn.textContent = 'Sure?';
    btn.dataset.confirm = '1';
    setTimeout(() => { btn.textContent = 'Delete'; delete btn.dataset.confirm; }, 3000);
    return;
  }
  const client = getSupabase();
  const { error, count } = await client.from('groups').delete({ count: 'exact' }).eq('id', groupId);
  if (error || count === 0) { showToast('Could not delete group'); btn.textContent = 'Delete'; delete btn.dataset.confirm; return; }
  document.getElementById(`admin-group-${groupId}`)?.remove();
  if (currentGroup?.id === groupId) { currentGroup = null; myGroups = []; renderGroupUI(); }
  showToast(`"${groupName}" deleted`);
}

async function adminRemoveGroupMember(groupId, playerId, playerName, btn) {
  if (btn.dataset.confirm !== '1') {
    btn.textContent = 'Sure?';
    btn.dataset.confirm = '1';
    setTimeout(() => { btn.textContent = 'Remove'; delete btn.dataset.confirm; }, 3000);
    return;
  }
  const client = getSupabase();
  const { error, count } = await client.from('group_members')
    .delete({ count: 'exact' })
    .eq('group_id', groupId)
    .eq('player_id', playerId);
  if (error || count === 0) { showToast('Could not remove player'); btn.textContent = 'Remove'; delete btn.dataset.confirm; return; }
  document.getElementById(`admin-group-member-${groupId}-${playerId}`)?.remove();
  showToast(`${playerName} removed from group`);
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
  // Remove from game_history: delete entries where this is the only player,
  // and scrub their name from player_names array in mixed-player games
  const { data: allHistory } = await client
    .from('game_history')
    .select('id, player_names, winner_name');

  for (const h of allHistory || []) {
    const names = h.player_names || [];
    if (names.length <= 1 && h.winner_name === playerName) {
      await client.from('game_history').delete().eq('id', h.id);
    } else if (names.includes(playerName)) {
      await client.from('game_history')
        .update({ player_names: names.filter(n => n !== playerName) })
        .eq('id', h.id);
    }
  }

  // Deleting the player cascades to game_players, group_members, profiles.player_id (set null)
  const { error, count } = await client.from('players').delete({ count: 'exact' }).eq('id', playerId);
  if (error || count === 0) { showToast('Could not delete player'); btn.textContent = 'Delete'; delete btn.dataset.confirm; return; }

  document.getElementById(`admin-player-${playerId}`)?.remove();
  allPlayerRecords = allPlayerRecords.filter(p => p.id !== playerId);
  playerRecords = playerRecords.filter(p => p.id !== playerId);
  if (currentGroup) currentGroup.members = currentGroup.members.filter(p => p.id !== playerId);
  _cachedHistory = null;
  loadPlayerRoster();
  showToast(`${playerName} deleted`);
}

async function renderAdminRooms() {
  const el = document.getElementById('admin-rooms-list');
  const client = getSupabase();
  const { data: rooms } = await client
    .from('game_rooms')
    .select('id, room_code, status, updated_at, groups(name), game_players(player_id, players(id, display_name))')
    .order('updated_at', { ascending: false })
    .limit(50);

  if (!rooms?.length) { el.innerHTML = '<div class="chips-loading">No game rooms.</div>'; return; }

  el.innerHTML = '';
  rooms.forEach(r => {
    const groupName = r.groups?.name || 'No group';
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
        <div class="admin-item-meta">${groupName} · ${date}</div>
      </div>
      <button class="admin-del-btn" onclick="adminDeleteRoom('${r.id}','${r.room_code}',this)">Delete</button>`;
    item.appendChild(header);

    if (gamePlayers.length) {
      const playerList = document.createElement('div');
      playerList.id = `admin-room-players-${r.id}`;
      playerList.style.cssText = 'display:flex;flex-direction:column;gap:5px;padding-left:4px';
      gamePlayers.forEach(p => {
        const prow = document.createElement('div');
        prow.id = `admin-room-player-${r.id}-${p.id}`;
        prow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--card2);border-radius:8px;padding:6px 10px';
        prow.innerHTML = `
          <span style="font-size:13px;color:var(--text-2)">${p.display_name}</span>
          <button class="admin-del-btn" style="height:28px;padding:0 8px;font-size:11px"
                  onclick="adminRemovePlayerFromRoom('${r.id}','${p.id}','${p.display_name.replace(/'/g,"\\'")}',this)">Remove</button>`;
        playerList.appendChild(prow);
      });
      item.appendChild(playerList);
    }

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
  const roomEl = document.getElementById(`admin-room-${roomId}`);
  roomEl?.remove();
  if (currentGameId === roomId) { currentRoom = null; currentGameId = null; }
  showToast(`${roomCode} deleted`);
}

async function adminRemovePlayerFromRoom(roomId, playerId, playerName, btn) {
  if (btn.dataset.confirm !== '1') {
    btn.textContent = 'Sure?';
    btn.dataset.confirm = '1';
    setTimeout(() => { btn.textContent = 'Remove'; delete btn.dataset.confirm; }, 3000);
    return;
  }
  const client = getSupabase();
  await client.from('round_scores').delete().eq('game_id', roomId).eq('player_id', playerId);
  const { error, count } = await client.from('game_players').delete({ count: 'exact' })
    .eq('game_id', roomId).eq('player_id', playerId);
  if (error || count === 0) { showToast('Could not remove player'); btn.textContent = 'Remove'; delete btn.dataset.confirm; return; }
  document.getElementById(`admin-room-player-${roomId}-${playerId}`)?.remove();
  showToast(`${playerName} removed from room`);
}

async function renderAdminHistory() {
  const el = document.getElementById('admin-history-list');
  const client = getSupabase();
  const { data: history } = await client
    .from('game_history')
    .select('id, room_code, winner_name, played_at, player_names, groups(name)')
    .order('played_at', { ascending: false })
    .limit(30);

  if (!history?.length) { el.innerHTML = '<div class="chips-loading">No game history.</div>'; return; }

  el.innerHTML = '';
  history.forEach(h => {
    const date = new Date(h.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const groupName = h.groups?.name || 'No group';
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.id = `admin-hist-${h.id}`;
    item.innerHTML = `
      <div class="admin-item-body">
        <div class="admin-item-name">${h.winner_name} won · ${date}</div>
        <div class="admin-item-meta">${groupName} · ${h.room_code} · ${(h.player_names || []).join(', ')}</div>
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

function showToast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ── Groups ──────────────────────────────────────────────────────────────────

async function loadMyGroups() {
  myGroups = [];
  if (!userProfile?.player_id) { renderGroupUI(); return; }

  const client = getSupabase();
  const { data: memberships } = await client
    .from('group_members')
    .select('group_id, groups(id, name, join_code)')
    .eq('player_id', userProfile.player_id);

  if (!memberships?.length) { renderGroupUI(); return; }

  const groupIds = memberships.map(m => m.groups?.id).filter(Boolean);

  // Fetch member counts + member names for each group
  const { data: allMembers } = await client
    .from('group_members')
    .select('group_id, players(id, display_name)')
    .in('group_id', groupIds)
    .order('sort_order');

  myGroups = memberships
    .map(m => m.groups)
    .filter(Boolean)
    .map(g => ({
      ...g,
      members: (allMembers || [])
        .filter(r => r.group_id === g.id)
        .map(r => r.players)
        .filter(Boolean)
    }));

  // Auto-select: restore last used group, or auto-select if only one
  if (!currentGroup) {
    const lastId = userProfile?.last_group_id;
    const restored = lastId && myGroups.find(g => g.id === lastId);
    if (restored) {
      await selectGroup(restored, false);
    } else if (myGroups.length === 1) {
      await selectGroup(myGroups[0], false);
    }
  }

  renderGroupUI();
}

async function selectGroup(group, persist = true) {
  currentGroup = group;
  if (persist && currentUser) {
    getSupabase().from('profiles').update({ last_group_id: group.id }).eq('id', currentUser.id).then(() => {});
    if (userProfile) userProfile.last_group_id = group.id;
  }
  // Reload player chips scoped to this group
  renderGroupPlayerChips();
  renderGroupUI();
  await loadMyActiveGames();
}

function switchGroup() {
  currentGroup = null;
  renderGroupUI();
}

function renderGroupUI() {
  const pickerSection = document.getElementById('group-picker-section');
  const groupBar = document.getElementById('group-bar');
  const gameSection = document.getElementById('game-section');
  const loading = document.getElementById('profile-loading');

  // Still waiting for auth — hide everything below profile bar
  if (loading.style.display !== 'none') {
    pickerSection.style.display = 'none';
    groupBar.style.display = 'none';
    gameSection.style.display = 'none';
    return;
  }

  const signedIn = !!currentUser && !!userProfile?.player_id;

  if (!signedIn) {
    // Signed out: hide group UI entirely, show game section as before
    pickerSection.style.display = 'none';
    groupBar.style.display = 'none';
    gameSection.style.display = 'block';
    loadPlayerRoster();
    return;
  }

  if (!currentGroup) {
    // Signed in but no group selected: show picker
    renderGroupPickerCards();
    pickerSection.style.display = 'block';
    groupBar.style.display = 'none';
    gameSection.style.display = 'none';
    return;
  }

  // Group selected: show bar + game section with group-scoped players
  document.getElementById('group-bar-name').textContent = currentGroup.name;
  pickerSection.style.display = 'none';
  groupBar.style.display = 'block';
  gameSection.style.display = 'block';
}

function renderGroupPickerCards() {
  const list = document.getElementById('group-picker-list');
  list.innerHTML = '';
  if (!myGroups.length) {
    list.innerHTML = '<div class="chips-loading">You\'re not in any groups yet.</div>';
    return;
  }
  myGroups.forEach(g => {
    const memberNames = g.members.map(m => m.display_name).join(', ');
    const card = document.createElement('button');
    card.className = 'group-picker-card';
    card.innerHTML = `
      <div class="group-picker-icon">👥</div>
      <div class="group-picker-body">
        <div class="group-picker-name">${g.name}</div>
        <div class="group-picker-meta">${memberNames || 'No players yet'}</div>
        <div class="group-picker-code">Code: ${g.join_code}</div>
      </div>
      <div class="group-picker-arrow">→</div>`;
    card.onclick = () => selectGroup(g);
    list.appendChild(card);
  });
}

function renderGroupPlayerChips() {
  if (!currentGroup) return;
  // Scope playerRecords to group members + re-render chips
  playerRecords = currentGroup.members;
  renderPlayerChips();
}

// Invite sheet
function openInviteSheet() {
  if (!currentGroup) return;
  document.getElementById('invite-sheet-title').textContent = `Invite to ${currentGroup.name}`;

  // Roster chips — players not already in the group
  const memberIds = new Set(currentGroup.members.map(m => m.id));
  const notInGroup = allPlayerRecords.filter(p => !memberIds.has(p.id));
  const chipsEl = document.getElementById('invite-roster-chips');
  const emptyEl = document.getElementById('invite-roster-empty');
  chipsEl.innerHTML = '';
  if (notInGroup.length) {
    emptyEl.style.display = 'none';
    notInGroup.forEach(p => {
      const chip = document.createElement('button');
      chip.className = 'player-chip';
      chip.textContent = p.display_name;
      chip.onclick = () => addPlayerToGroup(p, chip);
      chipsEl.appendChild(chip);
    });
  } else {
    emptyEl.style.display = 'block';
  }

  // Invite link
  const url = `${window.location.origin}${window.location.pathname}?join=${currentGroup.join_code}`;
  document.getElementById('invite-link-inp').value = url;

  // Show native share button only if supported
  document.getElementById('invite-share-btn').style.display =
    navigator.share ? 'flex' : 'none';

  document.getElementById('invite-overlay').style.display = 'flex';
}
function closeInviteSheet() { document.getElementById('invite-overlay').style.display = 'none'; }
function maybeCloseInviteSheet(e) { if (e.target === document.getElementById('invite-overlay')) closeInviteSheet(); }

async function addPlayerToGroup(player, chip) {
  const client = getSupabase();
  const { error } = await client.from('group_members').insert({
    group_id: currentGroup.id,
    player_id: player.id,
    sort_order: currentGroup.members.length + 1
  });
  if (error) { showToast('Could not add player'); return; }
  currentGroup.members.push(player);
  chip.classList.add('selected');
  chip.disabled = true;
  chip.textContent = player.display_name + ' ✓';
  renderGroupPlayerChips();
  showToast(`${player.display_name} added to ${currentGroup.name}`);
}

function copyInviteLink() {
  const inp = document.getElementById('invite-link-inp');
  navigator.clipboard.writeText(inp.value).then(() => showToast('Link copied!')).catch(() => {
    inp.select(); document.execCommand('copy'); showToast('Link copied!');
  });
}

async function shareInviteLink() {
  const url = document.getElementById('invite-link-inp').value;
  try {
    await navigator.share({ title: `Join ${currentGroup.name} on Train Rummy`, url });
  } catch (e) { /* user cancelled */ }
}

async function maybeHandlePendingJoin() {
  const code = sessionStorage.getItem('pendingJoin');
  if (!code) return;
  sessionStorage.removeItem('pendingJoin');
  const client = getSupabase();
  const { data: group } = await client.from('groups')
    .select('id, name, join_code').eq('join_code', code).maybeSingle();
  if (group) await doJoinGroup(group);
}

// Deep-link: ?join=CODE — handle after auth + identity are established
async function maybeHandleJoinLink() {
  const code = new URLSearchParams(window.location.search).get('join');
  if (!code) return;

  const client = getSupabase();
  const { data: group } = await client.from('groups')
    .select('id, name, join_code')
    .eq('join_code', code.toUpperCase())
    .maybeSingle();
  if (!group) return;

  // Clean the URL so refreshing doesn't re-trigger
  window.history.replaceState({}, '', window.location.pathname);

  if (!currentUser || !userProfile?.player_id) {
    // Not signed in — store pending join and prompt sign-in
    sessionStorage.setItem('pendingJoin', code.toUpperCase());
    showToast(`Sign in to join "${group.name}"`);
    openAuthSheet();
    return;
  }

  await doJoinGroup(group);
}

async function doJoinGroup(group) {
  const client = getSupabase();
  const { error } = await client.from('group_members')
    .insert({ group_id: group.id, player_id: userProfile.player_id })
    .select().maybeSingle();
  if (error && !error.message.includes('unique')) {
    showToast('Could not join group'); return;
  }
  showToast(`Joined "${group.name}"! 🚄`);
  await loadMyGroups();
  const joined = myGroups.find(g => g.id === group.id);
  if (joined) await selectGroup(joined);
}

// Group overlay
function openGroupSheet() {
  document.getElementById('group-join-inp').value = '';
  document.getElementById('group-name-inp').value = '';
  setGroupMsg('join', '', '');
  setGroupMsg('create', '', '');
  document.getElementById('group-overlay').style.display = 'flex';
}
function closeGroupSheet() { document.getElementById('group-overlay').style.display = 'none'; }
function maybeCloseGroupSheet(e) { if (e.target === document.getElementById('group-overlay')) closeGroupSheet(); }

function setGroupMsg(type, msg, color) {
  const el = document.getElementById(`group-${type}-msg`);
  el.textContent = msg;
  el.style.color = color === 'error' ? 'var(--red)' : 'var(--green)';
  el.style.display = msg ? 'block' : 'none';
}

async function joinGroup() {
  if (!currentUser || !userProfile?.player_id) { showToast('Sign in first'); return; }
  const code = document.getElementById('group-join-inp').value.trim().toUpperCase();
  if (!code) { setGroupMsg('join', 'Enter a group code', 'error'); return; }

  const client = getSupabase();
  const { data: group } = await client.from('groups').select('id, name, join_code').eq('join_code', code).maybeSingle();
  if (!group) { setGroupMsg('join', 'Group not found — check the code', 'error'); return; }

  const { error } = await client.from('group_members')
    .insert({ group_id: group.id, player_id: userProfile.player_id })
    .select().maybeSingle();
  if (error && !error.message.includes('unique')) {
    setGroupMsg('join', 'Could not join group', 'error'); return;
  }

  setGroupMsg('join', `Joined "${group.name}"!`, 'success');
  setTimeout(async () => { closeGroupSheet(); await loadMyGroups(); }, 800);
}

async function createGroup() {
  if (!currentUser || !userProfile?.player_id) { showToast('Sign in first'); return; }
  const name = document.getElementById('group-name-inp').value.trim();
  if (!name) { setGroupMsg('create', 'Enter a group name', 'error'); return; }

  // Generate a unique 5-letter code
  const words = ['NORTH','SOUTH','KINGS','UNION','GRAND','METRO','SWIFT','COAST','RIDGE','PLAZA'];
  let joinCode = words[Math.floor(Math.random() * words.length)];
  const client = getSupabase();

  const { data: group, error } = await client.from('groups')
    .insert({ name, join_code: joinCode, created_by: currentUser.id })
    .select('id, name, join_code')
    .single();
  if (error) { setGroupMsg('create', 'Could not create group — try a different name', 'error'); return; }

  await client.from('group_members').insert({ group_id: group.id, player_id: userProfile.player_id });

  setGroupMsg('create', `Group created! Code: ${group.join_code}`, 'success');
  setTimeout(async () => { closeGroupSheet(); await loadMyGroups(); }, 900);
}

// ── My active games ─────────────────────────────────────────────────────────

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function loadMyActiveGames() {
  const section = document.getElementById('my-games-section');
  const list = document.getElementById('my-games-list');
  const toggleWrap = document.getElementById('group-games-toggle-wrap');
  const toggleTrack = document.getElementById('group-games-toggle');
  if (!currentUser || !userProfile?.player_id || !currentGroup) {
    section.style.display = 'none';
    if (toggleWrap) toggleWrap.style.display = 'none';
    return;
  }

  const showAll = !!userProfile?.show_group_games;
  if (toggleWrap) toggleWrap.style.display = 'flex';  // always visible when in a group
  if (toggleTrack) toggleTrack.className = 'toggle-track' + (showAll ? ' on' : '');
  if (!showAll && !userProfile?.player_id) { section.style.display = 'none'; return; }

  const client = getSupabase();
  let active;

  if (showAll) {
    const { data: rooms } = await client
      .from('game_rooms')
      .select('id, room_code, status, updated_at, group_id')
      .eq('group_id', currentGroup.id)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });
    active = rooms || [];
  } else {
    const { data: joined } = await client
      .from('game_players')
      .select('game_id, game_rooms(id, room_code, status, updated_at, group_id)')
      .eq('player_id', userProfile.player_id);
    active = (joined || [])
      .map(j => j.game_rooms)
      .filter(r => r && r.status === 'active' && r.group_id === currentGroup.id)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  if (!active.length) { section.style.display = 'none'; return; }

  // For each room, fetch all players to display names
  const gameIds = active.map(r => r.id);
  const { data: gpRows } = await client
    .from('game_players')
    .select('game_id, players(display_name)')
    .in('game_id', gameIds)
    .order('sort_order');

  list.innerHTML = '';
  active.forEach(room => {
    const roomPlayers = (gpRows || [])
      .filter(r => r.game_id === room.id)
      .map(r => r.players?.display_name)
      .filter(Boolean);

    const card = document.createElement('button');
    card.className = 'my-game-card';
    card.innerHTML = `
      <div class="my-game-card-body">
        <div class="my-game-code">${room.room_code}</div>
        <div class="my-game-players">${roomPlayers.join(', ')}</div>
        <div class="my-game-meta">Last activity ${timeAgo(room.updated_at)}</div>
      </div>
      <div class="my-game-arrow">→</div>`;
    card.onclick = () => resumeGame(room.room_code);
    list.appendChild(card);
  });

  section.style.display = 'block';
}

async function toggleShowGroupGames() {
  if (!currentUser || !userProfile) return;
  const newVal = !userProfile.show_group_games;
  userProfile.show_group_games = newVal;
  getSupabase().from('profiles').update({ show_group_games: newVal }).eq('id', currentUser.id).then(() => {});
  await loadMyActiveGames();
}

async function resumeGame(code) {
  showToast('Loading game…');
  const state = await loadGameState(code);
  if (!state) { showToast('Room not found or already ended'); loadMyActiveGames(); return; }
  currentRoom = code;
  players = state.players;
  rounds = state.rounds;
  const { data: room } = await getSupabase().from('game_rooms')
    .select('id').eq('room_code', code).single();
  currentGameId = room?.id || null;
  setGameEnded(false); startSync(); showScreen('game'); render();
}

// ── Auth ───────────────────────────────────────────────────────────────────

function renderProfileBar() {
  document.getElementById('profile-loading').style.display = 'none';
  const signedIn  = document.getElementById('profile-signed-in');
  const signedOut = document.getElementById('profile-signed-out');
  const nameEl    = document.getElementById('profile-name');

  const startBtn = document.getElementById('start-btn');
  if (currentUser) {
    const label = userProfile?.player_name || currentUser.email;
    nameEl.textContent = '👤 ' + label;
    signedIn.style.display  = 'flex';
    signedOut.style.display = 'none';
    if (startBtn) startBtn.textContent = 'Start Game →';
  } else {
    signedIn.style.display  = 'none';
    signedOut.style.display = 'flex';
    if (startBtn) startBtn.textContent = 'Sign in to Start Game →';
  }
  loadMyGroups();
}

async function loadUserProfile() {
  try {
    const client = getSupabase();
    const { data: { user } } = await client.auth.getUser();
    currentUser = user || null;
    userProfile = null;

    if (currentUser) {
      const { data } = await client
        .from('profiles')
        .select('id, player_id, last_group_id, show_group_games, players(display_name)')
        .eq('id', currentUser.id)
        .maybeSingle();
      userProfile = data ? { ...data, player_name: data.players?.display_name || null } : null;
    }
    renderProfileBar();

    // First sign-in with no identity linked → prompt picker
    if (currentUser && userProfile && !userProfile.player_id) {
      openIdentityPicker();
    }
  } catch (e) {
    console.error('loadUserProfile failed:', e);
  }
}

// Auth sheet (magic link)
function openAuthSheet() {
  resetAuthSheet();
  document.getElementById('auth-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('auth-email').focus(), 100);
}
function closeAuthSheet() { document.getElementById('auth-overlay').style.display = 'none'; }
function maybeCloseAuth(e) { if (e.target === document.getElementById('auth-overlay')) closeAuthSheet(); }

function resetAuthSheet() {
  document.getElementById('auth-email').value = '';
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-entry').style.display = 'flex';
  document.getElementById('auth-sent').style.display = 'none';
  setTimeout(() => document.getElementById('auth-email').focus(), 100);
}

async function sendMagicLink() {
  const email = document.getElementById('auth-email').value.trim();
  const errEl = document.getElementById('auth-error');
  if (!email) { errEl.textContent = 'Enter your email first.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  try {
    const client = getSupabase();
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;
    document.getElementById('auth-sent-email').textContent = email;
    document.getElementById('auth-entry').style.display = 'none';
    document.getElementById('auth-sent').style.display = 'flex';
  } catch (e) {
    errEl.textContent = e.message || 'Could not send link';
    errEl.style.display = 'block';
  }
}

async function signOut() {
  const client = getSupabase();
  await client.auth.signOut();
  currentUser = null; userProfile = null; currentGroup = null; myGroups = [];
  renderProfileBar();
  showToast('Signed out');
}

// Identity picker
function openIdentityPicker() {
  const chips = document.getElementById('identity-chips');
  chips.innerHTML = '';
  document.getElementById('identity-new-inp').value = '';
  allPlayerRecords.forEach(p => {
    const chip = document.createElement('button');
    chip.className = 'player-chip';
    chip.textContent = p.display_name;
    chip.onclick = () => identitySelect(p.id, p.display_name);
    chips.appendChild(chip);
  });
  document.getElementById('identity-overlay').style.display = 'flex';
}
function closeIdentityPicker() { document.getElementById('identity-overlay').style.display = 'none'; }
function maybeCloseIdentity(e) { if (e.target === document.getElementById('identity-overlay')) closeIdentityPicker(); }

async function identitySelect(playerId, playerName) {
  const client = getSupabase();
  await client.from('profiles').update({ player_id: playerId }).eq('id', currentUser.id);
  userProfile = { ...userProfile, player_id: playerId, player_name: playerName };
  currentGroup = null; myGroups = [];
  renderProfileBar();
  closeIdentityPicker();
  showToast(`Welcome aboard, ${playerName}! 🚄`);
  await maybeHandlePendingJoin();
}

async function identityCreateNew() {
  const name = document.getElementById('identity-new-inp').value.trim();
  if (!name) return;
  if (allPlayerRecords.some(p => p.display_name.toLowerCase() === name.toLowerCase())) {
    showToast('That name already exists — tap it above'); return;
  }
  try {
    const record = await saveNewPlayerToRoster(name);
    renderPlayerChips();
    await identitySelect(record.id, record.display_name);
  } catch (e) {
    showToast('Could not create player');
  }
}

// ── Init ───────────────────────────────────────────────────────────────────

// Handle Supabase error redirects (e.g. expired magic link) before anything else
(function handleAuthError() {
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error');
  const desc = params.get('error_description');
  if (err) {
    history.replaceState(null, '', window.location.pathname);
    const msg = err === 'access_denied' && desc?.includes('expired')
      ? 'That sign-in link has expired — please request a new one.'
      : (desc?.replace(/\+/g, ' ') || 'Sign-in failed. Please try again.');
    // Show toast after DOM is ready
    setTimeout(() => { showToast(msg, 5000); openAuthSheet(); }, 300);
  }
})();

buildTopics();
loadAppSettings();
loadPlayerRoster();
maybeHandleJoinLink();

// Fallback: if onAuthStateChange never fires within 5s, unblock the UI
const _authFallbackTimer = setTimeout(() => {
  if (document.getElementById('profile-loading').style.display !== 'none') {
    currentUser = null; userProfile = null;
    renderProfileBar();
  }
}, 5000);

// Auth state listener — fires on page load (existing session) and on magic link callback
getSupabase().auth.onAuthStateChange(async (event, session) => {
  clearTimeout(_authFallbackTimer);
  try {
    currentUser = session?.user || null;
    userProfile = null;

    if (currentUser) {
      const { data } = await getSupabase()
        .from('profiles')
        .select('id, player_id, last_group_id, show_group_games, players(display_name)')
        .eq('id', currentUser.id)
        .maybeSingle();
      userProfile = data ? { ...data, player_name: data.players?.display_name || null } : null;
    }
    renderProfileBar();

    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      // Strip magic-link token from URL hash so a refresh doesn't re-process it,
      // but leave query params intact (join links use ?join=CODE)
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      closeAuthSheet();
      if (currentUser && !userProfile?.player_id) {
        openIdentityPicker();
      } else if (currentUser && userProfile?.player_id) {
        await maybeHandlePendingJoin();
      }
    }
    if (event === 'SIGNED_OUT') {
      currentGroup = null; myGroups = [];
      renderGroupUI();
    }
  } catch (e) {
    console.error('onAuthStateChange failed:', e);
  }
});
