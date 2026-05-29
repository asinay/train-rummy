alter table app_settings
  add column if not exists support_email text not null default '';
