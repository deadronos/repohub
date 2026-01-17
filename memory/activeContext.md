# Active Context

**Updated:** 2025-12-28

## Current Focus

Backfilling the Memory Bank to reflect what is currently implemented in the repo (Next.js + Supabase portfolio with admin CRUD).

## Current Reality (What exists today)

- Public gallery at `/` fetching `projects` from Supabase.
- Protected admin route `/admin` enforced by middleware (redirects to `/login`).
- Server Actions implement login + project CRUD + storage uploads.
- Optional bundle analysis via `ANALYZE=true` (Next config uses `@next/bundle-analyzer`).

## Recent Changes

- Split server actions into auth and project modules, with shared project helpers for form parsing, validation, uploads, and revalidation.
- Centralized project list fetching in a `listProjects()` helper and updated pages to use it.
- Extracted the admin project form and particle system into focused components; updated unit tests for new helpers.
- Added `getActionError` to safely read server action errors in client code; lint and typecheck now pass.
- Standardized server action return shape via `ActionResult<T>` and centralized project identifiers in `utils/projects/constants.ts`.
- Extracted shared UI helpers to reduce duplication: `ProjectTags`, `ProjectImage`, `useEscapeKey`, and `useIsMountedRef`.
- Added shared formatting helpers (`utils/format.ts`) and migrated GitHub stats UI to use them.
- Added GitHub repo URL parsing/normalization (`utils/github-url.ts`) and normalized URLs before caching/fetching stats.
- Added a Supabase “static” client (`utils/supabase/static.ts`) for cached home-page reads.
- Extracted particle generation/frame logic into `utils/particles.ts` with unit tests.
- Added client-side image optimization for the 500 KB Supabase Storage bucket limit and surfaced actionable upload errors end-to-end (DES005/TASK007).

## Next Steps

- Create/maintain `DES001` with architecture + data flows.
- Create/maintain `TASK001` with documentation backfill work tracked.
- Maintain `memory/files/repo-map.md` (verified as existing).
- Maintain `AGENTS.md` strict typing and validation scripts (verified as existing).

## Known Gaps / Risks

- No explicit admin role check: any authenticated user can mutate if RLS allows it.
