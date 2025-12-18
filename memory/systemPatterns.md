# System Patterns

## Architecture Pattern

- Next.js App Router with server components for data fetching.
- Client components for interactive UI (gallery modal, admin dashboard UI).
- Supabase integration via SSR helpers:
  - Server: `utils/supabase/server.ts`
  - Browser: `utils/supabase/client.ts`
  - Middleware session refresh + auth gating: `utils/supabase/middleware.ts`

## Route Protection

- `middleware.ts` applies `updateSession()` to most routes.
- Requests to `/admin` require an authenticated Supabase user; otherwise redirect to `/login`.

## Data Fetching

- Home page (`app/page.tsx`) fetches `projects` server-side and renders `ProjectGallery`.
- Admin page (`app/admin/page.tsx`) fetches projects server-side and renders `AdminDashboard`.

## Mutations

- Next.js Server Actions in `app/actions.ts`:
  - `login(formData)`
  - `createProject(formData)`
  - `updateProject(formData)`
  - `deleteProjects(ids)`
- Mutations call Supabase Postgres and Storage, then invalidate caches via `revalidatePath()`.

## Storage

- Images uploaded to Supabase Storage bucket `projects`.
- Public URL is generated via `supabase.storage.from('projects').getPublicUrl(path)` and stored in `projects.image_url`.

## Types

- `types/index.ts` defines the `Project` TypeScript type matching DB columns.
