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

-- 4. Create Policy: Only Authenticated Users (You) can INSERT/UPDATE/DELETE
create policy "Users can insert their own projects"
  on projects for insert
  to authenticated
  with check ( true );
  
create policy "Users can update their own projects"
  on projects for update
  to authenticated
  using ( true );

-- 5. Storage Policies (Run these AFTER creating a 'projects' bucket in the Storage dashboard)
-- Make the 'projects' bucket PUBLIC:
create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'projects' );

-- Allow authenticated users (you) to upload:
create policy "Authenticated Upload" 
  on storage.objects for insert 
  to authenticated 
  with check ( bucket_id = 'projects' );
