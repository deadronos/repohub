# DES001 — Current Architecture (As-Built)

**Status:** Current / As-built  
**Updated:** 2025-12-18

## Overview

RepoHub is a single Next.js (App Router) application that:

- Reads `projects` from Supabase Postgres for public display.
- Uses Supabase Auth for admin login.
- Uses Supabase Storage for project images.
- Renders global UI shell, analytics, and backgrounds from `app/layout.tsx`.

## Rendering Model (Server vs Client)

Server components / server files:

- `app/layout.tsx` (global shell)
- `app/page.tsx` (public gallery server fetch)
- `app/admin/page.tsx` (admin server fetch)
- `app/actions/auth.ts` (Next.js Server Actions: auth)
- `app/actions/projects.ts` (Next.js Server Actions: projects CRUD + ordering)
- `app/actions/github.ts` (Next.js Server Actions: GitHub stats)
- `proxy.ts` (middleware delegate; see note in Auth & Session)

Client components:

- `components/ProjectGallery.tsx` (interactive gallery + modal)
  - `components/ProjectCard.tsx`
  - `components/ProjectModal.tsx`
- `components/AdminDashboard.tsx` (admin CRUD UI)
- `components/ParticleBackgroundLazy.tsx` (idle-mount wrapper)
- `components/ParticleBackground.tsx` (R3F/three canvas)

Route-level UI:

- `app/loading.tsx`
- `app/not-found.tsx`
- `app/error.tsx`

## High-Level Diagram

```mermaid
flowchart LR
  U[Visitor/Admin Browser] -->|HTTP| N[Next.js App Router]

  subgraph Next[Next.js]
    Proxy[proxy.ts
Middleware] --> SM[utils/supabase/middleware.ts
updateSession()]
    Layout[app/layout.tsx] --> PBL[components/ParticleBackgroundLazy.tsx
client]:::client
    PBL -->|dynamic import ssr:false| PB[components/ParticleBackground.tsx
client (three.js)]:::client
    Home[app/page.tsx] --> PQ[utils/projects/queries.ts
  getCachedProjects()]
    PQ --> SC[utils/supabase/static.ts
  createStaticClient()]

    Admin[app/admin/page.tsx] --> SS[utils/supabase/server.ts
  createClient()]

    AuthActions[app/actions/auth.ts]
    ProjectActions[app/actions/projects.ts]
    GithubActions[app/actions/github.ts]

    AuthActions --> SS
    ProjectActions --> SS
    GithubActions --> GH[utils/github.ts
  getGitHubStats()]
    Gallery[components/ProjectGallery.tsx
client]:::client
    Card[components/ProjectCard.tsx
client]:::client
    Modal[components/ProjectModal.tsx
client]:::client
    Dash[components/AdminDashboard.tsx
client]:::client
  end

  Gallery --> Card
  Gallery --> Modal

  SS -->|SQL| DB[(Supabase Postgres
projects)]
  SC -->|SQL| DB
  ProjectActions -->|Upload| ST[(Supabase Storage
bucket: projects)]

  classDef client fill:#111,stroke:#0ff,stroke-width:1px;
```

## Routes

- `/` (public): cached server read of `projects`, rendered as `ProjectGallery`.
- `/admin` (protected): server fetch of `projects`, rendered as `AdminDashboard`.
- `/login` (public): email/password form posting to `login` server action.
- `/_not-found` (static): rendered by `app/not-found.tsx`.

## Data Model

### `projects` table

Source of truth: `supabase/schema.sql`.

Fields used by UI and admin:

- `id` (uuid)
- `created_at` (timestamptz)
- `title` (text)
- `short_description` (text)
- `description` (text)
- `image_url` (text)
- `repo_url` (text)
- `demo_url` (text)
- `tags` (text[])
- `is_featured` (boolean)

## Key Interfaces

### Environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### Server Actions (Mutation API)

- `login(formData: FormData): Promise<void>` (redirects on success/failure)
- `createProject(formData: FormData): Promise<ActionResult<true>>`
- `updateProject(formData: FormData): Promise<ActionResult<true>>`
- `deleteProjects(ids: string[]): Promise<ActionResult<true>>`
- `updateProjectOrder(orderedIds: string[]): Promise<ActionResult<true>>`
- `fetchGitHubStatsAction(url: string): Promise<ActionResult<GitHubStats>>`

### Optional Environment Variables

- `GITHUB_TOKEN` (increases rate limits for GitHub API requests)

## Auth & Session

- Middleware entrypoint is `proxy.ts`, which delegates to `utils/supabase/middleware.ts`.
- Middleware calls `supabase.auth.getUser()` via SSR client.
- If path starts with `/admin` and no user exists → redirect to `/login`.

Note: Next.js middleware typically uses a `middleware.ts` entrypoint. If the intent is to rely on Next middleware, ensure an actual middleware entrypoint exists.

## UI Composition Notes

- `app/layout.tsx` renders `ParticleBackgroundLazy`, which dynamically imports `ParticleBackground` on the client.
- `ParticleBackground` uses React Three Fiber (`@react-three/fiber`) and drei (`@react-three/drei`) and is intentionally isolated from SSR.
- `ProjectGallery` uses Framer Motion shared layout transitions (`layoutId`) and is split into `ProjectCard` and `ProjectModal` for maintainability.
- Project image and tag rendering are shared via `components/projects/ProjectImage.tsx` and `components/projects/ProjectTags.tsx`.
- Client lifecycle behavior is standardized via `utils/hooks/useEscapeKey.ts` and `utils/hooks/useIsMountedRef.ts`.

## Storage Upload Flow

1. Admin submits form with `image`.
2. Server action uploads to Storage bucket `projects`.
3. Server action gets a public URL and stores it in `projects.image_url`.
4. Pages are revalidated (`/` and `/admin`).

## Error Handling (As Built)

| Area                 | Failure                          | Current behavior
| -------------------- | -------------------------------- | ------------------------------------------------------------
| Login                | invalid credentials              | redirects to `/login?message=Could not authenticate user`
| Create/Update        | storage upload fails             | logs to `console.error`, continues (may store blank/old URL)
| Create/Update/Delete | DB mutation fails                | logs to `console.error`, returns `{ error: 'Failed' }`
| Auth                 | unauthenticated access to admin  | middleware redirect to `/login`
| Global routes        | render-time error / not found    | `app/error.tsx` / `app/not-found.tsx` render themed UI

## Security Notes

- App relies on Supabase RLS policies.
- There is no role check in the app: “authenticated” is treated as “admin”.
- `supabase/schema.sql` currently does not define a `DELETE` policy for `projects`; the admin UI calls delete and will require that policy to exist.

## Performance Notes (As Built)

- `ParticleBackground` is dynamically imported with `ssr: false` and mounted during browser idle time, reducing initial JS and avoiding SSR work for three.js.
- `ParticleBackground` listens for `webglcontextlost` / `webglcontextrestored` and pauses the R3F frameloop when the context is lost.
- `ProjectGallery` keeps `layoutId={project.id}` across card and modal, and wraps content in a `LayoutGroup` to preserve smooth shared-layout transitions after refactoring.
- Home page projects are cached using `unstable_cache` with a Supabase static client (`utils/supabase/static.ts`) and tagged as `projects`.
- GitHub stats fetching normalizes repo URLs to improve cache hits (`utils/github-url.ts`).

## Deferred Improvements

- Add explicit delete policy (and tighten insert/update/delete policies).
- Add schema validation (zod) for FormData.
- Replace `window.location.reload()` in admin with state updates or data refresh.
- Consider splitting modal content further (and/or prefetching on hover) if future bundle budgets require it.
