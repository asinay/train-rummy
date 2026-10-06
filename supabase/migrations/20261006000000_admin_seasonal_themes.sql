-- Shared visual theme; score tables and game history are unchanged.
alter table public.app_settings
  add column if not exists theme_name text not null default 'classic'
  check (theme_name in ('classic', 'halloween', 'fall', 'winter'));

-- Keep the admin code server-side and prevent direct public settings writes.
drop policy if exists "public update" on public.app_settings;
revoke all on public.app_settings from anon, authenticated;
revoke all on public.app_settings from public;
grant select (id, app_name, support_email, theme_name, created_at, updated_at)
  on public.app_settings to anon, authenticated;

create or replace function public.verify_admin_code(p_code text)
returns boolean
language sql security definer set search_path = ''
as $$
  select exists (
    select 1 from public.app_settings s
    where lower(s.admin_code) = lower(btrim(p_code))
  );
$$;

create or replace function public.update_admin_settings(
  p_admin_code text,
  p_theme_name text default null,
  p_support_email text default null
)
returns table (theme_name text, support_email text)
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.verify_admin_code(p_admin_code) then
    raise exception 'Admin code required' using errcode = '42501';
  end if;
  if p_theme_name is not null and p_theme_name not in ('classic', 'halloween', 'fall', 'winter') then
    raise exception 'Invalid theme' using errcode = '22023';
  end if;
  return query
    update public.app_settings s
    set theme_name = coalesce(p_theme_name, s.theme_name),
        support_email = coalesce(p_support_email, s.support_email)
    where lower(s.admin_code) = lower(btrim(p_admin_code))
    returning s.theme_name, s.support_email;
end;
$$;

revoke all on function public.verify_admin_code(text) from public;
revoke all on function public.update_admin_settings(text, text, text) from public;
grant execute on function public.verify_admin_code(text) to anon, authenticated;
grant execute on function public.update_admin_settings(text, text, text) to anon, authenticated;
