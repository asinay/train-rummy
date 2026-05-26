drop policy if exists "public delete" on groups;
create policy "public delete" on groups for delete using (true);
