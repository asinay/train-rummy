-- Add missing DELETE policies so admin can clean up players and game rooms
drop policy if exists "public delete" on players;
create policy "public delete" on players for delete using (true);

drop policy if exists "public delete" on game_rooms;
create policy "public delete" on game_rooms for delete using (true);

-- game_history needs UPDATE for scrubbing player_names
drop policy if exists "public update" on game_history;
create policy "public update" on game_history for update using (true) with check (true);
