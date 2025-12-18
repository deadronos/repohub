# Active Context

**Updated:** 2025-12-18

## Current Focus

Backfilling the Memory Bank to reflect what is currently implemented in the repo (Next.js + Supabase portfolio with admin CRUD).

## Current Reality (What exists today)

- Public gallery at `/` fetching `projects` from Supabase.
- Protected admin route `/admin` enforced by middleware (redirects to `/login`).
- Server Actions implement login + project CRUD + storage uploads.
- Optional bundle analysis via `ANALYZE=true` (Next config uses `@next/bundle-analyzer`).

## Recent Changes

- Added `@next/bundle-analyzer` and wrapped `next.config.ts` export; validated with `npm run lint` and `npm run typecheck`.

## Next Steps

- Create/maintain `DES001` with architecture + data flows.
- Create/maintain `TASK001` with documentation backfill work tracked.
- Add a `memory/files/` repo map to speed future onboarding.
- Update AGENTS.md to prefer strict typing and require `npm run test`, `npm run lint`, and `npm run typecheck` before handing off. Add a sanity test + `npm run check` script to run these validations.

## Known Gaps / Risks

- RLS policy set in `supabase/schema.sql` does not include a delete policy; `deleteProjects()` will require a matching `DELETE` policy in Supabase.
- No explicit admin role check: any authenticated user can mutate if RLS allows it.
