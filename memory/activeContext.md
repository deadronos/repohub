# Active Context

**Updated:** 2025-12-18

## Current Focus

Backfilling the Memory Bank to reflect what is currently implemented in the repo (Next.js + Supabase portfolio with admin CRUD).

## Current Reality (What exists today)

- Public gallery at `/` fetching `projects` from Supabase.
- Protected admin route `/admin` enforced by middleware (redirects to `/login`).
- Server Actions implement login + project CRUD + storage uploads.

## Next Steps

- Create/maintain `DES001` with architecture + data flows.
- Create/maintain `TASK001` with documentation backfill work tracked.
- Add a `memory/files/` repo map to speed future onboarding.

## Known Gaps / Risks

- RLS policy set in `supabase/schema.sql` does not include a delete policy; `deleteProjects()` will require a matching `DELETE` policy in Supabase.
- No explicit admin role check: any authenticated user can mutate if RLS allows it.
