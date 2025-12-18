# Copilot instructions (RepoHub)

## Big picture

- This is a **single Next.js 16 App Router** app that uses **Supabase (Postgres + Auth + Storage)**.
- Public UI reads from `projects`; admin UI performs CRUD + image uploads.

## Key flows (follow existing patterns)

- **Public gallery**: server fetch in `app/page.tsx` using `createClient()` from `utils/supabase/server.ts`, then render the interactive client component `components/ProjectGallery.tsx`.
- **Admin route protection**: `middleware.ts` delegates to `utils/supabase/middleware.ts`.
  - `updateSession()` refreshes cookies and redirects `/admin*` → `/login` when no user.
  - Avoid adding logic between `createServerClient()` and `supabase.auth.getUser()` (see warning in `utils/supabase/middleware.ts`).
- **Mutations**: use Next **Server Actions** in `app/actions.ts` (`'use server'`).
  - After writes, call `revalidatePath('/')` and `revalidatePath('/admin')` (current behavior).
  - Image uploads go to Storage bucket `projects` and persist the public URL into `projects.image_url`.

## Supabase conventions

- Env vars required (see `env.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- DB schema & RLS live in `supabase/schema.sql`.
  - App calls delete (`deleteProjects()`); ensure Supabase has a matching `DELETE` policy if deletes fail.

## UI conventions

- Styling uses **Tailwind CSS v4** with custom utilities in `app/globals.css` (notably `.glass-panel` and `.text-glow`).
- Animations use `framer-motion` layoutId transitions (see `components/ProjectGallery.tsx`).
- Project type is centralized in `types/index.ts`; keep it aligned with the `projects` table.

## Dev workflows

- Run locally: `npm run dev`
- Validate: `npm run lint` and `npm run build`
- No test runner is set up in this repo currently.

## Repo docs

- Long-lived specs/design notes live under `memory/` (e.g., `memory/designs/`, `memory/tasks/`).
