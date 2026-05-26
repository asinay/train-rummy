🚄 Train Rummy — App Summary
What it is
A mobile-first multiplayer score tracker for a custom variant of Rummy played by a regular commuter group (Jen, Kelly, Scott, Asaf) on the Boston commuter rail to North Station.

Tech stack

Pure HTML/CSS/JS — single file, zero dependencies, zero build step
Google Fonts — Playfair Display (headings) + IBM Plex Sans (body)
Storage — currently uses the Claude artifact window.storage API (shared, persistent). This must be replaced when moving to a real host — see below.


Storage — the most important migration task
The app uses window.storage.get/set with shared: true, which is Claude-artifact-specific and won't exist outside claude.ai. You'll need to replace it with a real backend. Your options:

Supabase (you already have an account) — best fit. Two tables: game_rooms (live game state) and game_history (completed games). Gives you real-time sync, persistence, and auth if you ever want it.
Firebase Firestore — similar, good real-time support
localStorage — works for single-device use only, no live sync between players

All storage calls are isolated in four functions, so the migration is surgical:

saveGameState() — saves live room state
loadGameState(code) — loads room by code
saveGameToHistory() — saves completed game
loadHistory() — loads all past games


Key features

Room codes — auto-generated (e.g. TRAIN-4829), shareable verbally or by text
Live sync — polls every 4 seconds, any player can enter scores
Mid-game player join — ➕ button adds late arrivals; scores split into legs automatically based on when players joined
Leg-based winner screen — separate standings per leg (e.g. Jen & Kelly pre-arrival, full group after)
All-time stats — leaderboard sorted by round win %, with leg wins, avg score/round, and total score
Admin panel — locked behind typing "Asaf", allows resetting all history
Rules reference — full in-app rules sheet with topic navigation
View-only mode — after ending a game, score entry is hidden; Back to home is shown


Game-specific rules baked in

Penalty chips: A=−15, J/Q/K/10=−10, 2–9=−5
Bonus chips: +5, +10, +15
Default players: Jen, Kelly pre-filled; Scott and Asaf added as needed
First meld must total 51+ points
Remi = meld all cards in one turn → double penalties for others


File structure (as-is)
Single file: index.html
When you expand it, a clean structure would be:
train-rummy/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js        # screen routing, game logic
│   ├── storage.js    # all storage calls (swap this for Supabase)
│   ├── stats.js      # leaderboard + history rendering
│   └── rules.js      # rules data + rendering
└── README.md

GitHub Pages deployment

Create repo train-rummy on GitHub
Push index.html to main
Go to Settings → Pages → Source: main / / (root)
App will be live at https://yourusername.github.io/train-rummy

Once on GitHub Pages, swap window.storage for Supabase and add your Supabase URL + anon key as plain JS constants (it's a private friend-group app, so the anon key exposure is fine).

Recommended next steps in order

Export the artifact HTML
Create GitHub repo, push as index.html
Enable GitHub Pages
Create Supabase project, add two tables, replace the four storage functions
Share the GitHub Pages URL with the group

Want me to write the Supabase schema and the replacement storage functions now so they're ready to drop in?