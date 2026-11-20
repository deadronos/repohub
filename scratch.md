# Next Issue Batches

Planned execution batches for the review findings on `deadronos/repohub`, grouped by shared files and impact so each batch can be tackled in one focused pass.

## Umbrellas

- **#164** — Gallery UX & Filtering Fixes (closed)
- **#165** — Visuals & Game-First Portfolio Polish (closed)
- **#166** — Code Quality, Accessibility & Repo Hygiene (closed)

---

## Batch 1 — Gallery Filtering, Search & Scrollbar Fixes (Merged: #168)

High-impact UX bugs touching the gallery/filter pipeline (`FilterBar`, `useFilterState`, `useFilterSync`, `ProjectGallery`, `app/page.tsx`, `app/globals.css`).

- [x] **#152** — `fix: Search input lags behind typing due to controlled debounced state`
- [x] **#153** — `fix: Filter URL sync is one-way and calls router.replace on mount`
- [x] **#154** — `fix: Modal Next/Previous navigation ignores active filters`
- [x] **#155** — `fix: Duplicate empty-state messages rendered when no projects exist`
- [x] **#157** — `fix: FilterBar horizontal scrollbar visible because scrollbar-hide is undefined`

**Verify:** `npm run check`

---

## Batch 2 — Game-First Card & Modal Polish (Merged: #167)

Visual upgrade + accessibility fixes touching `ProjectCard.tsx` and `ProjectModal.tsx`.

- [x] **#156** — `style: Show project card thumbnails in color at rest instead of grayscale`
- [x] **#159** — `feat: Add direct quick-play link on ProjectCard hover`
- [x] **#158** — `ui: Reposition ProjectModal prev/next arrows so they do not overlap content`
- [x] **#161** — `a11y: Fix stale focus trap and add body scroll lock in ProjectModal`

**Verify:** `npm run check` + quick visual check in browser

---

## Batch 3 — Repo Hygiene, Validation & Admin Refactor (Merged: #169)

Cleanup and maintainability pass touching root repo files, `utils/projects/schema.ts`, and `components/AdminDashboard.tsx`.

- [x] **#160** — `chore: Remove committed QA screenshots, snapshots, and tsconfig.tsbuildinfo from repo root`
- [x] **#162** — `security: Enforce HTTP(S) URL validation directly inside ProjectCreateSchema`
- [x] **#163** — `refactor: Extract admin state management hook from AdminDashboard`

**Verify:** `npm run check && npm run build`

---

## Backlog

- [ ] **#139** — `feat: Add E2E test suite with Playwright`
