-- Idempotent setup for atomic project sort_order reservation.
-- Safe to run on an existing project in the Supabase SQL editor.
-- Fixes PGRST202 "Could not find the function public.get_next_sort_order"
-- when creating projects from /admin (see utils/projects/sort-order.ts).

create sequence if not exists public.projects_sort_order_seq;

-- Start after the current highest sort_order so new projects don't collide.
select setval(
  'public.projects_sort_order_seq',
  greatest((select coalesce(max(sort_order), 0) from public.projects), 1),
  true
);

alter table public.projects
  alter column sort_order set default nextval('public.projects_sort_order_seq');

create or replace function public.get_next_sort_order()
returns integer
language sql
as $$
  select nextval('public.projects_sort_order_seq')::integer;
$$;

grant execute on function public.get_next_sort_order() to authenticated;

-- Make PostgREST pick up the new function immediately.
notify pgrst, 'reload schema';
