alter table profiles
  add column if not exists show_group_games boolean not null default false;
