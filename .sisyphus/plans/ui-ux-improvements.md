# UI/UX Improvements for RepoHub

## TL;DR

> **Quick Summary**: Implement 3 high-impact UI/UX improvements to RepoHub's public-facing portfolio: (1) tag-based filtering + text search with URL sync, (2) hero/card micro-interactions and entrance animations, (3) modal redesign with prev/next navigation. All built on the existing Framer Motion + Tailwind CSS v4 stack with TDD workflow.
>
> **Deliverables**:
> - Interactive tag filter bar + text search input with URL param sync
> - Fix for empty "Top tag" in HeroHeader stats panel
> - Hero entrance animations (staggered fade-in)
> - Card hover parallax/tilt + enhanced micro-interactions
> - Stats count-up animation on scroll into view
> - Scroll-reveal for below-fold cards
> - Modal prev/next navigation with keyboard arrows
> - Reorganized modal layout with project type badges
> - Smart description (strip redundant title prefix)
> - Fixed close button placement (modal container, not image overlay)
> - Full `prefers-reduced-motion` support across all animations
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 5 → Task 9 → Task 13 → F1-F4

---

## Context

### Original Request
Review the RepoHub project and suggest 3 improvements for visuals/UI/UX/features. User approved all 3 suggestions and requested a work plan on a new branch.

### Interview Summary
**Key Discussions**:
- Priority: Filtering & Search first, then Micro-Interactions, then Modal Redesign
- Test strategy: TDD (red-green-refactor) for all features
- URL params: Sync filter state to URL (?tag=react) for shareable filtered views
- Project types: Infer from tags (no DB schema change)
- Animations: Subtle-to-moderate intensity, consistent with existing cyber-minimalist vibe

**Research Findings**:
- VirtualizedProjectGrid uses react-window `Grid` + `AutoSizer` — AnimatePresence conflicts with virtualization
- HeroHeader is a server component — needs `'use client'` wrapper for animations
- HomepageAtmosphere already tracks cursor via CSS custom properties (`--cursor-x`, `--cursor-y`)
- Several projects have empty tags (SpaceAutoBattler, Voxel Celebration, Planet Life 3D)
- "At a Glance" Top tag renders empty `<dd>` despite receiving data
- Card hover: existing `whileHover={{ scale: 1.02, y: -5 }}` + grayscale removal
- Modal has focus trap implemented
- Existing project type has no `project_type` field — will infer from tags

### Metis Review
**Identified Gaps** (addressed):
- **react-window vs AnimatePresence conflict**: Virtualized grid doesn't support animated enter/exit of individual cells. Solution: Replace react-window with Framer Motion `AnimatePresence` for filter transitions since we have only 19 projects — no performance issue. Keep react-window available as a fallback for 50+ items.
- **HeroHeader server→client conversion**: Need explicit `'use client'` boundary. Solution: Create `HeroHeaderClient.tsx` wrapper that handles animation, keep `HeroHeader.tsx` for static server-rendered content.
- **Project type inference mapping**: Needs explicit tag→type rules defined before implementation. Solution: Define mapping in `utils/projects/projectType.ts`.
- **Modal prev/next boundary behavior**: When on last project, what does "Next" do? Solution: Wrap around (last → first, first → last) for fluid browsing.
- **Empty/zero-result filter state**: What shows when no projects match? Solution: Empty state component with "Try different filters" message.
- **`prefers-reduced-motion`**: All 3 features animate; every animation needs a reduced-motion fallback. Solution: Use `useReducedMotion()` from Framer Motion + `@media (prefers-reduced-motion: reduce)` in CSS.

---

## Work Objectives

### Core Objective
Transform RepoHub from a static grid portfolio into an interactive, searchable gallery with polished micro-interactions and a fluid modal browsing experience — while maintaining the cyber-minimalist aesthetic and keeping the codebase maintainable.

### Concrete Deliverables
- `components/projects/FilterBar.tsx` — Interactive tag filter + search input
- `utils/projects/projectType.ts` — Tag-to-type inference mapping
- `components/projects/ProjectTypeBadge.tsx` — Colored badge for Game/Tool/Experiment
- `components/HeroHeaderClient.tsx` — Client-side animated wrapper for hero
- `components/projects/AnimatedCard.tsx` — Enhanced ProjectCard with parallax tilt
- `components/projects/ScrollReveal.tsx` — Intersection Observer reveal wrapper
- `components/projects/StatsCounter.tsx` — Animated number count-up
- `components/ProjectModal.tsx` — Redesigned with prev/next + reorganized layout
- `components/projects/EmptyFilterState.tsx` — "No matches" empty state
- Updated `app/globals.css` — CSS `@media (prefers-reduced-motion)` fallbacks
- TDD test files for each new component

### Definition of Done
- [ ] Tag filter bar renders all unique tags from projects, filters grid instantly on click
- [ ] Text search filters by title and description, debounced 300ms
- [ ] URL params sync: `/projects?tag=react` shows filtered view on page load
- [ ] Empty "Top tag" in HeroHeader displays the actual tag value
- [ ] Hero header animates on page load with staggered entrance
- [ ] Stats count up from 0 on first scroll into viewport
- [ ] Cards below fold reveal with fade-in + slide-up
- [ ] Card hover produces subtle 3D parallax tilt effect
- [ ] Modal has left/right navigation arrows + keyboard arrow support
- [ ] Modal wraps around (last project → first on "Next")
- [ ] Project type badge shows inferred type (Game/Tool/Experiment/Other)
- [ ] Description strips redundant title prefix when it matches
- [ ] Close button is in top-right of modal container (not overlaid on image)
- [ ] All animations respect `prefers-reduced-motion`
- [ ] `npm run check` passes (lint + typecheck + tests)
- [ ] `npm run build` succeeds

### Must Have
- All 3 improvements fully functional on the public homepage
- URL-param synced filtering with shareable links
- Keyboard navigation in modal (←/→ arrows + Escape)
- `prefers-reduced-motion` respected everywhere
- TDD tests accompany each feature
- No DB schema changes

### Must NOT Have (Guardrails)
- No changes to admin dashboard (`app/admin/`)
- No changes to authentication or middleware
- No DB schema changes (no new columns or tables)
- No changes to the particle background system
- No `next/font/google` (causes build failures per AGENTS.md)
- No `as any` or `@ts-ignore` — use proper types
- No console.log in production code
- No animated transitions that conflict with react-window virtualization — replace with AnimatePresence approach
- No network requests on the filter bar — all filtering is client-side from cached data
- No removal of virtualization entirely — conditionally use AnimatePresence for ≤50 items, react-window for >50

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (vitest + @testing-library/react + jsdom)
- **Automated tests**: YES (TDD)
- **Framework**: vitest
- **TDD**: Each task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **Accessibility**: Use Playwright — Keyboard nav, screen reader assertions
- **Unit**: Use vitest — Component rendering, function logic, edge cases

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — unblock everything):
├── Task 1: Tag extraction + project type inference utility [quick]
├── Task 2: Filter state hook + URL sync hook [quick]
├── Task 3: Empty filter state component [quick]
├── Task 4: Project type badge component [quick]
├── Task 5: Fix HeroHeader "Top tag" empty display [quick]
└── Task 6: CSS reduced-motion utility classes [quick]

Wave 2 (Filtering & Search — core feature):
├── Task 7: FilterBar component (tags + search) [unspecified-high]
├── Task 8: Animated project grid (replace VirtualizedProjectGrid for ≤50 items) [deep]
└── Task 9: Integrate FilterBar + AnimatedGrid into ProjectGallery [unspecified-high]

Wave 3 (Micro-Interactions — polish):
├── Task 10: Hero entrance animations (HeroHeaderClient wrapper) [visual-engineering]
├── Task 11: Card hover parallax/tilt effect [visual-engineering]
├── Task 12: Stats counter animation (Intersection Observer) [quick]
└── Task 13: Scroll-reveal for below-fold cards [quick]

Wave 4 (Modal Redesign):
├── Task 14: Modal prev/next navigation + keyboard arrows [unspecified-high]
├── Task 15: Modal layout reorganization + type badge + smart description [visual-engineering]
└── Task 16: Modal close button fix (move to container) [quick]

Wave FINAL (Verification — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA via Playwright (unspecified-high)
└── F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 7 → Task 9 → Task 13 → Task 14 → F1-F4
Parallel Speedup: ~55% faster than sequential
Max Concurrent: 7 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | - | 7, 14, 15 |
| 2 | - | 7, 9 |
| 3 | - | 9 |
| 4 | 1 | 15 |
| 5 | - | 10 |
| 6 | - | 10, 11, 12, 13 |
| 7 | 1, 2 | 9 |
| 8 | - | 9 |
| 9 | 7, 8 | F3 |
| 10 | 5, 6 | F3 |
| 11 | 6 | F3 |
| 12 | 6 | F3 |
| 13 | 6 | F3 |
| 14 | 1 | 15 |
| 15 | 4, 14 | F3 |
| 16 | - | F3 |

### Agent Dispatch Summary

- **Wave 1**: 6 tasks — T1-T4 → `quick`, T5-T6 → `quick`
- **Wave 2**: 3 tasks — T7 → `unspecified-high`, T8 → `deep`, T9 → `unspecified-high`
- **Wave 3**: 4 tasks — T10-T11 → `visual-engineering`, T12-T13 → `quick`
- **Wave 4**: 3 tasks — T14 → `unspecified-high`, T15 → `visual-engineering`, T16 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Tag extraction + project type inference utility

  **What to do**:
  - Write failing tests in `tests/unit/projects/projectType.spec.ts` for:
    - `extractAllTags(projects)` — returns sorted unique tags with counts, handles null/empty tags
    - `inferProjectType(tags)` — returns one of: `"Game"`, `"Tool"`, `"Experiment"`, `"Other"` based on tag mapping
    - Define the mapping: tags containing `["react-three-fiber", "three.js", "webgl", "game"]` → `"Game"`, `["docker", "cli", "sdk", "api"]` → `"Tool"`, anything not matching → `"Other"`
  - Implement `utils/projects/tags.ts` — add `extractAllTags` function
  - Implement `utils/projects/projectType.ts` — add `inferProjectType` and `PROJECT_TYPE_RULES` mapping
  - Run tests: `npx vitest run tests/unit/projects/projectType.spec.ts` → GREEN

  **Must NOT do**:
  - Do not add a `project_type` column to the database
  - Do not modify the Supabase schema or types
  - Do not import any new npm packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-6)
  - **Blocks**: Tasks 7, 14, 15
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `utils/projects/tags.ts` — existing tag utilities (`normalizeTags`, `getVisibleTags`, `formatTagLabel`) — follow same export patterns and naming conventions
  - `types/index.ts:Project` — the Project type with `tags: string[] | null` field

  **Test References**:
  - `tests/unit/` — look at existing test structure for patterns (describe/it blocks, import style)

  **WHY Each Reference Matters**:
  - `tags.ts` shows the established convention for tag utility functions — you must match its style
  - `types/index.ts` defines the `Project` type that `extractAllTags` will consume

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/projectType.spec.ts`
  - [ ] `npx vitest run tests/unit/projects/projectType.spec.ts` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Extract all tags from project array
    Tool: Bash (node)
    Preconditions: Dev server not needed
    Steps:
      1. Run `npx vitest run tests/unit/projects/projectType.spec.ts`
      2. Assert all test cases pass for `extractAllTags` including: empty array, null tags, duplicate tags, mixed tags
      3. Assert `extractAllTags` returns tags sorted alphabetically with counts
    Expected Result: All tests green, 0 failures
    Failure Indicators: Any test failure, missing edge case coverage
    Evidence: .sisyphus/evidence/task-1-tag-utilities.txt

  Scenario: Infer project type from tags
    Tool: Bash (node)
    Preconditions: Same test file
    Steps:
      1. Run same test suite
      2. Assert `inferProjectType(["react-three-fiber", "three.js"])` returns `"Game"`
      3. Assert `inferProjectType(["docker", "cli"])` returns `"Tool"`
      4. Assert `inferProjectType(["typescript", "react"])` returns `"Other"`
      5. Assert `inferProjectType([])` returns `"Other"`
      6. Assert `inferProjectType(null)` returns `"Other"`
    Expected Result: All type inference tests pass
    Failure Indicators: Wrong type returned, crash on null/empty
    Evidence: .sisyphus/evidence/task-1-type-inference.txt
  ```

  **Commit**: YES (grouped with Wave 1)
  - Message: `feat(ui): add tag inference, filter hooks, badges, and reduced-motion utilities`
  - Files: `utils/projects/projectType.ts`, `utils/projects/tags.ts`, `tests/unit/projects/projectType.spec.ts`
  - Pre-commit: `npx vitest run tests/unit/projects/projectType.spec.ts`

- [x] 2. Filter state hook + URL sync hook

  **What to do**:
  - Write failing tests in `tests/unit/hooks/useFilter.spec.tsx` for:
    - `useFilterState(projects)` — manages active tags Set and search query string
    - `useFilterSync()` — syncs active tags to URL search params (`?tag=react&tag=three.js`)
    - `useFilterSync()` — reads URL params on mount to restore filter state
    - Edge cases: no params (show all), invalid tag (ignored), multiple tags
  - Implement `components/projects/useFilterState.ts` — hook returning `{ activeTags, setActiveTags, searchQuery, setSearchQuery, filteredProjects }`
  - Implement `components/projects/useFilterSync.ts` — hook using `useSearchParams` from `next/navigation` to sync filter state with URL
  - The `useFilterState` hook should compute `filteredProjects` by filtering the project list against active tags AND search query (case-insensitive match on title + short_description + description)
  - Run tests: `npx vitest run tests/unit/hooks/useFilter.spec.tsx` → GREEN

  **Must NOT do**:
  - Do not modify `app/page.tsx` server component (that's Task 9)
  - Do not make API calls — all filtering is client-side from cached data
  - Do not use `window.location` directly — use Next.js `useSearchParams`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-6)
  - **Blocks**: Tasks 7, 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/projects/useSelectedProject.ts` — existing client-side state hook pattern, follow its export and type style
  - `utils/hooks/useEscapeKey.ts` — existing custom hook pattern
  - `utils/hooks/useIsMountedRef.ts` — existing custom hook pattern

  **API/Type References**:
  - `types/index.ts:Project` — the Project type that `filteredProjects` will be typed as
  - Next.js `useSearchParams` — for URL param sync: https://nextjs.org/docs/app/api-reference/functions/use-search-params

  **Test References**:
  - `tests/unit/` — existing test patterns using vitest + @testing-library/react

  **External References**:
  - Next.js docs: `useSearchParams` returns `ReadonlyURLSearchParams` — use ` Suspense boundary` when reading in a component

  **WHY Each Reference Matters**:
  - `useSelectedProject.ts` is the exact same pattern (state hook for project selection) — follow its conventions
  - Next.js `useSearchParams` requires Suspense boundaries — must handle this in the integration

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/hooks/useFilter.spec.tsx`
  - [ ] `npx vitest run tests/unit/hooks/useFilter.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Filter state hook filters projects by tag and search
    Tool: Bash (node)
    Preconditions: Test file exists
    Steps:
      1. Run `npx vitest run tests/unit/hooks/useFilter.spec.tsx`
      2. Assert `useFilterState` filters by active tags (intersection logic)
      3. Assert `useFilterState` filters by search query (case-insensitive title + description match)
      4. Assert combining tags AND search query works (both conditions must match)
      5. Assert clearing all filters returns all projects
    Expected Result: All filter logic tests pass
    Failure Indicators: Incorrect filtering, case sensitivity issues, empty results on valid input
    Evidence: .sisyphus/evidence/task-2-filter-hooks.txt

  Scenario: URL sync hook reads and writes search params
    Tool: Bash (node)
    Preconditions: Same test file
    Steps:
      1. Assert `useFilterSync` writes active tags to URL params as `?tag=x&tag=y`
      2. Assert `useFilterSync` reads `?tag=react&tag=three.js` and sets active tags on mount
      3. Assert invalid/unknown tags in URL are ignored (no crash, just not in active set)
      4. Assert clearing tags from state clears URL params
    Expected Result: URL sync reads and writes work correctly
    Failure Indicators: URL not updated, crash on invalid param, state not restored on mount
    Evidence: .sisyphus/evidence/task-2-url-sync.txt
  ```

  **Commit**: YES (grouped with Wave 1)
  - Message: `feat(ui): add tag inference, filter hooks, badges, and reduced-motion utilities`
  - Files: `components/projects/useFilterState.ts`, `components/projects/useFilterSync.ts`, `tests/unit/hooks/useFilter.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/hooks/useFilter.spec.tsx`

- [x] 3. Empty filter state component

  **What to do**:
  - Write failing test in `tests/unit/projects/EmptyFilterState.spec.tsx` for:
    - Renders "No projects found" message when no results
    - Displays the active search query or tags that produced zero results
    - Has a "Clear filters" button that resets filters
  - Implement `components/projects/EmptyFilterState.tsx` — cyber-minimalist styled empty state
  - Design: centered layout with a subtle icon (SearchX from lucide-react), message showing what was searched, and a cyan "Clear filters" button
  - Follow existing glassmorphism style from `globals.css` `.glass-panel`

  **Must NOT do**:
  - Do not make it a full-page overlay — it replaces the grid area only
  - Do not use any third-party illustration library

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-2, 4-6)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/ProjectGallery.tsx:19-26` — existing empty state ("No projects yet" / "Check back later") — match its tone but enhance visually
  - `app/globals.css` — `.glass-panel` glassmorphism class, existing color variables (`--neon-blue`, `--foreground`)

  **WHY Each Reference Matters**:
  - `ProjectGallery.tsx` lines 19-26 shows the existing empty state pattern — the new component should be a richer version of this that includes active filter context

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/EmptyFilterState.spec.tsx`
  - [ ] `npx vitest run tests/unit/projects/EmptyFilterState.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Empty state renders with search context
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. In the search input, type "zzzzzz-no-match"
      3. Assert the empty state component is visible
      4. Assert it shows "No projects found" or similar message
      5. Assert a "Clear filters" button is visible
      6. Click "Clear filters"
      7. Assert all projects are visible again
    Expected Result: Empty state shows, clear button resets filters
    Failure Indicators: Grid still shows after impossible search, clear button missing, no message shown
    Evidence: .sisyphus/evidence/task-3-empty-state.png

  Scenario: Empty state with tag filter
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Click a tag pill in the filter bar (e.g., "React")
      3. Verify projects are filtered
      4. Click another tag that produces zero results (if possible, or combine with search)
      5. Assert empty state appears with context about which filters are active
    Expected Result: Empty state provides context about what filters are active
    Failure Indicators: Generic "no results" without filter context
    Evidence: .sisyphus/evidence/task-3-empty-state-tag.png
  ```

  **Commit**: YES (grouped with Wave 1)
  - Message: `feat(ui): add tag inference, filter hooks, badges, and reduced-motion utilities`
  - Files: `components/projects/EmptyFilterState.tsx`, `tests/unit/projects/EmptyFilterState.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/projects/EmptyFilterState.spec.tsx`

- [x] 4. Project type badge component

  **What to do**:
  - Write failing test in `tests/unit/projects/ProjectTypeBadge.spec.tsx` for:
    - Renders "Game" badge with game-specific color (cyan/blue)
    - Renders "Tool" badge with tool-specific color (amber/yellow)
    - Renders "Other" badge with neutral color (zinc)
    - Does not render anything for null/undefined type
  - Implement `components/projects/ProjectTypeBadge.tsx` — small colored badge using the `inferProjectType` result
  - Use existing Lucide React icons per type: `Gamepad2` for Game, `Wrench` for Tool, `FlaskConical` for Experiment, `Sparkles` for Other
  - Style: small pill with icon + label, using the project's existing cyan/zinc palette from `ProjectTags.tsx`

  **Must NOT do**:
  - Do not add new color variables to `globals.css` — use existing Tailwind/cyan/zinc palette
  - Do not make the badge interactive (no click handler) — it's display-only

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-6)
  - **Blocks**: Task 15
  - **Blocked By**: Task 1 (needs `inferProjectType`)

  **References**:

  **Pattern References**:
  - `components/projects/ProjectTags.tsx` — existing badge component with variant styles. Follow same pattern: `Variant` type, `STYLES` record, component accepting variant prop

  **API/Type References**:
  - `utils/projects/projectType.ts` (Task 1) — `inferProjectType()` and return type `ProjectType`

  **External References**:
  - Lucide React icons: `Gamepad2`, `Wrench`, `FlaskConical`, `Sparkles`

  **WHY Each Reference Matters**:
  - `ProjectTags.tsx` is the exact same concept (a badge component) — follow its pattern for consistency

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/ProjectTypeBadge.spec.tsx`
  - [ ] `npx vitest run tests/unit/projects/ProjectTypeBadge.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Badge renders correct type with color
    Tool: Bash (node)
    Preconditions: Test file exists
    Steps:
      1. Run `npx vitest run tests/unit/projects/ProjectTypeBadge.spec.tsx`
      2. Assert "Game" type renders with game icon and cyan styling
      3. Assert "Tool" type renders with tool icon and amber styling
      4. Assert "Other" type renders with neutral styling
      5. Assert null type renders nothing
    Expected Result: All badge rendering tests pass
    Failure Indicators: Wrong color, missing icon, null crash
    Evidence: .sisyphus/evidence/task-4-type-badge.txt
  ```

  **Commit**: YES (grouped with Wave 1)
  - Message: `feat(ui): add tag inference, filter hooks, badges, and reduced-motion utilities`
  - Files: `components/projects/ProjectTypeBadge.tsx`, `tests/unit/projects/ProjectTypeBadge.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/projects/ProjectTypeBadge.spec.tsx`

- [x] 5. Fix HeroHeader "Top tag" empty display

  **What to do**:
  - Read `components/HeroHeader.tsx` and `app/page.tsx` to find why "Top tag" `<dd>` is empty
  - The `topTag` prop is computed in `page.tsx` and passed to `HeroHeader` — verify the data reaches the component
  - Fix the rendering so the top tag value displays (e.g., "React" or "TypeScript")
  - Add a visual indicator: use the `formatTagLabel` util from `utils/projects/tags.ts` for display
  - Write a test that renders HeroHeader with a `topTag` prop and asserts the text appears

  **Must NOT do**:
  - Do not change HeroHeader from a server component to a client component (that's Task 10)
  - Do not modify the data fetching logic in `page.tsx` — just fix the rendering

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6)
  - **Blocks**: Task 10
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/HeroHeader.tsx` — the component with the bug; lines 53-58 show the "At a glance" panel including the empty `<dd>` for top tag
  - `app/page.tsx:26-35` — where `topTag` is computed from tag frequency map
  - `utils/projects/tags.ts:formatTagLabel` — use this to render the tag nicely

  **WHY Each Reference Matters**:
  - `HeroHeader.tsx` has the rendering bug — the `<dd>` for top tag needs to be fixed
  - `page.tsx` computes `topTag` correctly — the issue is in the rendering, not the data

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/components/HeroHeader.spec.tsx`
  - [ ] `npx vitest run tests/unit/components/HeroHeader.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Top tag displays correctly in At a Glance panel
    Tool: Playwright
    Preconditions: Dev server running with seeded data
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Locate the "At a glance" panel
      3. Find the "Top tag" row
      4. Assert the value is NOT empty — it shows a real tag name (e.g., "React", "TypeScript")
      5. Assert the top tag matches the most frequent tag in the project list
    Expected Result: Top tag shows the most common tag with text, not empty
    Failure Indicators: Empty <dd>, whitespace only, "undefined" displayed
    Evidence: .sisyphus/evidence/task-5-top-tag-fix.png
  ```

  **Commit**: YES (grouped with Wave 1)
  - Message: `feat(ui): add tag inference, filter hooks, badges, and reduced-motion utilities`
  - Files: `components/HeroHeader.tsx`, `tests/unit/components/HeroHeader.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/components/HeroHeader.spec.tsx`

- [x] 6. CSS reduced-motion utility classes

  **What to do**:
  - Add to `app/globals.css` a `@media (prefers-reduced-motion: reduce)` block that:
    - Disables all transitions: `* { transition-duration: 0.01ms !important; }`
    - Disables all animations: `* { animation-duration: 0.01ms !important; }`
    - Removes framer-motion `layout` animations by setting `transform: none`
  - Add a `.motion-reduced` CSS class that can be toggled by JS for browsers that don't support the media query
  - Verify the existing HomepageAtmosphere component uses `prefers-reduced-motion` (it already does via `ParticleBackground.tsx`) — ensure consistency
  - Write a test that checks `globals.css` contains the reduced-motion rules

  **Must NOT do**:
  - Do not modify the ParticleBackground or HomepageAtmosphere components
  - Do not remove any existing animations — only add reduced-motion overrides
  - Do not add any npm packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5)
  - **Blocks**: Tasks 10, 11, 12, 13
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `app/globals.css:1-152` — existing style definitions. Add the `@media (prefers-reduced-motion)` block after the existing keyframe animations
  - `components/ParticleBackground.tsx:13-17` — already checks `prefers-reduced-motion` media query. Reference this pattern for consistency.

  **WHY Each Reference Matters**:
  - `globals.css` is where all custom CSS classes live — the reduced-motion overrides must go here
  - `ParticleBackground.tsx` already handles reduced motion — new CSS should complement, not conflict

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test (or verification command) exists for reduced-motion rules
  - [ ] `grep -c "prefers-reduced-motion" app/globals.css` returns ≥ 1

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Reduced-motion CSS overrides are present
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run `grep -c "prefers-reduced-motion" app/globals.css`
      2. Assert count is ≥ 1
      3. Run `grep "animation-duration" app/globals.css` and verify 0.01ms value exists
      4. Run `grep "transition-duration" app/globals.css` and verify 0.01ms value exists
    Expected Result: Reduced-motion overrides exist in CSS
    Failure Indicators: Missing media query, wrong values, no overrides
    Evidence: .sisyphus/evidence/task-6-reduced-motion.txt

  Scenario: Reduced-motion disables animations in browser
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Use `page.emulateMedia({ reducedMotion: 'reduce' })` to enable reduced motion
      3. Refresh the page
      4. Hover over a project card
      5. Assert no scale/translate animation occurs (card stays at scale 1, y 0)
      6. Assert the page still functions correctly (cards clickable, modal opens)
    Expected Result: Animations are suppressed, functionality preserved
    Failure Indicators: Animations still play, functionality broken
    Evidence: .sisyphus/evidence/task-6-reduced-motion-browser.png
  ```

  **Commit**: YES (grouped with Wave 1)
  - Message: `feat(ui): add tag inference, filter hooks, badges, and reduced-motion utilities`
  - Files: `app/globals.css`
  - Pre-commit: `npm run typecheck`

- [x] 7. FilterBar component (tags + search)

  **What to do**:
  - Write failing tests in `tests/unit/projects/FilterBar.spec.tsx` for:
    - Renders all unique tags as clickable pills from project list
    - Highlights active tag pills with neon-cyan style
    - "All" pill resets all filters
    - Search input filters by title/description (debounced)
    - Clicking a tag calls `setActiveTags`
    - Typing in search calls `setSearchQuery`
  - Implement `components/projects/FilterBar.tsx` — horizontal scrollable filter bar with:
    - "All" pill (default active) → resets all filters
    - Tag pills sorted alphabetically, each showing the tag label and count
    - Search input on the right (or below on mobile) with Search icon from lucide-react
    - Active tags highlighted with cyan glow (`.text-glow`, `bg-cyan-500/20`, `border-cyan-500`)
    - Inactive tags: subtle zinc style with hover state
    - Uses `useFilterState` and `useFilterSync` hooks from Task 2
    - Uses `extractAllTags` from Task 1 for initial tag list
  - Style: glassmorphism bar matching the "At a glance" panel style
  - Responsive: horizontal scroll on mobile, full width bar on desktop
  - Wrap in `Suspense` boundary (because `useFilterSync` uses `useSearchParams`)

  **Must NOT do**:
  - Do not modify `ProjectGallery.tsx` or `page.tsx` — that's Task 9
  - Do not make network requests — all data comes from props
  - Do not use `window.location` — use Next.js `useSearchParams`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 1, 2)
  - **Parallel Group**: Wave 2 (with Tasks 8, 9)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `components/projects/ProjectTags.tsx` — existing tag rendering pattern with `STYLES` record and `Variant` type. Follow this pattern for pill styling.
  - `components/HeroHeader.tsx:55` — "At a glance" glassmorphism panel style (`.glass-panel`, `border-white/10`, `rounded-3xl`)
  - `components/ProjectGallery.tsx` — existing gallery that FilterBar will be integrated into in Task 9

  **API/Type References**:
  - `utils/projects/tags.ts:extractAllTags` (Task 1) — for extracting unique tags with counts
  - `components/projects/useFilterState.ts` (Task 2) — for filter state management
  - `components/projects/useFilterSync.ts` (Task 2) — for URL sync

  **WHY Each Reference Matters**:
  - `ProjectTags.tsx` is the closest existing component — match its pill styling pattern
  - `HeroHeader.tsx` glassmorphism is the design language to follow for the bar background

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/FilterBar.spec.tsx`
  - [ ] `npx vitest run tests/unit/projects/FilterBar.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Filter bar renders and filters projects by tag
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Assert filter bar is visible above the project grid
      3. Assert "All" pill is active by default (cyan highlight)
      4. Click the "React" tag pill
      5. Assert only projects with "React" tag are visible in the grid
      6. Assert the "React" pill is now highlighted
      7. Click "All" pill
      8. Assert all projects are visible again
    Expected Result: Tag filtering works instantly, active state updates correctly
    Failure Indicators: Grid not filtered, active state not highlighted, "All" doesn't reset
    Evidence: .sisyphus/evidence/task-7-filterbar-tag-filter.png

  Scenario: Search input filters projects by text
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Find the search input in the filter bar
      3. Type "dungeon" (lowercase)
      4. Assert only "Idle Dungeon Crawler" appears in the grid
      5. Clear the search input
      6. Assert all projects are visible again
      7. Type "ZZZZ" (no matches)
      8. Assert empty state appears (from Task 3)
    Expected Result: Search filters correctly, case-insensitive, empty state on no matches
    Failure Indicators: Case-sensitive search, no empty state, search doesn't clear
    Evidence: .sisyphus/evidence/task-7-filterbar-search.png

  Scenario: URL param sync — shareable filtered link
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001?tag=React`
      2. Assert the "React" tag pill is active on page load
      3. Assert only React projects are shown
      4. Click "All" to reset
      5. Assert URL changes to remove the tag param
      6. Navigate to `http://localhost:3001?tag=react&tag=typescript` (two tags)
      7. Assert both tag pills are active
      8. Assert projects matching EITHER tag are shown (OR logic for multiple tags)
    Expected Result: URL params correctly set and restore filter state
    Failure Indicators: URL not updated, page load doesn't restore filters, crash on multiple params
    Evidence: .sisyphus/evidence/task-7-filterbar-url-sync.png
  ```

  **Commit**: YES (grouped with Wave 2)
  - Message: `feat(ui): add tag filter bar and animated project grid with URL sync`
  - Files: `components/projects/FilterBar.tsx`, `tests/unit/projects/FilterBar.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/projects/FilterBar.spec.tsx`

- [x] 8. Animated project grid (replace VirtualizedProjectGrid for ≤50 items)

  **What to do**:
  - Write failing tests in `tests/unit/projects/AnimatedProjectGrid.spec.tsx` for:
    - Renders projects with AnimatePresence for enter/exit animations
    - Applies `layoutId` matching for Framer Motion layout animations
    - Shows empty state (from Task 3) when `projects` array is empty
    - Shows empty state when filter produces no results
  - Implement `components/projects/AnimatedProjectGrid.tsx` — a non-virtualized grid that:
    - Uses Framer Motion `AnimatePresence` with `mode="popLayout"` for filter enter/exit
    - Uses `motion.div` with `layout` prop on each card for smooth reflow
    - Conditionally switches to VirtualizedProjectGrid if projects count > 50
    - Maintains the same 3-column responsive grid layout (1 col mobile, 2 tablet, 3 desktop)
    - Passes `onProjectClick` to each `ProjectCard`
  - Add an `initial`, `animate`, `exit` animation config:
    - `initial={{ opacity: 0, y: 20 }}`
    - `animate={{ opacity: 1, y: 0 }}`
    - `exit={{ opacity: 0, scale: 0.95 }}`
  - Animation respects `prefers-reduced-motion` — no animation when reduced motion preferred

  **Must NOT do**:
  - Do not delete `VirtualizedProjectGrid.tsx` — it remains as a fallback for 50+ projects
  - Do not modify `ProjectCard.tsx` — it should work unchanged in both grids
  - Do not use `react-window` in the animated grid — it's incompatible with AnimatePresence

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent of Task 7)
  - **Parallel Group**: Wave 2 (with Tasks 7, 9)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/projects/VirtualizedProjectGrid.tsx` — the existing grid. New `AnimatedProjectGrid` must offer the same props: `projects` and `onProjectClick`, and maintain same responsive column behavior (1/2/3 cols)
  - `components/ProjectModal.tsx:79` — existing `layoutId={project.id}` pattern. The animated grid must use the same `layoutId` on each card for the modal transition to work

  **API/Type References**:
  - `components/projects/EmptyFilterState.tsx` (Task 3) — render when no results
  - Framer Motion `AnimatePresence` + `layout` prop — key animation primitives

  **Test References**:
  - `tests/unit/projects/` — existing project component tests

  **External References**:
  - Framer Motion docs: https://motion.dev/docs/animate-presence — for enter/exit animation patterns
  - Framer Motion layout animations: https://motion.dev/docs/layout-animations — for `layoutId` and `layout` prop usage

  **WHY Each Reference Matters**:
  - `VirtualizedProjectGrid.tsx` defines the contract — same props, same responsive behavior
  - `layoutId={project.id}` in `ProjectModal.tsx` is critical — the card→modal transition relies on matching layoutIds
  - AnimatePresence is the key Framer Motion API for filter transitions

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/AnimatedProjectGrid.spec.tsx`
  - [ ] `npx vitest run tests/unit/projects/AnimatedProjectGrid.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Animated grid renders and filters with smooth transitions
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Assert all 19 project cards are visible
      3. Click a tag in the FilterBar (e.g., "React")
      4. Assert cards animate out (those not matching) and remaining cards reflow smoothly
      5. Assert no cards overlap or jump during animation
      6. Click "All" to reset
      7. Assert all cards animate back in
    Expected Result: Smooth enter/exit animations, no jank, no layout shift
    Failure Indicators: Cards disappear instantly, layout jumps, overlap, visual glitches
    Evidence: .sisyphus/evidence/task-8-animated-grid.png

  Scenario: Card-to-modal layout transition still works
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Click on a project card (e.g., "Idle Dungeon Crawler")
      3. Assert the modal opens with a smooth layout animation (card expands into modal)
      4. Press Escape to close
      5. Assert the modal closes with the card shrinking back
    Expected Result: layoutId transitions still work with new AnimatedProjectGrid
    Failure Indicators: Modal opens without animation, card→modal transition broken
    Evidence: .sisyphus/evidence/task-8-modal-transition.png

  Scenario: Reduced-motion disables animations
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Use `page.emulateMedia({ reducedMotion: 'reduce' })`
      2. Navigate to `http://localhost:3001`
      3. Click a tag filter
      4. Assert cards appear/disappear instantly (no animation)
      5. Assert grid still functions correctly
    Expected Result: No animations when reduced-motion is active
    Failure Indicators: Animations still play with reduced motion
    Evidence: .sisyphus/evidence/task-8-reduced-motion.txt
  ```

  **Commit**: YES (grouped with Wave 2)
  - Message: `feat(ui): add tag filter bar and animated project grid with URL sync`
  - Files: `components/projects/AnimatedProjectGrid.tsx`, `tests/unit/projects/AnimatedProjectGrid.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/projects/AnimatedProjectGrid.spec.tsx`

- [x] 9. Integrate FilterBar + AnimatedGrid into ProjectGallery

  **What to do**:
  - Update `components/ProjectGallery.tsx` to:
    - Import and render `FilterBar` above the grid
    - Use `useFilterState` hook to manage filter state
    - Use `useFilterSync` hook (wrapped in Suspense) for URL param sync
    - Use `extractAllTags` to pass unique tags to FilterBar
    - Conditionally render `AnimatedProjectGrid` (≤50 projects) or `VirtualizedProjectGrid` (>50 projects)
    - Render `EmptyFilterState` when filtered results are empty
  - Update `app/page.tsx` to pass all necessary props down (projects, tags data)
  - Wrap the FilterBar usage in a `<Suspense>` boundary (required by `useSearchParams`)
  - Ensure the "Browse the archive" section header and description remain above the FilterBar
  - Test the full integration: filter → grid updates → URL syncs → empty state

  **Must NOT do**:
  - Do not remove `VirtualizedProjectGrid.tsx` — it's the fallback for 50+ projects
  - Do not change the server-side data fetching in `page.tsx` beyond passing additional props
  - Do not break the existing modal (ProjectModal) open/close flow

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 7, 8)
  - **Parallel Group**: Wave 2 end
  - **Blocks**: F3 (integration testing)
  - **Blocked By**: Tasks 7, 8

  **References**:

  **Pattern References**:
  - `components/ProjectGallery.tsx` — the current orchestrator component. This is the file to modify. It already handles `selectedProject` state and `ProjectModal`.
  - `app/page.tsx:44-70` — page component that renders `HeroHeader` and `ProjectGallery`. Pass `projects` as prop.
  - `components/Project.tsx` — no such file exists; the type is in `types/index.ts`

  **API/Type References**:
  - `components/projects/FilterBar.tsx` (Task 7) — the component to integrate
  - `components/projects/AnimatedProjectGrid.tsx` (Task 8) — the new grid to use
  - `components/projects/useFilterState.ts` (Task 2) — filter state management
  - `components/projects/useFilterSync.ts` (Task 2) — URL sync hook

  **WHY Each Reference Matters**:
  - `ProjectGallery.tsx` is the integration point — all new components wire together here
  - `page.tsx` determines what data reaches the gallery — may need to pass tag data

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Existing tests still pass
  - [ ] `npx vitest run` → all pass
  - [ ] `npm run build` → successful

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full integration — filter bar + animated grid + URL sync
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Assert filter bar appears above the grid with "All" selected
      3. Assert all 19 projects visible
      4. Click "React" tag pill
      5. Assert only React-tagged projects remain
      6. Assert URL changed to `?tag=React`
      7. Copy URL, open new tab, paste URL
      8. Assert same filtered state (React selected, same projects visible)
      9. Type "3d" in search input
      10. Assert further filtering (projects matching both React tag AND "3d" in text)
      11. Click "All" to reset
      12. Assert all projects visible, URL params cleared
    Expected Result: Seamless end-to-end filter → grid → URL sync cycle
    Failure Indicators: Grid doesn't update, URL not synced, state lost on page reload
    Evidence: .sisyphus/evidence/task-9-integration.png

  Scenario: Filter + modal interaction
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Filter to see fewer projects (e.g., tag "React")
      3. Click a remaining project card
      4. Assert modal opens with project details
      5. Press Escape to close modal
      6. Assert filter state is preserved (same tag, same filtered grid)
    Expected Result: Modal and filter work together without state conflicts
    Failure Indicators: Filter reset on modal close, modal doesn't open from filtered view
    Evidence: .sisyphus/evidence/task-9-filter-modal.png

  Scenario: Empty state from filter
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Type "zzzzzzz" in the search input
      3. Assert empty state component appears (from Task 3)
      4. Assert "Clear filters" button is visible
      5. Click "Clear filters"
      6. Assert all projects visible again, search input cleared
    Expected Result: Smooth transition to and from empty state
    Failure Indicators: Empty grid with no message, clear button doesn't work
    Evidence: .sisyphus/evidence/task-9-empty-state.png
  ```

  **Commit**: YES (grouped with Wave 2)
  - Message: `feat(ui): add tag filter bar and animated project grid with URL sync`
  - Files: `components/ProjectGallery.tsx`, `app/page.tsx`
  - Pre-commit: `npm run check`

- [x] 10. Hero entrance animations (HeroHeaderClient wrapper)

  **What to do**:
  - Create `components/HeroHeaderClient.tsx` — a `'use client'` wrapper that imports `HeroHeader` and adds Framer Motion entrance animations:
    - Staggered children animation: badge → title → subtitle → buttons → stats panel
    - Each element fades in + slides up (`y: 20 → 0`, `opacity: 0 → 1`)
    - Stagger delay: 100ms between each element
    - Animation triggers on mount (first viewport entry)
    - When `prefers-reduced-motion` is active, all elements appear immediately (no animation)
  - Use Framer Motion `useReducedMotion()` hook for the client-side check
  - Convert `HeroHeader.tsx` rendering: `page.tsx` should import `HeroHeaderClient` instead of `HeroHeader`
  - The server-rendered `HeroHeader.tsx` remains as the fallback/static content for SSR

  **Must NOT do**:
  - Do not add `'use client'` directly to `HeroHeader.tsx` — keep it as a server component
  - Do not break SSR — the hero must render server-side content first, then hydrate with animations
  - Do not remove the static rendering — search engines must still see all the content

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-dev`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Tasks 5, 6)
  - **Parallel Group**: Wave 3 (with Tasks 11-13)
  - **Blocks**: F3
  - **Blocked By**: Tasks 5 (top tag fix), 6 (reduced-motion CSS)

  **References**:

  **Pattern References**:
  - `components/HeroHeader.tsx` — the current server component to wrap. All its JSX becomes children of the animated wrapper.
  - `app/page.tsx:49` — imports and renders `<HeroHeader>` — change to `<HeroHeaderClient>`
  - `components/HomepageAtmosphere.tsx` — already uses `'use client'` for interactive CSS custom properties. Follow similar client-wrapper pattern.
  - `components/ParticleBackground.tsx:13-17` — already checks `prefers-reduced-motion`. Reference this for the `useReducedMotion` pattern.

  **API/Type References**:
  - Framer Motion `useReducedMotion()`: returns `boolean` — https://motion.dev/docs/use-reduced-motion
  - Framer Motion `motion.div` stagger: https://motion.dev/docs/animation#stagger-children

  **WHY Each Reference Matters**:
  - `HeroHeader.tsx` is the exact component to wrap — understand its structure first
  - `HomepageAtmosphere.tsx` shows the established pattern for client-side interactive components
  - `ParticleBackground.tsx` shows the existing reduced-motion pattern

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test verifies HeroHeaderClient renders children with animation props
  - [ ] `npx vitest run tests/unit/components/HeroHeaderClient.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Hero elements animate in with staggered entrance
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Assert the "Live experiments & digital builds" badge appears with animation
      3. Assert the "PROJECT HUB" title fades in after the badge
      4. Assert the description text appears after the title
      5. Assert the "Explore projects" button appears after the description
      6. Assert the "At a glance" stats panel appears last
      7. Assert each animation is smooth (no flash, no layout shift)
    Expected Result: Staggered entrance animation makes the hero feel alive
    Failure Indicators: All elements appear at once, no delay between items, layout shift, flash
    Evidence: .sisyphus/evidence/task-10-hero-animation.png

  Scenario: Reduced-motion disables hero animations
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Use `page.emulateMedia({ reducedMotion: 'reduce' })`
      2. Navigate to `http://localhost:3001`
      3. Assert all hero elements appear immediately (no fade-in, no slide-up)
      4. Assert the hero is fully functional (all text visible, buttons clickable)
    Expected Result: No entrance animation with reduced-motion preference
    Failure Indicators: Animations still play, content missing, buttons not working
    Evidence: .sisyphus/evidence/task-10-hero-reduced-motion.png
  ```

  **Commit**: YES (grouped with Wave 3)
  - Message: `feat(ui): add hero animations, card parallax, stats counter, and scroll reveal`
  - Files: `components/HeroHeaderClient.tsx`, `app/page.tsx`, `tests/unit/components/HeroHeaderClient.spec.tsx`
  - Pre-commit: `npm run typecheck && npx vitest run tests/unit/components/HeroHeaderClient.spec.tsx`

- [x] 11. Card hover parallax/tilt effect

  **What to do**:
  - Create `components/projects/AnimatedCard.tsx` — a wrapper around `ProjectCard` that adds:
    - 3D perspective tilt on hover that follows cursor position within the card:
      - Cursor at left edge → card tilts `rotateY(5deg)`
      - Cursor at right edge → card tilts `rotateY(-5deg)`
      - Cursor at top edge → card tilts `rotateX(-5deg)`
      - Cursor at bottom edge → card tilts `rotateX(5deg)`
      - Center → no tilt
    - Smooth transition on mouse leave: card returns to flat state over 300ms
    - On hover: image zoom subtly (scale 1.05) in addition to existing grayscale removal
    - On hover: description text brightens from `text-zinc-400` → `text-zinc-200`
    - On hover: tag pills get a subtle glow pulse
  - Uses `onMouseMove` to track cursor position relative to card center
  - Uses `onMouseLeave` to reset tilt
  - Respects `prefers-reduced-motion` — no tilt effect when reduced motion preferred
  - Replace `ProjectCard` usage in `AnimatedProjectGrid` (and `VirtualizedProjectGrid`) with `AnimatedCard`
  - Update `ProjectCard.tsx` to accept a `hovered` prop that controls the text/glow enhanced states

  **Must NOT do**:
  - Do not use `onMouseMove` on every frame with `requestAnimationFrame` — throttle to 16ms via CSS transitions
  - Do not break the Framer Motion `layoutId` transition — `AnimatedCard` must pass through `layoutId`
  - Do not add any npm packages — use `onMouseMove` + CSS `transform: perspective(1000px) rotateX() rotateY()` via inline styles

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-dev`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 6)
  - **Parallel Group**: Wave 3 (with Tasks 10, 12, 13)
  - **Blocks**: F3
  - **Blocked By**: Task 6 (reduced-motion CSS)

  **References**:

  **Pattern References**:
  - `components/ProjectCard.tsx:16-57` — current card implementation. The `whileHover` already exists. `AnimatedCard` wraps this and adds tilt.
  - `components/HomepageAtmosphere.tsx:17-53` — cursor-tracking pattern using `onPointerMove`. Follow similar approach but for card-local coords.
  - `app/globals.css:53-58` — `.text-glow` and `.box-glow` classes for glow effects.

  **API/Type References**:
  - Framer Motion `motion.div` with `layoutId` prop — critical for card→modal transition

  **WHY Each Reference Matters**:
  - `ProjectCard.tsx` is what we're enhancing — must preserve all existing behavior including `layoutId`
  - `HomepageAtmosphere.tsx` shows the established cursor-tracking pattern in this codebase

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/AnimatedCard.spec.tsx`
  - [ ] `npx vitest run tests/unit/projects/AnimatedCard.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Card tilts following cursor on hover
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Hover over a project card
      3. Move cursor to the left edge of the card
      4. Assert card has a slight rotateY tilt toward the left
      5. Move cursor to the top edge
      6. Assert card has a slight rotateX tilt
      7. Move cursor away from card
      8. Assert card returns to flat (no tilt) with a smooth 300ms transition
    Expected Result: Smooth 3D tilt effect following cursor, returns to flat on leave
    Failure Indicators: No tilt, janky animation, tilt doesn't reset, layout shift
    Evidence: .sisyphus/evidence/task-11-card-tilt.png

  Scenario: Hover enhances card visuals
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Hover over a project card
      3. Assert image becomes full color (grayscale removed) and has subtle zoom (scale ~1.05)
      4. Assert description text becomes brighter (text-zinc-200)
      5. Assert tag pills have a subtle glow effect
    Expected Result: Enhanced card visuals on hover, subtle and premium feeling
    Failure Indicators: No visual change, jarring transition, broken layout
    Evidence: .sisyphus/evidence/task-11-card-enhanced-hover.png

  Scenario: Reduced-motion disables parallax tilt
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Use `page.emulateMedia({ reducedMotion: 'reduce' })`
      2. Navigate to `http://localhost:3001`
      3. Hover over a project card
      4. Assert no tilt effect (card stays flat)
      5. Assert card is still functional (clickable, opens modal)
    Expected Result: No tilt animation with reduced motion, functionality preserved
    Failure Indicators: Tilt still active, card not clickable, modal broken
    Evidence: .sisyphus/evidence/task-11-reduced-motion.png
  ```

  **Commit**: YES (grouped with Wave 3)
  - Message: `feat(ui): add hero animations, card parallax, stats counter, and scroll reveal`
  - Files: `components/projects/AnimatedCard.tsx`, `components/ProjectCard.tsx`, `tests/unit/projects/AnimatedCard.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/projects/AnimatedCard.spec.tsx`

- [x] 12. Stats counter animation (Intersection Observer)

  **What to do**:
  - Create `components/projects/StatsCounter.tsx` — a client component that:
    - Accepts `value: number` and `label: string` props
    - Uses `IntersectionObserver` to detect when the stats panel scrolls into view
    - On first appearance, animates the number from 0 to `value` over 1.5 seconds
    - Uses `requestAnimationFrame` for smooth counting animation
    - Applies easing (ease-out) for natural deceleration
    - When `prefers-reduced-motion` is active, displays the final value immediately (no animation)
  - Integrate into `components/HeroHeader.tsx` — replace static number display in the "At a glance" panel with `StatsCounter` components for:
    - Projects count
    - Featured count
  - The "Newest drop" and "Top tag" values should NOT animate (dates and text don't benefit from counting)

  **Must NOT do**:
  - Do not add `'use client'` to `HeroHeader.tsx` itself — only `StatsCounter.tsx` is a client component
  - Do not use `setInterval` for counting — use `requestAnimationFrame`
  - Do not animate string values (dates, tags) — only numeric values

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 6)
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 13)
  - **Blocks**: F3
  - **Blocked By**: Task 6 (reduced-motion CSS)

  **References**:

  **Pattern References**:
  - `components/HeroHeader.tsx:55-71` — the "At a glance" `<aside>` panel with `<dt>`/`<dd>` pairs. This is where `StatsCounter` will replace the static numbers.
  - `components/ParticleBackground.tsx:13-17` — existing `prefers-reduced-motion` check pattern

  **API/Type References**:
  - Framer Motion `useReducedMotion()` or `window.matchMedia('(prefers-reduced-motion: reduce)')` for reduced-motion check

  **WHY Each Reference Matters**:
  - `HeroHeader.tsx` lines 55-71 is the exact JSX where StatsCounter replaces static text
  - Need to know the dt/dd structure to preserve semantics while animating only the number values

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/StatsCounter.spec.tsx`
  - [ ] `npx vitest run tests/unit/projects/StatsCounter.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Stats counter animates on scroll into view
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Assert the "Projects" stat in "At a glance" panel starts at 0 or near 0
      3. The number should count up to 19 over ~1.5 seconds
      4. Assert the "Featured" stat counts up to 2
      5. After animation completes, assert both numbers display their final values stably
    Expected Result: Numbers animate from 0 to final value with smooth easing
    Failure Indicators: Numbers appear instantly without animation, jump to value, or never animate
    Evidence: .sisyphus/evidence/task-12-stats-counter.png

  Scenario: Reduced-motion shows numbers immediately
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Use `page.emulateMedia({ reducedMotion: 'reduce' })`
      2. Navigate to `http://localhost:3001`
      3. Assert "Projects" number immediately shows "19" with no counting animation
      4. Assert "Featured" number immediately shows "2"
    Expected Result: No counting animation, numbers displayed instantly
    Failure Indicators: Numbers still animate despite reduced motion
    Evidence: .sisyphus/evidence/task-12-stats-reduced-motion.png
  ```

  **Commit**: YES (grouped with Wave 3)
  - Message: `feat(ui): add hero animations, card parallax, stats counter, and scroll reveal`
  - Files: `components/projects/StatsCounter.tsx`, `components/HeroHeader.tsx`, `tests/unit/projects/StatsCounter.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/projects/StatsCounter.spec.tsx`

- [x] 13. Scroll-reveal for below-fold cards

  **What to do**:
  - Create `components/projects/ScrollReveal.tsx` — a client component that:
    - Uses `IntersectionObserver` to detect when children enter the viewport
    - On first appearance, animates children with Framer Motion: `opacity: 0, y: 30` → `opacity: 1, y: 0`
    - Stagger: each child gets a 50ms delay after the previous
    - Once revealed, stays visible (no exit animation on scroll-away)
    - Respects `prefers-reduced-motion` — children appear immediately without animation
  - Integrate into `AnimatedProjectGrid.tsx`: wrap each project card row (or individual cards) in `ScrollReveal`
  - Only apply reveal animation to cards that are initially below the fold (first row is visible immediately)

  **Must NOT do**:
  - Do not use `scroll` event listeners — use `IntersectionObserver`
  - Do not animate cards that are already in view on page load (first row)
  - Do not add `'use client'` to `AnimatedProjectGrid.tsx` — it's already a client component

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 6)
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12)
  - **Blocks**: F3
  - **Blocked By**: Task 6 (reduced-motion CSS)

  **References**:

  **Pattern References**:
  - `components/projects/AnimatedProjectGrid.tsx` (Task 8) — where ScrollReveal will be integrated. Cards are rendered in a grid; only cards beyond the first row should reveal.
  - `components/HomepageAtmosphere.tsx` — existing Intersection Observer pattern (uses position-based, but the principle is the same)

  **API/Type References**:
  - Framer Motion `motion.div` with `initial`, `whileInView`, `viewport` props: https://motion.dev/docs/animation#while-in-view

  **WHY Each Reference Matters**:
  - Framer Motion has built-in `whileInView` animation which handles IntersectionObserver internally — use this instead of manual observer

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/ScrollReveal.spec.tsx`
  - [ ] `npx vitest run tests/unit/projects/ScrollReveal.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Below-fold cards reveal on scroll
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Assert first row of cards is visible immediately (no animation delay)
      3. Scroll down slowly
      4. As second row comes into view, cards fade in + slide up
      5. Each subsequent row animates in with a stagger
      6. Scroll back up — cards remain visible (no exit animation)
    Expected Result: Scroll reveal creates depth as user scrolls, first row instant
    Failure Indicators: All cards animate on page load, no reveal on scroll, cards disappear on scroll-up
    Evidence: .sisyphus/evidence/task-13-scroll-reveal.png

  Scenario: Reduced-motion shows all cards immediately
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Use `page.emulateMedia({ reducedMotion: 'reduce' })`
      2. Navigate to `http://localhost:3001`
      3. Scroll down
      4. Assert all cards are immediately visible (no fade-in animation on scroll)
    Expected Result: No scroll animation with reduced motion, all cards visible immediately
    Failure Indicators: Cards still animate despite reduced motion
    Evidence: .sisyphus/evidence/task-13-scroll-reduced-motion.png
  ```

  **Commit**: YES (grouped with Wave 3)
  - Message: `feat(ui): add hero animations, card parallax, stats counter, and scroll reveal`
  - Files: `components/projects/ScrollReveal.tsx`, `components/projects/AnimatedProjectGrid.tsx`, `tests/unit/projects/ScrollReveal.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/projects/ScrollReveal.spec.tsx`

- [x] 14. Modal prev/next navigation + keyboard arrows

  **What to do**:
  - Write failing tests in `tests/unit/components/ProjectModal.spec.tsx` for:
    - Left arrow key navigates to previous project
    - Right arrow key navigates to next project
    - Navigation wraps around (last → first, first → last)
    - Previous/Next buttons are visible and labeled with project titles
    - Left/Right arrow buttons appear on left and right edges of modal
    - Escape key still closes the modal
  - Update `components/ProjectModal.tsx` to:
    - Accept `projects: Project[]` (full list) and `currentIndex: number` props
    - Render left/right navigation buttons (glassmorphism circles with ChevronLeft/ChevronRight icons)
    - Position nav buttons: absolute, centered vertically, on left/right edges of modal
    - Add keyboard handler for ←/→ arrow keys
    - Wrap: "Next" on last item goes to first, "Previous" on first item goes to last
    - Maintain focus trap (include nav buttons in the focusable elements list)
    - Update the `useSelectedProject` hook or `ProjectGallery` to pass full project list and manage current index
  - When navigating, close current modal and open next project's modal (using layout animation)

  **Must NOT do**:
  - Do not change the modal to a carousel/slider — it still opens/closes per project, just with navigation
  - Do not break the existing Escape key handler
  - Do not break the focus trap — nav buttons must be in the trap cycle

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1 for project type)
  - **Parallel Group**: Wave 4 start
  - **Blocks**: Task 15
  - **Blocked By**: Task 1 (project type inference needed for nav labels)

  **References**:

  **Pattern References**:
  - `components/ProjectModal.tsx:23-63` — existing focus trap implementation. Navigation buttons must be added to the `focusableElements` list.
  - `components/ProjectGallery.tsx` — currently manages `selectedProject` state. Must be updated to pass `projects` array and `currentIndex` to the modal.
  - `components/projects/useSelectedProject.ts` — existing hook for project selection. May need to support `next()` / `prev()` methods.

  **API/Type References**:
  - `types/index.ts:Project` — the Project type

  **Test References**:
  - Existing ProjectModal tests (if any)

  **WHY Each Reference Matters**:
  - The focus trap in `ProjectModal.tsx` is the most complex part — adding navigation buttons requires updating this trap
  - `useSelectedProject.ts` is the state management — extending it with prev/next is cleaner than adding new state

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/components/ProjectModal.spec.tsx`
  - [ ] `npx vitest run tests/unit/components/ProjectModal.spec.tsx` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Previous/Next navigation in modal
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Click on the first project card ("Idle Dungeon Crawler")
      3. Assert modal opens for "Idle Dungeon Crawler"
      4. Assert a "Next" button (right arrow) is visible on the right edge
      5. Click the "Next" button
      6. Assert modal updates to show the second project ("SpaceAutoBattler")
      7. Click "Next" until reaching the last project
      8. Click "Next" one more time
      9. Assert modal wraps around to the first project (Idle Dungeon Crawler)
      10. Click "Previous" button
      11. Assert modal shows the last project (wraps around backwards)
    Expected Result: Prev/Next navigation works smoothly with wrap-around
    Failure Indicators: No nav buttons, wrong project shown, no wrap-around, modal closes on nav
    Evidence: .sisyphus/evidence/task-14-modal-nav.png

  Scenario: Keyboard arrow navigation
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Click on any project card to open modal
      3. Press Right Arrow key
      4. Assert modal shows next project
      5. Press Left Arrow key
      6. Assert modal shows previous project
      7. Press Escape
      8. Assert modal closes
    Expected Result: Arrow keys navigate, Escape closes
    Failure Indicators: Arrow keys don't work, Escape also navigates instead of closing
    Evidence: .sisyphus/evidence/task-14-modal-keyboard.png

  Scenario: Focus trap includes nav buttons
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Click on a project card to open modal
      3. Press Tab key multiple times
      4. Assert focus cycles through: close button → nav buttons → action links → back to close button
      5. Assert focus never escapes the modal
    Expected Result: Focus trap includes all interactive elements
    Failure Indicators: Focus escapes modal, nav buttons not in trap cycle
    Evidence: .sisyphus/evidence/task-14-focus-trap.txt
  ```

  **Commit**: YES (grouped with Wave 4)
  - Message: `feat(ui): redesign modal with prev/next nav, type badges, and layout improvements`
  - Files: `components/ProjectModal.tsx`, `components/ProjectGallery.tsx`, `components/projects/useSelectedProject.ts`, `tests/unit/components/ProjectModal.spec.tsx`
  - Pre-commit: `npx vitest run tests/unit/components/ProjectModal.spec.tsx`

- [x] 15. Modal layout reorganization + type badge + smart description

  **What to do**:
  - Update `components/ProjectModal.tsx` layout to:
    1. **Header zone**: Project title + `ProjectTypeBadge` (from Task 4) + featured star indicator (if `is_featured`)
    2. **Stats bar**: GitHub stats (stars, forks, last updated) in a horizontal strip with subtle icon backgrounds instead of tiny mono text
    3. **Smart description**: Strip redundant title prefix — if `short_description` starts with the project `title`, remove the title portion
    4. **Action buttons**: Move "Play / Demo" and "View Code" to the top-right section of the modal (not buried at the bottom)
    5. **Tags section**: Keep existing tag display but use `modal` variant styling
  - Improve GitHub stats display:
    - Current: tiny mono text. New: icon + number in a horizontal stats bar with subtle background pills
    - Make `GitHubStatsDisplay` render as a horizontal flex strip, not just inline text
    - Each stat (stars, forks, last updated) in its own small pill/chip style
  - Implement smart description stripping:
    - Create `utils/projects/description.ts` with `stripTitlePrefix(title, description)` function
    - If `description` starts with `title` (case-insensitive), remove the title and any following colon/space
    - Example: `("Idle Dungeon Crawler", "Idle Dungeon Crawler - A browser-based RPG")` → `"A browser-based RPG"`
    - Example: `("React App", "A standalone tool")` → `"A standalone tool"` (no prefix, pass through)

  **Must NOT do**:
  - Do not remove any existing modal content (image, description, tags, links)
  - Do not change the modal's backdrop blur or animation
  - Do not hide zero-value GitHub stats — show them but with muted styling

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-dev`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 4, 14)
  - **Parallel Group**: Wave 4 end
  - **Blocks**: F3
  - **Blocked By**: Tasks 4 (ProjectTypeBadge), 14 (modal prev/next nav)

  **References**:

  **Pattern References**:
  - `components/ProjectModal.tsx` — the complete modal component to reorganize. Current layout: image → title+stats → description → tags → action buttons (at bottom).
  - `components/GitHubStats.tsx:58-73` — current stats rendering. Lines 59-73 show the tiny mono text format.
  - `components/projects/ProjectActions.tsx:8-35` — "Play / Demo" and "View Code" buttons currently at the bottom.
  - `components/projects/ProjectTags.tsx` — existing tag component with `modal` variant.

  **API/Type References**:
  - `utils/projects/projectType.ts` (Task 1) — `inferProjectType(tags)` for type badge
  - `components/projects/ProjectTypeBadge.tsx` (Task 4) — the badge component to use

  **WHY Each Reference Matters**:
  - `ProjectModal.tsx` is the main file being modified — need to know current layout structure
  - `GitHubStats.tsx` needs visual enhancement — understand current rendering to improve it
  - `ProjectActions.tsx` will be repositioned — currently at bottom, moving closer to top

  **Acceptance Criteria**:

  **If TDD:**
  - [ ] Test file created: `tests/unit/projects/description.spec.ts`
  - [ ] `npx vitest run tests/unit/projects/description.spec.ts` → PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Modal shows project type badge and reorganized layout
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Click on "Idle Dungeon Crawler" (which has "React" tag → inferred as "Other" type, or "Game" if game-tagged)
      3. Assert a project type badge (e.g., "Game" or "Other") is visible near the title
      4. Assert GitHub stats are in a horizontal strip with icon pills (not mono text)
      5. Assert "Play / Demo" and "View Code" buttons are visible near the top of the modal
      6. Assert tags are still displayed below the description
    Expected Result: Reorganized layout with type badge, enhanced stats, buttons near top
    Failure Indicators: Old layout unchanged, type badge missing, buttons still at bottom
    Evidence: .sisyphus/evidence/task-15-modal-layout.png

  Scenario: Smart description strips redundant title prefix
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Click on a project where short_description starts with the title (e.g., "Idle Dungeon Crawler: A browser-based RPG")
      3. Assert the description does NOT repeat the project title
      4. Click on a project where the description doesn't start with the title
      5. Assert the full description is shown unchanged
    Expected Result: Descriptions are clean — no redundant title prefix
    Failure Indicators: Description starts with the project title, or description is truncated incorrectly
    Evidence: .sisyphus/evidence/task-15-smart-description.png

  Scenario: Featured projects show star indicator
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Find a featured project (is_featured = true)
      3. Click on it to open the modal
      4. Assert a featured star/badge indicator is visible in the modal header
    Expected Result: Featured projects have a visual star indicator
    Failure Indicators: No star for featured projects, star shown for non-featured
    Evidence: .sisyphus/evidence/task-15-featured-indicator.png
  ```

  **Commit**: YES (grouped with Wave 4)
  - Message: `feat(ui): redesign modal with prev/next nav, type badges, and layout improvements`
  - Files: `components/ProjectModal.tsx`, `components/GitHubStats.tsx`, `components/projects/ProjectActions.tsx`, `utils/projects/description.ts`, `tests/unit/projects/description.spec.ts`
  - Pre-commit: `npm run typecheck && npx vitest run tests/unit/projects/description.spec.ts`

- [x] 16. Modal close button fix (move to container)

  **What to do**:
  - In `components/ProjectModal.tsx`, move the close button (`×`) from overlaid on the image to the top-right corner of the modal **container** (not on the image)
  - Style: glassmorphism circle with consistent visibility against any background (light or dark screenshots)
  - Position: `absolute top-4 right-4` on the modal container `div`, not on the image wrapper
  - Ensure focus trap includes the close button
  - Ensure keyboard focus is set to the close button when modal opens (existing behavior — preserve it)

  **Must NOT do**:
  - Do not change the modal backdrop or animation
  - Do not change the modal content layout beyond the close button position
  - Do not use a different icon — keep the `X` from lucide-react

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 14, 15)
  - **Blocks**: F3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/ProjectModal.tsx` — current modal implementation. The close button is positioned on the image area. Move it to the modal container's top-right corner.
  - `app/globals.css:45-51` — `.glass-panel` glassmorphism style to match the close button design.

  **WHY Each Reference Matters**:
  - The close button position is defined in `ProjectModal.tsx` — need to find and reposition it
  - `.glass-panel` is the established visual pattern for overlay elements

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Close button is visible on any image background
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3001`
      2. Click on any project card to open modal
      3. Assert the × close button is in the top-right corner of the modal (not overlaid on the image)
      4. Assert the button has a visible background (glassmorphism or solid) that makes it visible against both light and dark images
      5. Click the × button
      6. Assert modal closes
    Expected Result: Close button always visible, positioned at modal container corner, not on image
    Failure Indicators: Button blends into image, button in wrong position, button not visible
    Evidence: .sisyphus/evidence/task-16-close-button.png
  ```

  **Commit**: YES (grouped with Wave 4)
  - Message: `feat(ui): redesign modal with prev/next nav, type badges, and layout improvements`
  - Files: `components/ProjectModal.tsx`
  - Pre-commit: `npm run typecheck`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback → fix → re-run → present again → wait for okay.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run check` (test + lint + typecheck). Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (filter then modal, animations then filter, etc.). Test edge cases: empty filter, all tags, rapid clicking, keyboard nav. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(ui): add tag inference, filter hooks, badges, and reduced-motion utilities` — multiple files
- **Wave 2**: `feat(ui): add tag filter bar and animated project grid with URL sync` — FilterBar, AnimatedGrid, ProjectGallery
- **Wave 3**: `feat(ui): add hero animations, card parallax, stats counter, and scroll reveal` — HeroHeaderClient, AnimatedCard, StatsCounter, ScrollReveal
- **Wave 4**: `feat(ui): redesign modal with prev/next nav, type badges, and layout improvements` — ProjectModal

---

## Success Criteria

### Verification Commands
```bash
npm run check              # Expected: all pass (lint, typecheck, tests)
npm run build              # Expected: successful production build
npx vitest run             # Expected: all tests pass
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] `npm run build` succeeds
- [ ] No `as any` or `@ts-ignore` in new code
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Filter URL params work: `/projects?tag=react` loads filtered
- [ ] Modal keyboard navigation works (←/→/Escape)
- [ ] No changes to admin dashboard files