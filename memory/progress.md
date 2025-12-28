# Progress

**Updated:** 2025-12-28

## What Works

- Home page renders a grid of projects with modal expansion.
- 3D particle background loads lazily on the client (idle) to reduce initial load cost.
- `ProjectGallery` is split into `ProjectCard` and `ProjectModal` for maintainability.
- Supabase SSR client wiring (server, browser, middleware) is in place.
- Route protection logic exists for `/admin` (redirect to `/login` when unauthenticated).
- Admin dashboard supports create/update/delete flows.
- Image uploads store to Supabase Storage and render via Next Image (with client-side optimization to meet the 500 KB bucket limit).
- Project actions share helpers for form parsing/validation, storage uploads, and revalidation.
- Projects are ordered by `sort_order` and can be re-ordered in admin (persisted via a Supabase SQL function).
- Home page project reads are cached with Next `unstable_cache` using a Supabase “static” client.
- GitHub stats are fetched server-side via a server action and displayed on project cards/modals.
- Shared UI primitives reduce duplication (`ProjectImage`, `ProjectTags`) and shared hooks reduce subtle client bugs (`useEscapeKey`, `useIsMountedRef`).
- Formatting is centralized (`utils/format.ts`) and reused in GitHub stats UI.
- Unit tests cover key UI and utility paths; `npm run test` and `npm run test:coverage` are green on this branch.

## What’s Missing / Incomplete

- Authorization beyond “authenticated”: no admin role enforcement.
- Database policies in Supabase must match app expectations (not fully guaranteed by repo SQL).
- Error UX: mostly generic, but image upload failures now return actionable errors instead of silently failing.

## Known Issues

- `supabase/schema.sql` lacks a `DELETE` policy for `projects`, but the app calls delete.
- No explicit admin role check: any authenticated user can mutate if RLS allows it.

## Suggested Next Improvements (Not Implemented)

- Add explicit `DELETE` policy (and possibly tighter policies scoped to owner/admin).
- Ensure route protection uses a Next middleware entrypoint (`middleware.ts`) if the intent is to rely on Next middleware (the repo currently has `proxy.ts`).
- Add schema validation (zod) for FormData and display structured errors in UI.
