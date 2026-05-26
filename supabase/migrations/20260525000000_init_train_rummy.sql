create extension if not exists pgcrypto;

-- App-level settings (admin code, app name)
create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  admin_code text not null default 'asaf',
  app_name text not null default 'Train Rummy',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Known players pool (persists across games)
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Live game rooms
create table if not exists game_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  status text not null default 'active' check (status in ('active', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Players in a specific game (with join order for leg tracking)
create table if not exists game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references game_rooms(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  joined_at_round integer not null default 0,
  sort_order integer not null default 0,
  unique (game_id, player_id)
);

-- Round-by-round scores
create table if not exists round_scores (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references game_rooms(id) on delete cascade,
  round_number integer not null,
  player_id uuid not null references players(id) on delete cascade,
  score integer,
  created_at timestamptz not null default now(),
  unique (game_id, round_number, player_id)
);

-- Completed game history (summary)
create table if not exists game_history (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references game_rooms(id) on delete set null,
  room_code text not null,
  played_at timestamptz not null default now(),
  winner_name text not null,
  winner_score integer not null,
  rounds_count integer not null,
  player_names text[] not null,
  legs_json jsonb not null default '[]'
);

-- Indexes
create index if not exists round_scores_game_idx on round_scores (game_id, round_number);
create index if not exists game_players_game_idx on game_players (game_id, sort_order);
create index if not exists game_history_played_idx on game_history (played_at desc);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_settings_set_updated_at on app_settings;
create trigger app_settings_set_updated_at
before update on app_settings
for each row execute function set_updated_at();

drop trigger if exists game_rooms_set_updated_at on game_rooms;
create trigger game_rooms_set_updated_at
before update on game_rooms
for each row execute function set_updated_at();

-- Seed data
insert into app_settings (admin_code, app_name)
select 'asaf', 'Train Rummy'
where not exists (select 1 from app_settings);

insert into players (display_name, sort_order) values
  ('Jen',   1),
  ('Kelly', 2),
  ('Scott', 3),
  ('Asaf',  4)
on conflict (display_name) do update
  set sort_order = excluded.sort_order,
      is_active  = true;

-- Row Level Security
alter table app_settings  enable row level security;
alter table players        enable row level security;
alter table game_rooms     enable row level security;
alter table game_players   enable row level security;
alter table round_scores   enable row level security;
alter table game_history   enable row level security;

-- Public read/write policies (private friend-group app, anon key exposure is acceptable)
drop policy if exists "public read"  on app_settings;
drop policy if exists "public read"  on players;
drop policy if exists "public read"  on game_rooms;
drop policy if exists "public read"  on game_players;
drop policy if exists "public read"  on round_scores;
drop policy if exists "public read"  on game_history;

create policy "public read" on app_settings  for select using (true);
create policy "public read" on players        for select using (true);
create policy "public read" on game_rooms     for select using (true);
create policy "public read" on game_players   for select using (true);
create policy "public read" on round_scores   for select using (true);
create policy "public read" on game_history   for select using (true);

drop policy if exists "public insert" on players;
drop policy if exists "public update" on players;
create policy "public insert" on players for insert with check (true);
create policy "public update" on players for update using (true) with check (true);

drop policy if exists "public insert" on game_rooms;
drop policy if exists "public update" on game_rooms;
create policy "public insert" on game_rooms for insert with check (true);
create policy "public update" on game_rooms for update using (true) with check (true);

drop policy if exists "public insert" on game_players;
drop policy if exists "public delete" on game_players;
create policy "public insert" on game_players for insert with check (true);
create policy "public delete" on game_players for delete using (true);

drop policy if exists "public insert" on round_scores;
drop policy if exists "public update" on round_scores;
drop policy if exists "public delete" on round_scores;
create policy "public insert" on round_scores for insert with check (true);
create policy "public update" on round_scores for update using (true) with check (true);
create policy "public delete" on round_scores for delete using (true);

drop policy if exists "public insert" on game_history;
drop policy if exists "public delete" on game_history;
create policy "public insert" on game_history for insert with check (true);
create policy "public delete" on game_history for delete using (true);

drop policy if exists "public update" on app_settings;
create policy "public update" on app_settings for update using (true) with check (true);
