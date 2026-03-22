# Agent guide (RepoHub)

RepoHub is a Next.js (App Router) project gallery + admin dashboard backed by Supabase (Postgres/Auth/Storage).

## Essentials (read this first)

- **Package manager:** npm
- **How to run locally:** `npm run dev`
- **Quality gates (recommended before PRs):** `npm run test && npm run lint && npm run typecheck` and `npm run build`
  - Shortcut: `npm run check`
- **Sources of truth:** start in `docs/agents/README.md`, then follow the links to the canonical guides.

## More detailed guidance

- `docs/agents/README.md` (index)
- `docs/agents/sources-of-truth.md`
- `docs/agents/repo-conventions.md`
- `docs/agents/workflow-and-memory.md`
- `docs/agents/local-dev-and-quality-gates.md`
- `docs/agents/findings-and-learnings.md`

## Open questions

`docs/agents/open-questions.md` now tracks only active documentation drift or unresolved follow-ups.

## Learning loop

When a major fix, refactor, performance improvement, security hardening, or docs/code alignment happens, update the relevant docs in the same pass.

- If the change establishes a durable lesson, add it to `docs/agents/findings-and-learnings.md`.
- If the change updates how the repo should be worked in, update the relevant guide in `docs/agents/`.
- If docs are corrected because code drifted, verify the code path too rather than only editing prose.

## Learning Moment ⚡

During a recent change to adopt WebGPU with an automatic WebGL fallback we hit two important problems worth noting:

- **Build-time network dependency (fonts):** Next/Turbopack attempted to fetch Google Fonts during `next build` which failed with a Rust/hyper error (`http2 feature is not enabled`). Fix: remove `next/font/google` usage from `app/layout.tsx`, add safe CSS font fallbacks in `app/globals.css` (or bundle fonts locally). This makes builds deterministic in CI and local environments.

- **Renderer initialization (runtime):** `WebGPURenderer` requires `await renderer.init()` before use. If you call `.render()` before initialization you'll get: ".render() called before the backend is initialized." Fix: in `components/WebGPUCanvas.tsx` the `gl` factory now awaits `init()` when present, supports both constructor/factory shapes, and gracefully falls back to a deterministic legacy renderer (imported from `three/src/renderers/WebGLRenderer.js`) to avoid r3f deprecation warnings.

What we added:

- Tests: `tests/components/WebGPUCanvas.spec.tsx` (ensures fallback to WebGL when WebGPU is absent) and `tests/components/WebGPUCanvas.init.spec.tsx` (verifies `WebGPURenderer.init()` is called).
- A short comment in `WebGPUCanvas.tsx` documenting why we await `init()` and the fallback rationale.

Why this matters:

- Prevents flaky builds caused by network fetches during production builds.
- Ensures deterministic renderer behavior and avoids runtime crashes in browsers/CI that lack WebGPU or when renderer initialization is async.

Suggested follow-ups:

- When Three exposes a canonical `/legacy` entry for renderers, prefer that over importing `three/src/...`.

---
