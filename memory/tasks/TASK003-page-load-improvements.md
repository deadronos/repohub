# TASK003 - Page Load Improvements (Lazy Background + Gallery Refactor)

**Status:** Completed  
**Added:** 2025-12-18  
**Updated:** 2025-12-18  

## Original Request

- Lazy load the heavy 3D `ParticleBackground` so it does not block the critical rendering path.
- Refactor `ProjectGallery` into smaller components (`ProjectCard`, `ProjectModal`) without behavior changes, preserving Framer Motion `layoutId` animations.

## Changes

### Lazy Loading Background

- Added `components/ParticleBackgroundLazy.tsx` as a small client wrapper that:
  - dynamically imports `components/ParticleBackground.tsx` with `ssr: false`
  - delays mounting until the browser is idle (`requestIdleCallback` with a timeout, plus `setTimeout` fallback)
- Updated `app/layout.tsx` to render `ParticleBackgroundLazy` instead of statically importing `ParticleBackground`.

### ProjectGallery Split

- Added `components/ProjectCard.tsx` (card rendering + a11y keyboard handling).
- Added `components/ProjectModal.tsx` (backdrop + expanded view).
- Updated `components/ProjectGallery.tsx` to compose the new components and keep the same state/behavior.
- Wrapped the gallery in a `LayoutGroup` to keep shared `layoutId` transitions smooth across component boundaries.

## Validation

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
- Added test coverage for:
  - `ParticleBackgroundLazy` idle + fallback + cleanup timers
  - `ParticleBackground` WebGL context loss/restored (pauses/resumes frameloop)
