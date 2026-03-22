# Progress

**Updated:** 2026-03-22

## What Works

- Admin dashboard selection now supports bulk `Feature Selected` and `Unfeature Selected` actions backed by the existing `projects.is_featured` field.
- Admin project cards now surface a featured badge so editors can quickly see which projects are highlighted on the public homepage.
- The admin featured-toggle work passed `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build`; local runtime verification confirmed `/admin` still redirects unauthenticated users to `/login`.
- The homepage now has a more intentional visual direction: split-layout hero, richer CTA hierarchy, live stats, and a subtle parallax atmosphere.
- The refreshed homepage passed `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build`, and was visually checked in a local browser at `http://localhost:3000`.
- The app is now pinned to stable Next.js `16.1.1` and `eslint-config-next` `16.1.1` instead of the `16.2.0-canary.7` line.
- Local validation passes on this branch: `npm run test`, `npm run lint` (with one existing warning in `components/WebGPUCanvas.tsx`), and `npm run typecheck`.
- `npm run build` succeeds under Next.js `16.1.1` when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` are set; missing env vars still fail prerendering for `/`.
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
- Login failures now surface visible feedback on `/login` via an inline alert instead of appearing as a silent refresh.
- README setup instructions now point to `supabase/schema.sql` as the canonical Supabase setup file and explicitly mention the ordering RPC required by the admin dashboard.

## What’s Missing / Incomplete

- Authorization beyond “authenticated”: no admin role enforcement.
- Database policies in Supabase must match app expectations (not fully guaranteed by repo SQL).
- Error UX: mostly generic, but image upload failures now return actionable errors instead of silently failing.

## Known Issues

- No explicit admin role check: any authenticated user can mutate if RLS allows it.

## Suggested Next Improvements (Not Implemented)

- Add explicit `DELETE` policy (and possibly tighter policies scoped to owner/admin).
- Ensure route protection uses a Next middleware entrypoint (`middleware.ts`) if the intent is to rely on Next middleware (the repo currently has `proxy.ts`).
- Add schema validation (zod) for FormData and display structured errors in UI.
