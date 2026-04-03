# 🚀 Project Hub (RepoHub)

A **Cyber-Minimalist** portfolio and project gallery built with the latest web technologies. Features a "Holo-Deck" style bento grid layout with physics-based animations and premium glassmorphism aesthetics.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-SSR-green) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-blue) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-purple)

## ✨ Features

- **Cyber-Minimalist Design**: Dark mode, neon glows, and glassmorphism UI.
- **WebGPU-Powered 3D Particle Effects**: Advanced particle system using WebGPU with automatic WebGL fallback for maximum browser compatibility.
- **Bento Grid Layout**: Responsive, masonry-style grid for project cards.
- **Zero-Layout Shift Transitions**: Clicking a card expands it into a details modal using `framer-motion` layout animations.
- **Secure Admin Dashboard**:
  - Protected route `/admin` (Middleware + explicit admin allowlist).
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

- Node.js 20.9+ (required by Next.js 16)
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
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
ADMIN_EMAILS=admin@example.com
```

`ADMIN_EMAILS` is a comma-separated allowlist of admin email addresses. Any authenticated user whose email is not in this list will be blocked from `/admin` and from project mutations.

### 4. Supabase Configuration

`supabase/schema.sql` is the canonical schema source for this project. Use that file in Supabase instead of relying on a copied SQL snippet in this README.

Setup steps:

1. In Supabase Storage, create a new bucket named `projects` and enable **Public Bucket**.
2. Run the full contents of [`supabase/schema.sql`](supabase/schema.sql) in the Supabase **SQL Editor**.
3. Manage admin emails by adding them to the `public.admin_emails` table in the Supabase dashboard.

That schema creates all required runtime pieces, including:

- The `projects` and `admin_emails` tables.
- RLS policies for public reads and allowlisted admin mutations.
- Storage policies for the `projects` bucket.
- The `update_project_order(uuid[])` RPC used by drag-and-drop ordering in `/admin`.

If you change the database setup later, update [`supabase/schema.sql`](supabase/schema.sql) first and keep the README aligned with it.

### 5. Create Admin User

Since there is no public sign-up page:

1. Go to Supabase Dashboard -> **Authentication** -> **Users**.
2. Click **Add User** and create your admin credentials.
3. Add that exact email address to `ADMIN_EMAILS` in your environment.
4. Add that same email address to the `public.admin_emails` table in your Supabase database to ensure database-level RLS policies grant you access.

## 🏃‍♂️ Running Locally

```bash
npm run dev
```

- **Home**: `http://localhost:3000`
- **Admin**: `http://localhost:3000/admin` (Redirects to login unless the signed-in user email is allowlisted)

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
