-- Groups: persistent named player groups (one per social circle / train car)
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Group membership: which players belong to which group
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  sort_order integer not null default 0,
  unique (group_id, player_id)
);

-- Add group scoping to game_rooms and game_history
alter table game_rooms
  add column if not exists group_id uuid references groups(id) on delete set null;

alter table game_history
  add column if not exists group_id uuid references groups(id) on delete set null;

-- Remember last used group per user
alter table profiles
  add column if not exists last_group_id uuid references groups(id) on delete set null;

-- Indexes
create index if not exists group_members_group_idx on group_members (group_id, sort_order);
create index if not exists group_members_player_idx on group_members (player_id);
create index if not exists game_rooms_group_idx on game_rooms (group_id);
create index if not exists game_history_group_idx on game_history (group_id);

-- RLS
alter table groups enable row level security;
alter table group_members enable row level security;

create policy "public read" on groups for select using (true);
create policy "public read" on group_members for select using (true);

create policy "public insert" on groups for insert with check (true);
create policy "public update" on groups for update using (true) with check (true);

create policy "public insert" on group_members for insert with check (true);
create policy "public delete" on group_members for delete using (true);

-- Seed default group with all existing players
do $$
declare
  g_id uuid;
begin
  -- Only seed if no groups exist yet
  if not exists (select 1 from groups) then
    insert into groups (name, join_code)
    values ('Train Commuters', 'TRAIN')
    returning id into g_id;

    insert into group_members (group_id, player_id, sort_order)
    select g_id, p.id, p.sort_order
    from players p
    where p.is_active = true
    on conflict do nothing;
  end if;
end;
$$;
