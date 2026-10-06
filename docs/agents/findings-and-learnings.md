# Findings and learnings

## 2026-05-11: Admin and ordering hardening

- Public homepage data should stay on `getCachedProjects()` so the documented cache/revalidation path is used.
- Admin access has two allowlists: `ADMIN_EMAILS` and `public.admin_emails`. Server-side admin checks now validate both, using the `public.is_admin_email()` RPC for the active Supabase session.
- Project creation must clean up any newly uploaded image if a later create step fails before the database insert.
- Project ordering slots are reserved by `projects_sort_order_seq`; avoid reintroducing `max(sort_order) + 1` because concurrent creates can collide.

Use this file to capture durable lessons discovered while fixing bugs, aligning docs with code, tightening security, improving performance, or clarifying workflows.

This file is for lessons that should change how future contributors work in RepoHub.

## When to update it

Add or update an entry when a change reveals something non-obvious and reusable, such as:

- a bug pattern that is easy to reintroduce
- a fragile integration or build constraint
- a performance trap worth avoiding
- a security or authorization gotcha
- a docs/code mismatch that caused confusion and is likely to happen again

## When not to use it

- Do not use this file for active contradictions. Put those in `open-questions.md`.
- Do not use this file for one-off task notes. Put those in `memory/`.
- Do not duplicate the full changelog. Keep entries short and action-oriented.

## Entry format

For each learning, capture:

- **Finding:** what was discovered
- **Why it matters:** the risk or impact
- **What changed:** the fix or policy now in place
- **Where it lives:** key files or systems involved
- **Follow-up:** optional next step if the work is incomplete

## Working rule

When a major code change happens, expect at least one documentation touch in the same pass:

- update a canonical guide in `docs/agents/`
- add a durable lesson here
- or do both when the change is significant

When a major docs correction happens, verify the corresponding code or config before closing the loop.

## Current learnings

### Build-time external font fetches make builds flaky

- **Finding:** Using `next/font/google` can cause build-time network fetches that fail in CI or constrained environments.
- **Why it matters:** A healthy codebase can still fail `next build` for reasons unrelated to app logic.
- **What changed:** Prefer local fonts or CSS fallbacks so builds stay deterministic.
- **Where it lives:** `AGENTS.md`, `docs/agents/local-dev-and-quality-gates.md`, `app/globals.css`, `app/layout.tsx`

### WebGPU renderers must be initialized before first render

- **Finding:** `WebGPURenderer` requires `await renderer.init()` before use.
- **Why it matters:** Rendering before initialization causes runtime failures that only show up in specific environments.
- **What changed:** The runtime now awaits initialization when present and falls back to WebGL deterministically.
- **Where it lives:** `AGENTS.md`, `components/WebGPUCanvas.tsx`, `tests/components/WebGPUCanvas.spec.tsx`, `tests/components/WebGPUCanvas.init.spec.tsx`

### Admin allowlists must stay synchronized across app code and RLS

- **Finding:** App-side admin checks and database-side RLS can drift if they are maintained separately.
- **Why it matters:** Auth can appear correct in the UI while DB policies still deny or allow the wrong operations.
- **What changed:** Agent docs now explicitly require keeping `ADMIN_EMAILS` and the inline allowlist in `supabase/schema.sql` synchronized.
- **Where it lives:** `docs/agents/repo-conventions.md`, `docs/agents/local-dev-and-quality-gates.md`, `supabase/schema.sql`, `utils/supabase/admin.ts`

### Heavy per-card async work degrades the project grid quickly

- **Finding:** Fetching extra data for every visible card adds unnecessary client/server fan-out.
- **Why it matters:** The gallery may still work functionally while feeling slower and becoming more expensive to render.
- **What changed:** GitHub stats are treated as on-demand modal content rather than default per-card content.
- **Where it lives:** `docs/agents/repo-conventions.md`, `components/ProjectModal.tsx`, `components/ProjectCard.tsx`, `components/GitHubStats.tsx`

### Prefer useCallback over useRef for stable callback references in hooks

- **Finding:** Using a ref to track the latest callback (with double-useEffect pattern) works but adds unnecessary indirection.
- **Why it matters:** A single `useCallback` with proper dependency tracking is idiomatic, clearer, and triggers fewer re-renders when the callback changes intentionally.
- **What changed:** `useEscapeKey` was refactored to use `useCallback` instead of the ref-to-current pattern.
- **Where it lives:** `utils/hooks/useEscapeKey.ts`, `tests/unit/hooks/useEscapeKey.spec.ts`

### Accessibility: aria-live regions for dynamic feedback messages

- **Finding:** Dynamic feedback messages without `aria-live` are invisible to screen readers.
- **Why it matters:** Users relying on assistive technology may miss important error or warning states.
- **What changed:** Added `role="alert" aria-live="polite"` to feedback containers in AdminDashboard.
- **Where it lives:** `components/AdminDashboard.tsx`

### Sync-with-prop state should use the "compare and set during render" pattern

- **Finding:** `eslint-plugin-react-hooks` flags synchronous `setState` calls inside `useEffect` (the `react-hooks/set-state-in-effect` rule) when the call exists only to mirror a prop into state.
- **Why it matters:** Treating "sync to prop" with a side-effect causes a redundant render pass and trips a default error from a rule that is now part of the default Next.js lint config. It also leads to flashes of stale state on first render.
- **What changed:** Both `AdminDashboard` (project list prop) and `GitHubStats` (repo URL prop) now derive state from the prop during render by comparing against a `lastX` snapshot, and initialize dependent state from the prop directly (e.g. `useState(!!repoUrl)`) so the first render is correct without an effect.
- **Where it lives:** `components/AdminDashboard.tsx`, `components/GitHubStats.tsx`, `docs/agents/findings-and-learnings.md`

### Dependency updates: some majors must wait for the rest of the toolchain

- **Finding:** As of the 2026-10-06 upgrade pass, two majors cannot be adopted because first-party tooling still pins an older peer range. `eslint-config-next@16.3.8` bundles `eslint-plugin-react@7.37.5` (peer `eslint '^3 || … || ^9.7'`), which crashes under ESLint 10 with `contextOrFilename.getFilename is not a function`. `typescript-eslint@8.71.1` (the latest release) peers `typescript >=4.8.4 <6.1.0`, so TypeScript 7 cannot be installed without `--legacy-peer-deps`.
- **Why it matters:** Major bumps cannot be treated as independent; a single plugin's peer range can force the whole toolchain to wait. Forcing the install with `--legacy-peer-deps` yields a broken lint/typecheck rather than a fix.
- **What changed:** ESLint stays on 9.x (`^9.39.5`) and TypeScript stays on 6.x (`^6.0.3`) while every other dependency moved to its latest release. Re-test ESLint 10 and TypeScript 7 after `eslint-config-next` and `typescript-eslint` publish compatible peer ranges.
- **Where it lives:** `package.json`, `eslint.config.mjs`
- **Follow-up:** Watch `eslint-plugin-react` for an ESLint 10-compatible release and `typescript-eslint` for a TypeScript 7-compatible peer range.

### @testing-library/jest-dom v7 needs the Vitest-specific entrypoint

- **Finding:** In `@testing-library/jest-dom@7`, the bare `@testing-library/jest-dom` entrypoint only augments Jest's globals, so Vitest no longer sees the matcher types. `tsc` fails with `Property 'toBeInTheDocument' does not exist on type 'Assertion<…>'` even though the runtime matchers still work.
- **Why it matters:** The matchers keep passing at runtime while type-checking fails, which is an easy failure to misread as a missing dependency.
- **What changed:** Test setup imports `@testing-library/jest-dom/vitest` instead of the bare package.
- **Where it lives:** `tests/setup.ts`

### Vitest 5 + stricter type-aware lint surfaced unbound-method references

- **Finding:** The dependency bump enabled `@typescript-eslint/unbound-method` (part of `recommendedTypeChecked`) to flag two test references to DOM methods used as values (`window.requestIdleCallback`, `window.matchMedia`).
- **Why it matters:** Reading a method off an object without calling or binding it can silently detach `this`; the rule is a real correctness guard even in tests.
- **What changed:** Capture the `vi.fn()` mock in a local instead of reading `window.requestIdleCallback`, and snapshot `window.matchMedia` with `.bind(window)` for restoration.
- **Where it lives:** `tests/components/ParticleBackgroundLazy.spec.tsx`, `tests/unit/projects/StatsCounter.spec.tsx`

### `npm ci` needs an npm at least as new as the one that wrote the lockfile

- **Finding:** A `package-lock.json` written by npm 12 failed `npm ci` under Node 20's npm 10 with `Missing: typescript@5.9.3 from lock file`. The real cause was an _optional_ peer dependency (`tsconfck` → `typescript@^5.0.0`) that npm 12 skips but npm 10 tries to satisfy. npm 11 and npm 12 both accepted the same lockfile unchanged.
- **Why it matters:** CI can fail before any project code runs even though `npm install`/`npm ci` succeed locally, and the error names an unrelated package.
- **What changed:** CI now uses Node 24.x (npm 11) instead of 20.x, and `package.json` `engines.node` moved to `>=22.22.2` to match the Vitest 5 / jsdom 30 requirement. Keep CI's Node major at or above the npm that generated the lockfile.
- **Where it lives:** `.github/workflows/ci.yml`, `package.json`
- **Follow-up:** After bumping Node/npm locally, run `npm ci` (not just `npm install`) before pushing to catch lockfile/npm drift early.

### Deployment is via Vercel; the GitHub Pages workflow was dead scaffold

- **Finding:** `.github/workflows/deploy-pages.yml` came from the initial scaffold, never ran, targeted GitHub Pages (which was never enabled for the repo), and uploaded a `./dist` directory that `next build` never produces. The app is a full SSR Next.js app with dynamic routes and middleware, so it could not be hosted on Pages without a static export anyway.
- **Why it matters:** A registered-but-broken deploy workflow grants `pages: write` / `id-token: write` and only fails when it finally fires, which is easy to overlook.
- **What changed:** Removed the workflow. Vercel is the deploy path (status checks on PRs, `@vercel/analytics`).
- **Where it lives:** `.github/workflows/`, `next.config.ts`, `package.json`
