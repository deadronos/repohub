# Active Context

**Updated:** 2026-03-22

## Current Focus

Backfilling the Memory Bank to reflect what is currently implemented in the repo (Next.js + Supabase portfolio with admin CRUD).

## Current Reality (What exists today)

- Public gallery at `/` fetching `projects` from Supabase.
- Protected admin route `/admin` enforced by middleware (redirects to `/login`).
- Server Actions implement login + project CRUD + storage uploads.
- Optional bundle analysis via `ANALYZE=true` (Next config uses `@next/bundle-analyzer`).

## Recent Changes

- Added bulk featured-project controls to the admin dashboard so selected projects can be marked featured or unfeatured without leaving the grid view.
- Added a dedicated `setProjectsFeatured()` server action that updates `projects.is_featured` and revalidates the public home page plus admin dashboard.
- Added a visible featured badge to admin project cards so featured state is obvious during curation.
- Verified the featured-toggle work with `npm run test && npm run lint && npm run typecheck`, `npm run build`, and a local runtime check of the `/admin` auth redirect flow.
- Refreshed the homepage hero into a split-layout intro with live portfolio stats and clearer CTAs.
- Added a CSS-based atmospheric backdrop with subtle parallax motion and a grid glow layer.
- Introduced a gallery intro section on the homepage and updated the hero component test to match the new content.
- Replaced the pinned Next.js canary (`16.2.0-canary.7`) and matching `eslint-config-next` package with the stable `16.1.1` release, and refreshed `package-lock.json`.
- Verified the repo still passes `npm run test`, `npm run lint`, and `npm run typecheck` after the stable pin change.
- Verified `npm run build` succeeds under Next.js `16.1.1` when the required Supabase env vars are present; without them, prerendering `/` fails early because the static Supabase client is created during build.
- Corrected repo docs to reflect the effective Next.js 16 runtime floor of Node.js `20.9+`; CI already uses Node `20.x`.
- Updated setup documentation so `README.md` points to `supabase/schema.sql` as the canonical Supabase schema source and explicitly calls out `sort_order` plus `update_project_order(uuid[])` for admin drag-and-drop ordering.
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
- Refactored duplicate project helpers: CSV tag parsing now delegates to shared tag normalization, project revalidation moved to a helper, auth checks centralized for server actions, and project sort-order logic extracted.
- Login failures on `/login` now render an inline accessible alert sourced from the `message` query param; legacy auth messages are normalized to a friendlier credential-check prompt and covered by a component test.

## Next Steps

- Keep local and CI environments on Node.js `20.9+` or newer when validating Next.js 16 changes.
- Create/maintain `DES001` with architecture + data flows.
- Create/maintain `TASK001` with documentation backfill work tracked.
- Maintain `memory/files/repo-map.md` (verified as existing).
- Maintain `AGENTS.md` strict typing and validation scripts (verified as existing).

## Known Gaps / Risks

- No explicit admin role check: any authenticated user can mutate if RLS allows it.
