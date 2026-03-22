# Repo conventions that matter

These are the patterns most likely to cause subtle bugs when violated.

## Stack snapshot

- Next.js 16 App Router
- React 19 + TypeScript 5
- Supabase SSR + Auth + Storage
- Tailwind CSS v4
- Framer Motion
- Vitest + Testing Library
- `@dnd-kit/*` for admin drag-and-drop ordering
- `react-window` + `react-virtualized-auto-sizer` for the public project grid

## Public page and data-fetching patterns

- `app/page.tsx` is the public entry point.
- The public project list is fetched through `getCachedProjects()` from `utils/projects/queries.ts`.
  - That path uses `unstable_cache` plus `createStaticClient()`.
  - Keep cache invalidation aligned with `revalidateProjects()` after writes.
- `components/ProjectGallery.tsx` is a client component.
  - It renders `VirtualizedProjectGrid` for the archive.
  - Project details open in `ProjectModal`.
  - GitHub stats are intentionally shown on demand in the modal, not in every grid card.

## Admin and auth patterns

- `app/admin/page.tsx` verifies access with `ensureAdmin()` and then fetches projects.
- Route protection flows through `middleware.ts` → `utils/supabase/middleware.ts`.
  - Do not insert logic between `createServerClient()` and `supabase.auth.getUser()`.
- App-side admin checks use `ADMIN_EMAILS` via `utils/supabase/admin.ts`.
- Database-side admin checks use the inline allowlist in `supabase/schema.sql` via `public.is_admin_email()`.
  - Keep `ADMIN_EMAILS` and the email literals in `supabase/schema.sql` synchronized.

## Mutation patterns

- Server Actions live under `app/actions/*`.
- Project mutations live in `app/actions/projects.ts`.
- After project writes, use the existing `revalidateProjects()` helper rather than inventing new invalidation rules.
- Image uploads go to the public `projects` Storage bucket.
  - Persist the returned public URL into `projects.image_url`.
  - When replacing or deleting projects, keep storage cleanup behavior intact.

## UI and rendering patterns

- Tailwind CSS v4 utilities live in `app/globals.css`.
- Motion-heavy UI uses `framer-motion` layout transitions.
- The public gallery is optimized to keep cards lightweight.
  - Avoid adding per-card network work back into the grid unless there is a strong reason.
- The project background supports WebGPU with a deterministic WebGL fallback.

## Build and security conventions

- `next.config.ts` is the source of truth for response headers and image remote patterns.
- Avoid build-time network dependencies such as `next/font/google` in production builds.
- `types/index.ts` is the canonical app-side project type and should stay aligned with `projects` in `supabase/schema.sql`.
