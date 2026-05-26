alter table sites
add column if not exists city text,
add column if not exists state text,
add column if not exists zipcode text,
add column if not exists is_active boolean default true;
