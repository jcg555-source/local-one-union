alter table audit_logs
add column if not exists first_name text,
add column if not exists last_name text;
