# Agent guidance (RepoHub)

This repo is designed to be worked on by AI coding agents and humans. Before making changes, read and follow these sources of truth.

## Required reading

- `.github/copilot-instructions.md`
  - Codebase-specific patterns (Next.js App Router + Supabase SSR, route protection, Server Actions, storage uploads).
- `.github/instructions/`
  - Contains additional guardrails (linting, TypeScript, markdown rules, security, etc.).
- `.github/instructions/memory-bank.instructions.md`
  - How to use `/memory` to persist project context, designs, and task tracking.
- `.github/instructions/spec-driven-workflow-v1.instructions.md`
  - Follow: Analyze → Design → Implement → Validate → Reflect → Handoff.

## How we document work

- Long-lived context lives in `/memory/`.
  - Requirements: `memory/requirements.md`
  - Designs: `memory/designs/DES###-*.md`
  - Tasks: `memory/tasks/_index.md` and `memory/tasks/TASK###-*.md`

- Schedule or recommend to update documentation in the /memory folder as part of your work.

## Repo conventions that matter

- Server fetch patterns: use `createClient()` from `utils/supabase/server.ts` in server components (e.g., `app/page.tsx`, `app/admin/page.tsx`).
- Auth gating: `middleware.ts` delegates to `utils/supabase/middleware.ts`; do not insert logic between `createServerClient()` and `supabase.auth.getUser()`.
- Mutations: prefer Next Server Actions in `app/actions.ts` and keep cache invalidation consistent with current behavior.

## Local workflows

- Run: `npm run dev`
- Validate: `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` (or run `npm run check` to run the first three in sequence)

### Handoff & quality checklist

Before creating a PR or handing work off, follow this checklist:

- **Prefer strict typing:** ensure `tsconfig.json` has `"strict": true` and prefer explicit types over `any`. Keep public APIs and new modules well-typed and add/adjust types in `types/index.ts` or nearby files.
- **Add tests:** add unit tests for new logic under `tests/` using Vitest. Tests should be deterministic and run with `npm run test`.
- **Run checks:** confirm `npm run test`, `npm run lint`, and `npm run typecheck` all pass locally (or run `npm run check`).
- **Document changes:** update `/memory/` (e.g., `memory/activeContext.md` or create a `memory/tasks/TASK###-*.md`) with short notes about behavior changes and validation steps.
- **Explain type choices:** if you intentionally use `any` or loosen strictness, add a brief justification and a follow-up task to tighten types later.

## When unsure

- Prefer updating/adding a short note in `/memory/activeContext.md` explaining what you discovered and what you changed.
