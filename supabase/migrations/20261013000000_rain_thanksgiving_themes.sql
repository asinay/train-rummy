-- Extend theme validation only. Existing selections and all game data remain intact.
alter table public.app_settings
  drop constraint if exists app_settings_theme_name_check;
alter table public.app_settings
  add constraint app_settings_theme_name_check
  check (theme_name in ('classic', 'halloween', 'fall', 'winter', 'rain', 'thanksgiving'));

-- Retain the admin-code check and support-email behavior in the existing RPC.
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
  if p_theme_name is not null and p_theme_name not in ('classic', 'halloween', 'fall', 'winter', 'rain', 'thanksgiving') then
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

revoke all on function public.update_admin_settings(text, text, text) from public;
grant execute on function public.update_admin_settings(text, text, text) to anon, authenticated;
