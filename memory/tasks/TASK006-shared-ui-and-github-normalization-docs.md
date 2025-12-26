# TASK006 - Shared UI + GitHub Normalization Documentation Sync

**Status:** Completed  
**Added:** 2025-12-26  
**Updated:** 2025-12-26  

## Original Request

- Review recent changes on the `refactor` branch.
- Compare current implementation against `/memory` documentation.
- Update/create Memory Bank docs so they match the current code after refactors.

## Changes

### Documentation Updates

- Updated architecture/system docs to reflect the current module layout:
  - Server actions split into `app/actions/auth.ts`, `app/actions/projects.ts`, and `app/actions/github.ts`.
  - Shared action return union `ActionResult<T> = { data: T } | { error: string }`.
  - Home page read caching via `getCachedProjects()` (Next `unstable_cache`) and a Supabase static client.
  - Admin project ordering via `updateProjectOrder()` backed by the `update_project_order` SQL function.

### Implementation Notes Captured

- Shared UI extraction:
  - `components/projects/ProjectImage.tsx`
  - `components/projects/ProjectTags.tsx`
  - `utils/hooks/useEscapeKey.ts`
  - `utils/hooks/useIsMountedRef.ts`
- Shared formatting helpers:
  - `utils/format.ts`
- GitHub URL parsing/normalization:
  - `utils/github-url.ts`
  - `utils/github.ts` normalizes before cached fetch to improve cache hits.

## Validation

- `npm run test` (passed)
- `npm run test:coverage` (passed)
- `npm run lint` (passed)
- `npm run typecheck` (passed)
