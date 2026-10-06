# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local development

```bash
python local_server.py
# App runs at http://127.0.0.1:3000
```

No build step. Edit files, refresh browser.

**Cache gotcha:** `index.html` loads `styles.css`/`app.js` with a `?v=N` query param. Bump it whenever either file changes — otherwise browsers (including your own, mid-session) keep serving the cached version and edits silently don't show up. This has bitten this project before (see git history) and during this session (CSS changes invisible until the version bump).

## Deploying

```bash
git push
# GitHub Pages rebuilds automatically → https://asinay.github.io/train-rummy/
```

There is no CI and no test suite — `git push` to `master` goes live immediately. Prefer testing locally (and, for anything touching Supabase, against the real linked project — there's no local/staging DB) before pushing.

## Database migrations

```bash
supabase link --project-ref svxqydcwiexgnhjezkrb   # first time only
supabase db push
```

Migrations live in `supabase/migrations/`. Always add a new file; never edit existing ones.

## Architecture

Single-page app — no framework, no bundler, no user accounts (anon Supabase key only; a room can optionally be locked with a plain `room_password`). Core logic in three files, plus theme files added for seasonal theming:

| File | Role |
|------|------|
| `index.html` | All screens + overlay markup; `APP_CONFIG` with Supabase credentials |
| `styles.css` | Base styles, CSS variables for theming |
| `app.js` | All game/stats/admin logic, no modules, ~1 600 lines |
| `theme.js` | Polls the shared `theme_name`, swaps themed copy/colors on load |
| `celebration.js` + `celebration.css` | Seasonal end-game particle effects (leaves/snow/Halloween) |
| `halloween.css`, `seasons.css` | Per-theme CSS variable overrides + decoration, keyed off `[data-theme=...]` |

### Screen routing

`showScreen(id)` shows one `<div class="screen">` and hides all others. Screens: `setup`, `game`, `stats`, `winner`.

Overlays (sheets) are separate `<div class="overlay">` elements toggled via `display:flex/none`. They sit on top of whichever screen is active — e.g. `admin-overlay`, `scorecard-overlay`, `player-stats-overlay`.

### State

All mutable state is module-level globals in `app.js`. The important ones:

```
players          — [{id, name, total}] for the current game
playerRecords    — [{id, display_name}] — the global player roster
rounds           — array of round score arrays
currentRoom      — room_code string
currentGameId    — UUID of the active game_rooms row
currentPassword  — room_password for the current room, if any
adminSessionCode — the admin code entered this session; null when the admin overlay is closed
_cachedHistory   — loadHistory() result, cached per Stats-screen visit; null it after any write
```

There is no auth and no groups/profiles concept — those were part of an earlier design (see `20260603000000_remove_auth.sql`) and the `profiles`/`groups`/`group_members` tables are unused leftovers, not read by `app.js`.

### RLS gotchas

Supabase RLS returns `{data:[], error:null}` when a DELETE is blocked — no error. Always use `{ count: 'exact' }` on delete calls and check `count === 0`:

```js
const { error, count } = await client.from('table')
  .delete({ count: 'exact' })
  .eq('id', someId);
if (error || count === 0) { showToast('Could not delete'); return; }
```

Every table needs explicit DELETE (and UPDATE) policies — the default is deny. When a new table or operation silently fails, check the policies first.

`game_history.game_id references game_rooms(id) on delete set null` — when deleting both a room and its history row (e.g. admin cascade-delete), **delete `game_history` first**. Delete the room first and Postgres nulls `game_id` out from under you before your own `.eq('game_id', roomId)` delete runs, orphaning the history row with no error raised. (Found and fixed exactly this bug in `adminDeleteRoom` — see git history.)

Admin → Rooms and Admin → History are both wired to clean up the other side: `adminDeleteRoom` deletes the matching `game_history` row (if any) before the room, and `adminDeleteHistory` deletes the matching `game_rooms` row (if `game_id` is non-null) after the history row. Deleting from either screen always leaves nothing orphaned on the other side.

### Admin panel

Accessed via the ⚙️ button on the home screen. The code itself lives only in `app_settings.admin_code` (never sent to clients); `checkAdminAuth()` calls the `verify_admin_code` RPC, and theme/support-email writes go through `update_admin_settings`, both added in `20261006000000_admin_seasonal_themes.sql`. The entered code is cached in the `adminSessionCode` global for the rest of the session and passed to subsequent admin RPC calls; it's cleared on `closeAdmin()`.

Provides cascade-delete for players, game rooms, and history, a "Data" section to export all game history as JSON, and the shared seasonal-theme picker. All destructive buttons use a double-tap confirm pattern: first tap shows "Sure?", second tap executes.

### Canceled games

If "End Game" is tapped before any rounds are recorded, the game is treated as canceled: the `game_rooms` row is deleted and the user is returned to the setup screen. Nothing is written to history. This handles demo/test sessions without leaving orphaned records.

### Ending a game — duplicate-write guards

`endGame()` guards against two ways a game could get double-recorded into `game_history`: the End Game button disables itself while the save is in-flight (closes a rapid-repeat-tap race), and the function checks whether the room's `status` is already `ended` before writing (closes the case where a second device still has the same game open after someone else already ended it). See `endingGame` and the `alreadyEnded` check in `app.js`.

### Stats & player detail

The Stats screen's Leaderboard folds to the top 3 (`statsLeaderExpanded`/`STATS_LEADER_INITIAL`); Game History folds similarly (`statsHistoryExpanded`/`STATS_HISTORY_INITIAL`). Tapping a Leaderboard row opens `player-stats-overlay` via `openPlayerStats(name)`, computed entirely from `loadHistory()`'s `game_history` rows — no live `round_scores` query, since those cascade-delete with their room and would be incomplete for older games.

Head-to-head (`_playerRivals`, folds via `playerRivalsExpanded`/`PLAYER_RIVALS_INITIAL`) compares `legTotal` between the viewed player and each opponent within legs they both played — the win count is *from the viewed player's perspective* ("Scott 11W – 5L" means the player whose sheet is open beat Scott 11 times). The streak badge walks that same player's legs backward from most recent and counts a run of identical win/loss outcomes.

### Scoring model

Scores accumulate across rounds. When a player joins mid-game (`joined_at_round > 1`), the game is split into **legs** — the scoreboard and stats compare players only within the leg they share. `game_players.joined_at_round` tracks this.
