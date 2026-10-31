-- Idempotent setup for the database-side admin allowlist.
-- Safe to run on an existing project in the Supabase SQL editor.
-- Keep the inserted emails in sync with the ADMIN_EMAILS env var.

create table if not exists public.admin_emails (
  email text primary key check (email = lower(email))
);

alter table public.admin_emails enable row level security;

create or replace function public.is_admin_email()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from public.admin_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_admin_email() to authenticated;

-- Admins may read the allowlist (used by the app's env/DB drift check).
drop policy if exists "Admins can read admin emails" on public.admin_emails;
create policy "Admins can read admin emails"
  on public.admin_emails for select
  to authenticated
  using ( public.is_admin_email() );

-- Seed admins (lowercase). Replace/extend to match ADMIN_EMAILS.
insert into public.admin_emails (email)
values ('iridanblub@hotmail.de')
on conflict (email) do nothing;
