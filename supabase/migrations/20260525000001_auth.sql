-- Profiles: one row per auth.users entry
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  player_id uuid references players(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Add created_by to game_rooms
alter table game_rooms
  add column if not exists created_by uuid references profiles(id) on delete set null;

-- RLS on profiles
alter table profiles enable row level security;

drop policy if exists "profiles select own" on profiles;
create policy "profiles select own"
on profiles for select
using (id = auth.uid());

drop policy if exists "profiles update own" on profiles;
create policy "profiles update own"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- game_rooms: authenticated users can insert; only creator can update/delete
drop policy if exists "public insert" on game_rooms;
create policy "authenticated insert rooms"
on game_rooms for insert
to authenticated
with check (true);

drop policy if exists "public update" on game_rooms;
create policy "creator update rooms"
on game_rooms for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- game_players: any authenticated user can manage players in rooms they created
drop policy if exists "public insert" on game_players;
create policy "authenticated insert game_players"
on game_players for insert
to authenticated
with check (
  exists (
    select 1 from game_rooms
    where id = game_id
    and (created_by = auth.uid() or status = 'active')
  )
);

drop policy if exists "public delete" on game_players;
create policy "authenticated delete game_players"
on game_players for delete
to authenticated
using (
  exists (select 1 from game_rooms where id = game_id and created_by = auth.uid())
);

-- round_scores: any authenticated or anonymous user in an active room can write
-- (creator-only for auth is too restrictive for commuter play — anyone at the table can score)
drop policy if exists "public insert" on round_scores;
create policy "insert round_scores active room"
on round_scores for insert
with check (
  exists (select 1 from game_rooms where id = game_id and status = 'active')
);

drop policy if exists "public update" on round_scores;
create policy "update round_scores active room"
on round_scores for update
using (
  exists (select 1 from game_rooms where id = game_id and status = 'active')
)
with check (
  exists (select 1 from game_rooms where id = game_id and status = 'active')
);

drop policy if exists "public delete" on round_scores;
create policy "delete round_scores active room"
on round_scores for delete
using (
  exists (select 1 from game_rooms where id = game_id and status = 'active')
);

-- game_history: authenticated users can insert; creator can delete
drop policy if exists "public insert" on game_history;
create policy "authenticated insert history"
on game_history for insert
to authenticated
with check (true);

drop policy if exists "public delete" on game_history;
create policy "creator delete history"
on game_history for delete
to authenticated
using (
  exists (select 1 from game_rooms where id = game_id and created_by = auth.uid())
);
