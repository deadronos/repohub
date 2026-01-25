# Local dev and quality gates

## Local workflows

- Run: `npm run dev`
- Validate (canonical):
  - `npm run test`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`

Shortcut: `npm run check` (runs test + lint + typecheck).

## Handoff & quality checklist

Before creating a PR or handing work off:

- **Prefer strict typing:** ensure `tsconfig.json` has `"strict": true` and prefer explicit types over `any`.
- **Add tests:** add unit tests for new logic under `tests/` (Vitest). Tests should be deterministic.
- **Run checks:** confirm `npm run check` passes (or run `npm run test`, `npm run lint`, `npm run typecheck` individually).
- **Build:** confirm `npm run build` passes.

- **Avoid build-time network dependencies:** Do not rely on fetching external resources (for example, Google Fonts via `next/font/google`) during `next build` since bundlers (Turbopack/Next) may attempt HTTP/2 fetches at build-time which can fail in CI or certain environments. Prefer bundling fonts locally (use `next/font/local` or place font files in `public/`) or provide safe CSS fallbacks so builds are deterministic and offline-capable.

- **Document changes:** update `/memory/` (e.g., `memory/activeContext.md` or a task file) with behavior changes and validation steps.
- **Explain type choices:** if you intentionally use `any` or loosen strictness, justify it and add a follow-up task to tighten types later.
