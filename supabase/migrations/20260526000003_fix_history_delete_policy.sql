-- Replace restrictive creator-only delete with open delete (admin panel needs this)
drop policy if exists "creator delete history" on game_history;
drop policy if exists "public delete" on game_history;
create policy "public delete" on game_history for delete using (true);
