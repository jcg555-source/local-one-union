create extension if not exists pgcrypto;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id) on delete set null,
  admin_email text,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);
create index if not exists audit_logs_action_idx on audit_logs (action);
create index if not exists audit_logs_target_type_idx on audit_logs (target_type);
create index if not exists audit_logs_admin_email_idx on audit_logs (admin_email);
