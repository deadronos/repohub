# Open questions

As of 2026-03-22, there are no known active contradictions inside `docs/agents/`.

## How to use this file

Only add entries here when there is an unresolved mismatch between:

- the live codebase
- `.github/copilot-instructions.md`
- `AGENTS.md`
- `docs/agents/*.md`
- `README.md`

For each new issue, record:

- the files that disagree
- the concrete conflicting statements
- the current best source of truth
- the follow-up needed to resolve the drift

## Recently resolved drift

- Vitest is the project test runner.
- Canonical validation is `npm run test && npm run lint && npm run typecheck` (or `npm run check`) plus `npm run build`.
- Server Actions live in `app/actions/*`.
- The admin allowlist in the app and the inline allowlist in `supabase/schema.sql` must be kept in sync.
