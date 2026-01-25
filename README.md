# 🚀 Project Hub (RepoHub)

A **Cyber-Minimalist** portfolio and project gallery built with the latest web technologies. Features a "Holo-Deck" style bento grid layout with physics-based animations and premium glassmorphism aesthetics.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-SSR-green) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-blue) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-purple)

## ✨ Features

- **Cyber-Minimalist Design**: Dark mode, neon glows, and glassmorphism UI.
- **WebGPU-Powered 3D Particle Effects**: Advanced particle system using WebGPU with automatic WebGL fallback for maximum browser compatibility.
- **Bento Grid Layout**: Responsive, masonry-style grid for project cards.
- **Zero-Layout Shift Transitions**: Clicking a card expands it into a details modal using `framer-motion` layout animations.
- **Secure Admin Dashboard**:
  - Protected route `/admin` (Middleware + Supabase Auth).
  - **CRUD Operations**: Create, Read, Update, and Delete projects.
  - **Image Upload**: Drag & drop upload directly to public Supabase Storage.
- **Tech Stack**:
  - **Framework**: Next.js 16 (App Router)
  - **Backend**: Supabase (PostgreSQL + Auth + Storage)
  - **Styling**: Tailwind CSS v4
  - **3D Graphics**: React Three Fiber with WebGPU renderer
  - **Icons**: Lucide React

## 🛠️ Setup Guide

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account

### 2. Installation

```bash
git clone https://github.com/yourusername/repohub.git
cd repohub
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
```

### 4. Supabase Configuration

Run the following SQL in your Supabase **SQL Editor** to set up the database and permissions:

```sql
-- 1. Create Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  short_description text,
  image_url text,
  repo_url text,
  demo_url text,
  tags text[],
  is_featured boolean default false
);

-- 2. Enable Security
alter table projects enable row level security;

-- 3. App Access Policies
create policy "Public view" on projects for select using (true);
create policy "Auth update" on projects for insert to authenticated with check (true);
create policy "Auth insert" on projects for update to authenticated using (true);
create policy "Auth delete" on projects for delete to authenticated using (true);

-- 4. Storage Policies (Ensure you create a public bucket named 'projects')
create policy "Public Access" on storage.objects for select using ( bucket_id = 'projects' );
create policy "Authenticated Upload" on storage.objects for insert to authenticated with check ( bucket_id = 'projects' );
```

> **Important**: Go to Supabase Storage -> Create a new bucket named `projects` and make sure **"Public Bucket"** is enabled.

### 5. Create Admin User

Since there is no public sign-up page:

1. Go to Supabase Dashboard -> **Authentication** -> **Users**.
2. Click **Add User** and create your admin credentials.

## 🏃‍♂️ Running Locally

```bash
npm run dev
```

- **Home**: `http://localhost:3000`
- **Admin**: `http://localhost:3000/admin` (Redirects to login if not authenticated)

## 📚 Documentation

- **[WebGPU Migration Guide](docs/WEBGPU_MIGRATION.md)**: Details on the WebGPU renderer implementation, browser compatibility, and fallback behavior.

## 🧪 Testing

```bash
npm run test          # Run all tests
npm run test:coverage # Generate coverage report
npm run typecheck     # TypeScript type checking
```

## 🌐 Browser Compatibility

The particle background uses WebGPU when available (Chrome 113+, Safari 18+) and automatically falls back to WebGL2 for broader compatibility. All major modern browsers are supported.
