<div align="center">
  <img src="apple-touch-icon.png" alt="Train Rummy icon" width="96" height="96">
  <h1>Train Rummy</h1>
</div>

> A score tracker for the card game played on the Boston commuter rail to North Station.

**Live app:** https://asinay.github.io/train-rummy/

---

## The game

Train Rummy is a single-deck Rummy variant built for the commute — fast rounds, fierce competition, and just enough strategy to make the ride fly by.

Each player is dealt **8 cards** from a single 52-card deck (no jokers). On your turn you draw, meld sets or sequences, and discard. The twist: your score goes **up** for every card you meld, and **down** for every card left in your hand when someone goes out. High score wins.

A few wrinkles that keep things interesting:

- **Remi** — meld your entire hand in one turn with no prior melds, and everyone else takes *double* penalties
- **Take the pile** — grab the entire discard pile if you can immediately use the top card in a new meld

### Scoring quick reference

| Card | Melded (positive) | In hand (penalty) |
|------|:-----------------:|:-----------------:|
| Ace (high: Q–K–A) | +15 | −15 |
| Ace (low: A–2–3) | +5 | −15 |
| J, Q, K, 10 | +10 | −10 |
| 2–9 | +5 | −5 |

---

## The app

A mobile-first score tracker so one person can log rounds for the whole table — no pen and paper needed.

### Features

- **Room codes** — start a game, share the code (e.g. `TRAIN-4829`), anyone can join from their phone; rooms can optionally be locked with a password
- **Live sync** — open devices poll every 4 seconds so everyone sees the latest scores
- **Mid-game joins** — tap ➕ to add a late arrival; scores split into legs so early and late players are ranked fairly
- **All-time leaderboard** — sorted by leg win %, folded to the top 3 with "Show all"; each row shows round win rate, avg score, and personal-best game
- **Player detail stats** — tap any player for a themed sheet: win-rate tiles, a score trend chart, a round-record bar, a hot/cold streak badge, and head-to-head records (e.g. "Scott 11W – 5L – 2T" means *this* player beat Scott 11 times) against every opponent they've shared a leg with
- **Seasonal themes** — admin picks Classic, Halloween, Fall, or Winter for everyone; themed celebrations, decorations, and copy follow automatically
- **Game history** — full expandable history of completed games, exportable as JSON (admin-only)
- **Rules sheet** — full rules in-app, organized by topic, always one tap away
- **Canceled games** — ending a game before any rounds are recorded silently deletes it (no history entry); useful for demos or accidental starts
- **Admin panel** — code-gated (not a user account); manage players, game rooms, history, the support email, and the shared theme; cascade-delete with confirmation

### Seasonal themes

Admin → App theme offers Classic, Halloween, Fall, and Winter. The selection is
saved in Supabase and shared with all devices; open pages refresh it every five
seconds. Game scores, room codes, history, and statistics use the existing data.

End-game celebrations match the theme: confetti for Classic, leaves for Fall,
snowflakes for Winter, and pumpkins, ghosts, and spiders for Halloween. Seasonal
particles respect reduced-motion preferences and clean themselves up after use.

The admin code itself lives only in `app_settings.admin_code` server-side —
`verify_admin_code`/`update_admin_settings` RPCs (added in
`20261006000000_admin_seasonal_themes.sql`) check it and apply theme/support-email
changes without ever exposing the column to clients. If you fork this repo,
apply that migration before (or together with) deploying this frontend version —
older frontends read a `admin_code` column directly and would silently stop
working against the locked-down schema.

---

## Tech stack

- Pure HTML / CSS / JS — no framework, no build step
- [Supabase](https://supabase.com) — Postgres database, row-level security, anon-key access (no user accounts)
- Hosted on GitHub Pages

---

## Local development

### 1. Start the local server

```bash
python local_server.py
```

The app is now running at **http://127.0.0.1:3000**.

> You can also run `python -m http.server 8765` but `local_server.py` is preferred — it always serves from the repo root regardless of your working directory.

### 2. Make changes, refresh, and test

> **Cache gotcha:** `index.html` loads `styles.css`/`app.js` with a `?v=N` query param. If you edit either file, bump its `v` — otherwise browsers (yours and your testers') keep serving the cached version and your changes won't appear.

Core logic lives in three files, plus a handful of theme-specific files:

| File | What it contains |
|------|-----------------|
| [index.html](index.html) | App shell, all screens and overlays, `APP_CONFIG` |
| [styles.css](styles.css) | Base styles, CSS variables for theming |
| [app.js](app.js) | Game logic, Supabase queries, stats, admin |
| [theme.js](theme.js) | Reads/writes the shared theme setting, swaps themed copy |
| [celebration.js](celebration.js) / [celebration.css](celebration.css) | Seasonal end-game particle effects |
| [halloween.css](halloween.css) / [seasons.css](seasons.css) | Per-theme color variables and decoration |

---

## Database

Schema lives in [`supabase/migrations/`](supabase/migrations/). To apply changes:

```bash
# Link to the project (first time only)
supabase link --project-ref svxqydcwiexgnhjezkrb

# Push migrations
supabase db push
```

### Tables

Actively used by the current frontend:

| Table | Purpose |
|-------|---------|
| `app_settings` | Admin code (server-side only), app name, support email, shared `theme_name` |
| `players` | Persistent global player roster |
| `game_rooms` | Live game sessions; `status` is `active` or `ended`, optional `room_password` |
| `game_players` | Players in a specific game, with `joined_at_round` for leg tracking |
| `round_scores` | Per-round scores. **Cascade-deletes with its `game_rooms` row** — gone once a room is admin-deleted, even though `game_history` survives |
| `game_history` | Permanent completed-game summaries (survives room deletion; `game_id` is `ON DELETE SET NULL`, so delete the history row *before* the room when cleaning up, or it orphans with a null `game_id`) |

`profiles`, `groups`, and `group_members` tables still exist in the database from an earlier auth/groups design but are unused by the current frontend — see `20260603000000_remove_auth.sql` for when that model was dropped in favor of anon-key access with optional per-room passwords.

### Migrations

Each migration is a separate timestamped file in [`supabase/migrations/`](supabase/migrations/) — filenames describe their own purpose. Always add a new file; never edit an existing one, even for a tiny fix.

---

## Deploying

```bash
git add .
git commit -m "your message"
git push
```

GitHub Pages rebuilds automatically. The live URL is https://asinay.github.io/train-rummy/.
