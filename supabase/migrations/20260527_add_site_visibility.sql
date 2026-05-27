alter table sites
add column if not exists visibility text default 'member';

update sites
set visibility = case
  when slug in ('new-york-university', 'nyu-langone') then 'public'
  else coalesce(visibility, 'member')
end
where visibility is null
   or slug in ('new-york-university', 'nyu-langone');

alter table sites
alter column visibility set default 'member';
