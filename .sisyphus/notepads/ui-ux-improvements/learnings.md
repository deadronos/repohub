
## Tag Extraction + Project Type Inference (Wave 1)

### Files Created/Modified
- `tests/unit/projects/projectType.spec.ts` — TDD test file (14 tests)
- `utils/projects/projectType.ts` — `inferProjectType()`, `PROJECT_TYPE_RULES`, `ProjectType` type
- `utils/projects/tags.ts` — added `extractAllTags()` + `TagCount` interface

### Patterns Used
- `normalizeTags()` already handles null/undefined filtering
- `extractAllTags()` uses Map for O(n) counting + `localeCompare()` for alphabetical sort
- `inferProjectType()` uses priority order (Game > Tool > Experiment > Other)
- Case-insensitive tag matching via `toLowerCase()` on both tag and keywords

### Key Implementation Details
- `PROJECT_TYPE_RULES` exported as `Record<ProjectType, string[]>` for testability
- `ProjectTagsInput = string[] | null | undefined` type reused from tags.ts
- `inferType()` is private helper, `inferProjectType()` normalizes before calling it

### Verification
- `npx vitest run tests/unit/projects/projectType.spec.ts` — 14 passed

## HeroHeader topTag Fix (Task 9)

### Problem
The `<dd>` element for "Top tag" in HeroHeader rendered empty or had display issues in production. The `topTag` prop was being passed correctly from `page.tsx` (line 35), which computes it as the most frequent tag or falls back to "Open source".

### Root Cause
The tag was rendered as-is without proper casing. `formatTagLabel()` from `utils/projects/tags.ts` should be used to capitalize the first letter. Additionally, the fallback handling needed to handle empty/whitespace strings properly.

### Fix Applied to `components/HeroHeader.tsx`
1. Added import: `import { formatTagLabel } from '@/utils/projects/tags';`
2. Changed the `<dd>` rendering from `{topTag}` to:
   ```tsx
   {topTag.trim() ? formatTagLabel(topTag) : 'Open source'}
   ```
   - Uses `formatTagLabel()` for proper "React" → "React" (not "REACT")
   - Falls back to "Open source" when topTag is empty or whitespace
   - Note: `page.tsx` already provides "Open source" as default, but this guards against empty strings

### Test File Created
`tests/unit/components/HeroHeader.spec.tsx` — 4 tests:
- Renders top tag value
- Applies proper casing via formatTagLabel ("typeScript" → "TypeScript")
- Falls back to "Open source" when topTag is empty string
- Falls back to "Open source" when topTag is whitespace only

### Verification
- `npx vitest run tests/unit/components/HeroHeader.spec.tsx` — 4 passed
- `npx vitest run tests/components/HeroHeader.spec.tsx` — 5 passed (existing tests still work)
- `npm run build` — success (TypeScript compiled, static pages generated)
- `lsp_diagnostics` on HeroHeader.tsx — no errors

## Filter State Hook + URL Sync Hook (Task 6)

### Files Created
- `tests/unit/hooks/useFilter.spec.tsx` — TDD test file (26 tests)
- `components/projects/useFilterState.ts` — filter state management hook
- `components/projects/useFilterSync.ts` — URL param sync hook

### Patterns Used
- Hook pattern: `useState` + `useMemo` + memoized return object (matching `useSelectedProject.ts`)
- TDD approach: tests first (RED), then implementation (GREEN)
- Debouncing: `useRef<ReturnType<typeof setTimeout>>` for cleanup

### useFilterState Implementation
- `activeTags: Set<string>` — OR logic (project matches if it has ANY active tag)
- `searchQuery` (debounced 300ms) — case-insensitive match on title + short_description + description
- Combined: both conditions must match (activeTags AND searchQuery)
- `clearFilters()` cancels any pending debounce via `clearTimeout()`

### useFilterSync Implementation
- Uses `useSearchParams`, `useRouter`, `usePathname` from `next/navigation`
- On mount: reads `?tag=react&tag=three.js` from URL, validates against `allProjectTags`, calls `onTagsChange` with valid tags
- On activeTags change: writes to URL as `?tag=react&tag=three.js`
- On clear: removes tag params from URL by deleting all 'tag' keys then adding back only valid ones
- Invalid/unknown tags in URL are silently ignored (not added to validTags Set)

### Testing Notes
- Fake timers via `vi.useFakeTimers()` + `vi.useRealTimers()` for debounce testing
- Tests verify debounce behavior, OR tag logic, combined filtering
- Memoization tests verify `result.current` object identity preserved when state unchanged

### Important: useSearchParams requires Suspense boundary
- `useSearchParams()` from `next/navigation` requires wrapping component in `<Suspense>`
- This is documented in useFilterSync.ts comments
- When integrating in Task 7/9, wrap FilterBar or page component that uses these hooks

### Verification
- `npx vitest run tests/unit/hooks/useFilter.spec.tsx` — 26 passed
- `npm run typecheck` — no errors

## FilterBar Component (Task 8)

### Files Created
- `tests/unit/projects/FilterBar.spec.tsx` — TDD test file (15 tests)
- `components/projects/FilterBar.tsx` — filter bar presentational component

### Patterns Used
- TDD: wrote 15 failing tests first (RED), then implemented component (GREEN)
- Pure presentational component: all state passed via props, no hooks internal to component
- `extractAllTags(projects)` for tag counting + alphabetical sorting (reused from tags.ts)
- `formatTagLabel(tag)` for display casing
- Tailwind class composition with constants for active/inactive pill states
- `data-testid="search-icon"` on lucide Search icon for testability

### Props Interface
```ts
type FilterBarProps = {
  projects: Project[];
  activeTags: Set<string>;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};
```

### Styling Details
- Glassmorphism bar: `glass-panel` + `border-white/10` + `shadow-[0_0_40px_rgba(2,8,23,0.45)]`
- Active pill: `bg-cyan-500/20 border-cyan-500 text-cyan-200`
- Inactive pill: `bg-zinc-800/40 border-zinc-700/50 text-zinc-400`
- Search input: `bg-white/[0.03]` + `backdrop-blur-sm` + focus ring `focus:ring-cyan-500/20`
- Responsive: horizontal scroll via `overflow-x-auto scrollbar-hide` on pill container, search stays fixed

### Key Behaviors
- "All" pill is active when `activeTags.size === 0`
- Clicking "All" calls `clearFilters()`
- Tag pills show `formatTagLabel(tag) + (count)`
- Search input is controlled, calls `setSearchQuery` on change (debounce handled by parent `useFilterState`)
- Handles `null`/`undefined` tags gracefully via `extractAllTags()` which uses `normalizeTags()` internally

### Verification
- `npx vitest run tests/unit/projects/FilterBar.spec.tsx` — 15 passed
- `npx vitest run tests/unit/projects/` — 90 passed (all project tests)
- `npm run typecheck` — no errors
- `lsp_diagnostics` on FilterBar.tsx and spec file — zero errors
