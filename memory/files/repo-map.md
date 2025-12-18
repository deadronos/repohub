# Repo Map (As-Built)

## App Routes (Next.js App Router)

- `app/layout.tsx` — root layout, fonts, global styles, analytics, lazy background.
- `app/globals.css` — Tailwind v4 import + theme variables + shared utility classes.
- `app/page.tsx` — home page: server fetch `projects` and render `ProjectGallery`.
- `app/login/page.tsx` — login form (submits to `login` server action).
- `app/admin/page.tsx` — admin page: server fetch `projects` and render `AdminDashboard`.
- `app/loading.tsx` — themed global loading UI.
- `app/not-found.tsx` — themed 404 UI.
- `app/error.tsx` — themed error boundary UI (client component).

## Server Actions

- `app/actions.ts` — `login` + project CRUD + storage uploads; revalidates `/` and `/admin`.

## Components

- `components/ProjectGallery.tsx` — public grid + modal expansion orchestration (state, `AnimatePresence`, `LayoutGroup`).
- `components/ProjectCard.tsx` — a single project card (`layoutId`, image/tags, click/keyboard a11y).
- `components/ProjectModal.tsx` — expanded modal view + backdrop + close behaviors.
- `components/AdminDashboard.tsx` — admin list + modal form (create/edit) + bulk delete + `router.refresh()` sync.
- `components/ParticleBackgroundLazy.tsx` — idle-mounted, client-only wrapper that dynamically imports the 3D background (`ssr: false`).
- `components/ParticleBackground.tsx` — Three.js / React Three Fiber particle canvas.

## Auth / Middleware

- `proxy.ts` — Next middleware entrypoint; delegates to `utils/supabase/middleware.ts`.
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
- `vitest.config.mts`, `tests/setup.ts` — Vitest + Testing Library config.

## Tests

- `tests/components/ProjectGallery.spec.tsx` — gallery interactions and accessibility (open/close modal, sizes attrs, escape/backdrop).
- `tests/components/GlobalUI.spec.tsx` — `loading`, `not-found`, `error` smoke tests.
- `tests/unit/string.spec.ts` — string utility tests (`utils/string`).
- `tests/unit/validation.spec.ts` — input validation tests (`utils/validation`).
- `tests/sanity.spec.ts` — basic repo sanity check.
