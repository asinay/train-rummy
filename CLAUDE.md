# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local development

```bash
python local_server.py
# App runs at http://127.0.0.1:3000
```

No build step. Edit files, refresh browser.

For magic-link auth to work locally, add `http://127.0.0.1:3000` to **Redirect URLs** in the Supabase dashboard → Authentication → URL Configuration.

## Deploying

```bash
git push
# GitHub Pages rebuilds automatically → https://asinay.github.io/train-rummy/
```

## Database migrations

```bash
supabase link --project-ref svxqydcwiexgnhjezkrb   # first time only
supabase db push
```

Migrations live in `supabase/migrations/`. Always add a new file; never edit existing ones.

## Architecture

Single-page app — no framework, no bundler. Three files:

| File | Role |
|------|------|
| `index.html` | All screens + overlay markup; `APP_CONFIG` with Supabase credentials |
| `styles.css` | All styles (CSS variables for theming) |
| `app.js` | All logic — ~1 800 lines, no modules |

### Screen routing

`showScreen(id)` shows one `<div class="screen">` and hides all others. Screens: `setup`, `game`, `stats`, `winner`.

Overlays (sheets) are separate `<div class="overlay">` elements toggled via `display:flex/none`. They sit on top of whichever screen is active.

### State

All mutable state is module-level globals in `app.js`:

```
players          — [{id, name, total}] for the current game
playerRecords    — [{id, display_name}] scoped to currentGroup (or global when no group)
allPlayerRecords — full global roster, used by identity picker
rounds           — array of round score arrays
currentRoom      — room_code string
currentGameId    — UUID of the active game_rooms row
currentGroup     — {id, name, join_code, members:[]} | null
myGroups         — all groups the signed-in player belongs to
currentUser      — auth.users row
userProfile      — profiles row (player_id, last_group_id)
```

**Important:** `playerRecords` and `currentGroup.members` share the same array reference when a group is selected. Mutating one mutates the other — intentional for group scoping, but be careful on push/splice.

### Auth flow

`onAuthStateChange` handles both `INITIAL_SESSION` (page reload with existing session) and `SIGNED_IN` (fresh login). The profile bar shows a neutral "Loading…" state until the first event fires to avoid a flash of wrong UI. After sign-in, `renderProfileBar()` → `loadUserProfile()` → `loadMyGroups()` → `renderGroupUI()`.

### Groups

A group is a named collection of players that scopes the player roster, active games, and all-time stats. Key functions:

- `loadMyGroups()` — fetches groups for the signed-in player's `player_id`
- `selectGroup(group, persist)` — sets `currentGroup`, persists to `profiles.last_group_id`, refreshes UI
- `renderGroupUI()` — shows/hides group picker vs group bar based on state
- `loadMyActiveGames()` — fetches active `game_rooms` scoped to `currentGroup.id`

### RLS gotchas

Supabase RLS returns `{data:[], error:null}` when a DELETE is blocked — no error. Always use `{ count: 'exact' }` on delete calls and check `count === 0`:

```js
const { error, count } = await client.from('table')
  .delete({ count: 'exact' })
  .eq('id', someId);
if (error || count === 0) { showToast('Could not delete'); return; }
```

Every table needs explicit DELETE (and UPDATE) policies — the default is deny. When a new table or operation silently fails, check the policies first.

### Admin panel

Accessed via the ⚙️ button on the home screen with a hardcoded code (`adminCode = 'asaf'` in `app.js`). Provides cascade-delete for groups, players, game rooms, and history. All destructive buttons use a double-tap confirm pattern: first tap shows "Sure?", second tap executes.

### Scoring model

Scores accumulate across rounds. When a player joins mid-game (`joined_at_round > 1`), the game is split into **legs** — the scoreboard and stats compare players only within the leg they share. `game_players.joined_at_round` tracks this.
