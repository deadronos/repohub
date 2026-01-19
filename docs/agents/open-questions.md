# Open questions (doc conflicts / contradictions)

This file tracks contradictions found while refactoring `AGENTS.md` for progressive disclosure.

## Status

Resolved on 2026-01-19:

- Testing: Vitest is set up and should be used.
- Canonical validation: `npm run test && npm run lint && npm run typecheck` (or `npm run check`) plus `npm run build`.
- Server Actions: folder-based layout `app/actions/*` is canonical.

## 1) Testing: "no test runner" vs Vitest scripts

### Conflict (testing)

- `.github/copilot-instructions.md` says: "No test runner is set up in this repo currently."
- `package.json` contains Vitest scripts (`npm run test`, `npm run test:coverage`) and the repo has `tests/`.

### Decision (testing)

✅ Update `.github/copilot-instructions.md` to reflect reality (Vitest exists and should be used).

## 2) Validation commands: lint+build vs check+build

### Conflict (validation commands)

- `.github/copilot-instructions.md` says: Validate with `npm run lint` and `npm run build`.
- `AGENTS.md` (and `package.json`) supports a stronger gate: `npm run check` (test + lint + typecheck) and `npm run build`.

### Decision (validation commands)

✅ Canonical validation = `npm run test && npm run lint && npm run typecheck` (or `npm run check`) + `npm run build`.

## 3) Server Actions location: `app/actions.ts` vs `app/actions/*`

### Conflict (Server Actions location)

- `.github/copilot-instructions.md` references Server Actions in `app/actions.ts`.
- The workspace uses an `app/actions/` folder (e.g., `app/actions/auth.ts`, `app/actions/projects.ts`).

### Decision (Server Actions location)

✅ Update docs to point to the folder-based layout (`app/actions/*`).
