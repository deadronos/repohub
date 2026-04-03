-- 1. Create the table
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sort_order integer not null default 0,
  title text not null,
  description text,
  short_description text,
  image_url text, -- Link to Supabase Storage
  repo_url text,
  demo_url text,
  tags text[], -- Array of strings e.g. ['Nextjs', 'TypeScript']
  is_featured boolean default false
);

-- 2. Enable Row Level Security (RLS)
alter table projects enable row level security;

-- 3. Create Policy: Everyone can READ
create policy "Public projects are viewable by everyone"
  on projects for select
  using ( true );

-- 4. Define the admin allowlist used by RLS.
-- We use a table to store admin emails so they can be managed dynamically
-- without modifying the schema.
create table public.admin_emails (
  email text primary key check (email = lower(email))
);

-- Protect the table.
alter table public.admin_emails enable row level security;

-- The function that checks if the current user is an admin.
-- It uses 'security definer' to read from the 'admin_emails' table
-- which is otherwise restricted by RLS.
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

-- 5. Create Policies: Only allowlisted admin emails can mutate projects
create policy "Admins can insert projects"
  on projects for insert
  to authenticated
  with check ( public.is_admin_email() );

create policy "Admins can update projects"
  on projects for update
  to authenticated
  using ( public.is_admin_email() )
  with check ( public.is_admin_email() );

create policy "Admins can delete projects"
  on projects for delete
  to authenticated
  using ( public.is_admin_email() );

-- 6. Storage Policies (Run these AFTER creating a 'projects' bucket in the Storage dashboard)
-- Make the 'projects' bucket PUBLIC:
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'projects' );

-- Allow allowlisted admin emails to upload project images:
create policy "Admin Upload"
  on storage.objects for insert 
  to authenticated 
  with check ( bucket_id = 'projects' and public.is_admin_email() );

-- Allow allowlisted admin emails to delete uploaded project images:
create policy "Admin Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'projects' and public.is_admin_email() );

-- 7. Project ordering helper (batch update)
create or replace function update_project_order(ordered_ids uuid[])
returns integer
language sql
as $$
  with updates as (
    update projects
    set sort_order = ord.ordinality
    from unnest(ordered_ids) with ordinality as ord(id, ordinality)
    where projects.id = ord.id
    returning projects.id
  )
  select count(*) from updates;
$$;

grant execute on function update_project_order(uuid[]) to authenticated;
