# Progress

**Updated:** 2025-12-18

## What Works

- Home page renders a grid of projects with modal expansion.
- 3D particle background loads lazily on the client (idle) to reduce initial load cost.
- `ProjectGallery` is split into `ProjectCard` and `ProjectModal` for maintainability.
- Supabase SSR client wiring (server, browser, middleware) is in place.
- `/admin` is protected by middleware redirect.
- Admin dashboard supports create/update/delete flows.
- Image uploads store to Supabase Storage and render via Next Image.
- Project actions share helpers for form parsing/validation, storage uploads, and revalidation.

## What’s Missing / Incomplete

- Authorization beyond “authenticated”: no admin role enforcement.
- Database policies in Supabase must match app expectations (not fully guaranteed by repo SQL).
- Error UX: server actions mostly `console.error` and return generic errors.

## Known Issues

- `supabase/schema.sql` lacks `DELETE` policy for `projects`, but the app calls delete.

## Suggested Next Improvements (Not Implemented)

- Add explicit `DELETE` policy (and possibly tighter policies scoped to owner/admin).
- Add form validation (zod) and display errors in UI.
- Avoid `window.location.reload()` in admin; update local state or re-fetch.
