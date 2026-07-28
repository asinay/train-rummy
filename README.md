# 🚄 Train Rummy

> A score tracker for the card game played on the Boston commuter rail to North Station.

**Live app:** https://asinay.github.io/train-rummy/

---

## The game

Train Rummy is a two-deck Rummy variant built for the commute — fast rounds, fierce competition, and just enough strategy to make the ride fly by.

Each player is dealt **14 cards** from a double deck (104 cards + 2 Jokers). On your turn you draw, meld sets or sequences, and discard. The twist: your score goes **up** for every card you meld, and **down** for every card left in your hand when someone goes out. High score wins.

A few wrinkles that keep things interesting:

- **First meld must total 51+ points** — you can't open cheap
- **Remi** — meld your entire hand in one turn with no prior melds, and everyone else takes *double* penalties
- **Steal a Joker** — replace any tabled Joker with the natural card it represents and pocket the wild
- **Take the pile** — grab the entire discard pile if you can immediately use the top card in a new meld

### Scoring quick reference

| Card | Melded (positive) | In hand (penalty) |
|------|:-----------------:|:-----------------:|
| Ace (high: Q–K–A) | +15 | −15 |
| Ace (low: A–2–3) | +5 | −15 |
| J, Q, K, 10 | +10 | −10 |
| 2–9, Joker | +5 | −5 |

---

## The app

A mobile-first score tracker so one person can log rounds for the whole table — no pen and paper needed.

### Features

- **Groups** — persistent player groups (e.g. "Train Commuters"); each group has its own roster, stats, and game history. One app, multiple social circles.
- **Room codes** — start a game inside your group, share the code (e.g. `TRAIN-4829`), anyone can join from their phone
- **Continue a game** — active games in your group appear front-and-centre when you open the app; tap to resume instantly
- **Live sync** — scores update every 4 seconds across all connected devices
- **Mid-game joins** — tap ➕ to add a late arrival; scores split into legs so early and late players are ranked fairly
- **All-time leaderboard** — per-group stats sorted by leg win %, with round win rate and avg score
- **Game history** — full expandable history of completed games per group
- **Magic link sign-in** — no passwords; sign in with your email and pick your player identity
- **Rules sheet** — full rules in-app, organized by topic, always one tap away
- **Canceled games** — ending a game before any rounds are recorded silently deletes it (no history entry); useful for demos or accidental starts
- **Super-admin panel** — manage groups, players, game rooms, and history; cascade-delete with confirmation

---

## Tech stack

- Pure HTML / CSS / JS — no framework, no build step
- [Supabase](https://supabase.com) — Postgres database, RLS, magic link auth
- Hosted on GitHub Pages

---

## Local development

### 1. Start the local server

```bash
python local_server.py
```

The app is now running at **http://127.0.0.1:3000**.

### 2. Allow the local URL for magic link auth

In your [Supabase dashboard](https://supabase.com/dashboard) → **Authentication → URL Configuration**, add:

```
http://localhost:8765
```

to the **Redirect URLs** list so magic links land back on your local server after sign-in.

> You can also run `python -m http.server 8765` but `local_server.py` is preferred — it always serves from the repo root regardless of your working directory.

### 3. Make changes, refresh, and test

All logic lives in three files:

| File | What it contains |
|------|-----------------|
| [index.html](index.html) | App shell, all screens and overlays, `APP_CONFIG` |
| [styles.css](styles.css) | All styles |
| [app.js](app.js) | Game logic, Supabase queries, auth, groups, admin |

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

| Table | Purpose |
|-------|---------|
| `app_settings` | Admin code, app name |
| `players` | Persistent player roster (global) |
| `profiles` | Auth user → player identity + last group |
| `groups` | Persistent named player groups |
| `group_members` | Group ↔ player membership |
| `game_rooms` | Live game sessions (scoped to a group) |
| `game_players` | Players in a specific game |
| `round_scores` | Per-round scores |
| `game_history` | Completed game summaries (scoped to a group) |

### Migrations

| File | What it does |
|------|-------------|
| `20260525000000_init_train_rummy.sql` | Core tables, RLS, seed players |
| `20260525000001_auth.sql` | Profiles, magic-link auth, auth-gated policies |
| `20260526000000_groups.sql` | Groups + group_members, group_id FKs, seed default group |
| `20260526000001_fix_delete_policies.sql` | DELETE policies for players, game_rooms; UPDATE for game_history |

---

## Deploying

```bash
git add .
git commit -m "your message"
git push
```

GitHub Pages rebuilds automatically. The live URL is https://asinay.github.io/train-rummy/.
