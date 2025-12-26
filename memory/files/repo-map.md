# Repo Map (As-Built)

## App Routes (Next.js App Router)

- `app/layout.tsx` — root layout, fonts, global styles, analytics, lazy background.
- `app/globals.css` — Tailwind v4 import + theme variables + shared utility classes.
- `app/page.tsx` — home page: cached read of `projects` via `getCachedProjects()` and render `ProjectGallery`.
- `app/login/page.tsx` — login form (submits to `login` server action).
- `app/admin/page.tsx` — admin page: server fetch `projects` and render `AdminDashboard`.
- `app/loading.tsx` — themed global loading UI.
- `app/not-found.tsx` — themed 404 UI.
- `app/error.tsx` — themed error boundary UI (client component).

## Server Actions

- `app/actions/auth.ts` — `login(formData)`.
- `app/actions/projects.ts` — `createProject`, `updateProject`, `deleteProjects`, `updateProjectOrder`.
- `app/actions/github.ts` — `fetchGitHubStatsAction(url)`.
- `utils/actions.ts` — shared `ActionResult<T>` union and helpers (`getActionError`, `formatError`).

## Components

- `components/ProjectGallery.tsx` — public grid + modal expansion orchestration (state, `AnimatePresence`, `LayoutGroup`).
- `components/ProjectCard.tsx` — a single project card (`layoutId`, image/tags, click/keyboard a11y).
- `components/ProjectModal.tsx` — expanded modal view + backdrop + close behaviors.
- `components/AdminDashboard.tsx` — admin list + modal form (create/edit) + bulk delete + `router.refresh()` sync.
- `components/AdminProjectForm.tsx` — admin create/edit form UI (server action submission + error display).
- `components/GitHubStats.tsx` — repo stats UI (uses shared formatting helpers).
- `components/ParticleBackgroundLazy.tsx` — idle-mounted, client-only wrapper that dynamically imports the 3D background (`ssr: false`).
- `components/ParticleBackground.tsx` — Three.js / React Three Fiber particle canvas.
- `components/particles/Particles.tsx` — Three.js particle points (delegates math to `utils/particles.ts`).

Shared project UI primitives:

- `components/projects/ProjectImage.tsx` — shared Next Image wrapper with fallback.
- `components/projects/ProjectTags.tsx` — shared tag rendering for card/modal/admin variants.

## Auth / Middleware

- `proxy.ts` — Next middleware entrypoint; delegates to `utils/supabase/middleware.ts`.
- `utils/supabase/middleware.ts` — refresh session cookies and enforce `/admin` auth.

## Supabase Client Utilities

- `utils/supabase/server.ts` — SSR Supabase client using Next cookies.
- `utils/supabase/client.ts` — browser Supabase client.
- `utils/supabase/static.ts` — “static” client for cached server reads.

## Shared Utilities

- `utils/projects/constants.ts` — `projects` table/bucket/cache-tag constants.
- `utils/projects/queries.ts` — `listProjects()` and `getCachedProjects()`.
- `utils/projects/form.ts` — `parseProjectFormData()` + validation helpers.
- `utils/projects/order.ts` — ordering validation/build helpers.
- `utils/projects/tags.ts` — tag normalization/formatting helpers.
- `utils/github-url.ts` — GitHub repo URL parsing + canonicalization.
- `utils/github.ts` — GitHub API fetch + caching (normalizes repo URLs before cached fetch).
- `utils/format.ts` — shared number/date formatting.
- `utils/hooks/useEscapeKey.ts` — shared Escape-key behavior.
- `utils/hooks/useIsMountedRef.ts` — shared mount guard for async effects.
- `utils/particles.ts` — particle generation + per-frame updates.

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
- `tests/components/ProjectCard.spec.tsx` — card interactions and accessibility.
- `tests/components/ProjectModal.spec.tsx` — modal behavior and close interactions.
- `tests/components/AdminDashboard.spec.tsx` — admin list/CRUD UI behavior.
- `tests/components/AdminProjectForm.spec.tsx` — form submission and error handling.
- `tests/components/GitHubStats.spec.tsx` — stats UI behavior.
- `tests/components/ParticleBackgroundLazy.spec.tsx` — background lazy-load behavior (idle + fallback + cleanup).
- `tests/components/ParticleBackground.spec.tsx` — WebGL context loss/restored handling (pauses/resumes R3F frameloop).
- `tests/components/Particles.spec.tsx` — particle component behavior.
- `tests/components/GlobalUI.spec.tsx` — `loading`, `not-found`, `error` smoke tests.
- `tests/unit/actions.spec.ts` — action/result helper tests.
- `tests/unit/form.spec.ts` — form utility tests.
- `tests/unit/format.spec.ts` — formatting utility tests.
- `tests/unit/github.spec.ts` — GitHub parsing/normalization + stats fetch behavior.
- `tests/unit/particles.spec.ts` — particle math/util tests.
- `tests/unit/project-form.spec.ts` — project form parsing/validation tests.
- `tests/unit/project-order.spec.ts` — ordering helper tests.
- `tests/unit/string.spec.ts` — string utility tests (`utils/string`).
- `tests/unit/validation.spec.ts` — input validation tests (`utils/validation`).
- `tests/sanity.spec.ts` — basic repo sanity check.
