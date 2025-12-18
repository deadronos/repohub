# Repo Map (As-Built)

## App Routes (Next.js App Router)

- `app/layout.tsx` — root layout, fonts, global styles.
- `app/globals.css` — Tailwind v4 import + theme variables + shared utility classes.
- `app/page.tsx` — home page: server fetch projects and render gallery.
- `app/login/page.tsx` — login form (server action submission).
- `app/admin/page.tsx` — admin page: server fetch projects and render dashboard.

## Server Actions

- `app/actions.ts` — login + project CRUD + storage uploads; revalidates `/` and `/admin`.

## Components

- `components/ProjectGallery.tsx` — public bento grid + modal expansion (framer-motion).
- `components/AdminDashboard.tsx` — admin list + modal form (create/edit) + bulk delete.

## Auth / Middleware

- `middleware.ts` — Next middleware entrypoint.
- `utils/supabase/middleware.ts` — refresh session cookies and enforce `/admin` auth.

## Supabase Client Utilities

- `utils/supabase/server.ts` — SSR Supabase client using Next cookies.
- `utils/supabase/client.ts` — browser Supabase client.

## Data Model

- `types/index.ts` — `Project` type.
- `supabase/schema.sql` — projects table and initial RLS/storage policies.

## Config

- `next.config.ts` — Next Image remotePatterns for Supabase.
- `env.example` — required env vars.
- `eslint.config.mjs`, `tsconfig.json`, `postcss.config.mjs` — tooling.
