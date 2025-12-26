# System Patterns

## Architecture Pattern

- Next.js App Router with server components for data fetching.
- Client components for interactive UI (gallery modal, admin dashboard UI).
- Supabase integration via SSR helpers:
  - Server: `utils/supabase/server.ts`
  - Browser: `utils/supabase/client.ts`
  - Middleware session refresh + auth gating: `utils/supabase/middleware.ts`

## Route Protection

- `proxy.ts` delegates to `utils/supabase/middleware.ts` (`updateSession()`).
- Requests to `/admin` require an authenticated Supabase user; otherwise redirect to `/login`.

Note: Next.js middleware typically uses a `middleware.ts` entrypoint. If the intent is to rely on Next middleware, ensure an actual middleware entrypoint exists.

## Data Fetching

- Home page (`app/page.tsx`) reads `projects` via `getCachedProjects()` and renders `ProjectGallery`.
- Admin page (`app/admin/page.tsx`) reads projects via `listProjects()` and renders `AdminDashboard`.

## Mutations

- Next.js Server Actions are split by domain:
  - `app/actions/auth.ts`: `login(formData)`
  - `app/actions/projects.ts`: `createProject`, `updateProject`, `deleteProjects`, `updateProjectOrder`
  - `app/actions/github.ts`: `fetchGitHubStatsAction(url)`
- Mutating actions return a shared union shape `ActionResult<T> = { data: T } | { error: string }`.
- Mutations call Supabase Postgres and Storage, then invalidate caches via `revalidatePath('/')` and `revalidatePath('/admin')`.

## Caching

- Home page uses `getCachedProjects()` (Next `unstable_cache`) for reads with a Supabase “static” client.
- Cache tagging uses the `projects` tag (see `utils/projects/constants.ts`).

## Project Ordering

- Admin drag-reorder calls `updateProjectOrder(orderedIds)`.
- The server action invokes the Supabase SQL function `update_project_order(ordered_ids uuid[])`.

## Storage

- Images uploaded to Supabase Storage bucket `projects`.
- Public URL is generated via `supabase.storage.from('projects').getPublicUrl(path)` and stored in `projects.image_url`.

## Types

- `types/index.ts` defines the `Project` TypeScript type matching DB columns.
