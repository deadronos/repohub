# TASK007 - Client Image Compression for 500 KB Supabase Storage Limit

**Status:** Completed  
**Added:** 2025-12-28  
**Updated:** 2025-12-28  

## Original Request

- Supabase Storage bucket enforces a hard 500 KB limit on uploaded images.
- Keep the bucket enforcement, but improve UX:
  - Gracefully error when a screenshot is too big.
  - Prefer client-side auto-optimization (WebP + iterative quality/dimension reduction) so uploads fit under 500 KB.
- Upload modal must enforce `< 500 KB` with clear, actionable messages.

## Thought Process

The current admin upload flow posts a raw `File` from `components/AdminProjectForm.tsx` to server actions. Storage upload errors are currently swallowed (returned as `null`), which can lead to silent failures and confusing outcomes.

To preserve the bucket as source-of-truth and still give a smooth experience, the form should:

1. Preflight file size in the browser.
2. If oversized, attempt deterministic, dependency-free client optimization using browser primitives (`createImageBitmap`, canvas encoding).
3. Block submit until a compliant file is ready (or the user removes/replaces the image).
4. Maintain server-side backstops so bucket rejections still surface as friendly errors and do not silently proceed.

Design reference: `memory/designs/DES005-client-image-compression-500kb.md`.

## Implementation Plan

- Add shared constants for max and target image bytes.
- Add a `formatBytes()` helper for consistent UI copy.
- Implement `optimizeImageToUnderBytes()` (client-only) with:
  - WebP encoding preference
  - Binary search on quality
  - Bounded dimension reduction loop
  - Fallback to JPEG if WebP unsupported
- Update `components/AdminProjectForm.tsx`:
  - Track selected/original/prepared image state
  - Show “Optimizing…” and “Optimized to …” messages
  - Keep submit disabled when image invalid or optimization failed
  - Replace `image` entry in `FormData` with optimized file on submit
- Update storage upload pipeline:
  - Return actionable errors from `uploadProjectImage()`
  - Update `createProject()` / `updateProject()` to stop and return an error if an image was provided but upload failed
- Add unit tests for new helper logic (binary search + formatting).
- Run `npm run test`, `npm run lint`, `npm run typecheck` and record results.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID  | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Add constants + formatBytes helper | Complete | 2025-12-28 | `utils/projects/image-limits.ts`, `utils/format-bytes.ts` |
| 1.2 | Implement client optimization utility | Complete | 2025-12-28 | `utils/images/optimize-image.ts`, `utils/images/quality-search.ts` |
| 1.3 | Wire optimization into AdminProjectForm UX | Complete | 2025-12-28 | `components/AdminProjectForm.tsx` |
| 1.4 | Add server-side upload error propagation | Complete | 2025-12-28 | `utils/projects/storage.ts`, `app/actions/projects.ts` |
| 1.5 | Add unit tests | Complete | 2025-12-28 | `tests/unit/format-bytes.spec.ts`, `tests/unit/quality-search.spec.ts` |
| 1.6 | Run checks and update Memory Bank | Complete | 2025-12-28 | `npm run test`, `npm run lint`, `npm run typecheck` |

## Progress Log

### 2025-12-28

- Created design spec: `memory/designs/DES005-client-image-compression-500kb.md`.
- Created task plan and started implementation.

### 2025-12-28 (Completed)

- Implemented client-side image optimization with clear UX states (optimizing/ready/error) and submit gating in `components/AdminProjectForm.tsx`.
- Added server-side backstop errors for oversized/rejected uploads and ensured create/update does not silently ignore upload failures.
- Added unit tests for `formatBytes()` and the quality-search helper.
- Validation:
  - `npm run test` (passed)
  - `npm run lint` (passed)
  - `npm run typecheck` (passed)
