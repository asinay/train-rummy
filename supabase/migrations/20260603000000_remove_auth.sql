-- Replace authenticated-only policies with public policies so the app works
-- without Supabase Auth. A room_password column gates write access in app logic.

-- Add password column to game_rooms
alter table game_rooms
  add column if not exists room_password text not null default '';

-- Drop all policies on game_rooms (auth-dependent and any pre-existing public ones)
drop policy if exists "authenticated insert rooms"  on game_rooms;
drop policy if exists "creator update rooms"        on game_rooms;
drop policy if exists "public read"                 on game_rooms;
drop policy if exists "public insert"               on game_rooms;
drop policy if exists "public update"               on game_rooms;
drop policy if exists "public delete"               on game_rooms;

-- Open policies — anyone with the anon key can read/insert/update/delete rooms
create policy "public read"   on game_rooms for select using (true);
create policy "public insert" on game_rooms for insert with check (true);
create policy "public update" on game_rooms for update using (true) with check (true);
create policy "public delete" on game_rooms for delete using (true);

-- Drop auth-dependent policies on game_players
drop policy if exists "authenticated insert game_players" on game_players;
drop policy if exists "authenticated delete game_players" on game_players;
drop policy if exists "public insert"                     on game_players;
drop policy if exists "public delete"                     on game_players;

create policy "public insert" on game_players for insert with check (true);
create policy "public delete" on game_players for delete using (true);

-- Drop auth-dependent policies on round_scores
drop policy if exists "insert round_scores active room" on round_scores;
drop policy if exists "update round_scores active room" on round_scores;
drop policy if exists "delete round_scores active room" on round_scores;

create policy "public insert" on round_scores for insert with check (true);
create policy "public update" on round_scores for update using (true) with check (true);
create policy "public delete" on round_scores for delete using (true);

-- Drop auth-dependent policies on game_history
drop policy if exists "authenticated insert history" on game_history;
drop policy if exists "creator delete history"       on game_history;
drop policy if exists "public insert"                on game_history;
drop policy if exists "public delete"                on game_history;

create policy "public insert" on game_history for insert with check (true);
create policy "public delete" on game_history for delete using (true);
