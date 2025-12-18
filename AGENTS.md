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

## Repo conventions that matter

- Server fetch patterns: use `createClient()` from `utils/supabase/server.ts` in server components (e.g., `app/page.tsx`, `app/admin/page.tsx`).
- Auth gating: `middleware.ts` delegates to `utils/supabase/middleware.ts`; do not insert logic between `createServerClient()` and `supabase.auth.getUser()`.
- Mutations: prefer Next Server Actions in `app/actions.ts` and keep cache invalidation consistent with current behavior.

## Local workflows

- Run: `npm run dev`
- Validate: `npm run lint`, `npm run build`

## When unsure

- Prefer updating/adding a short note in `/memory/activeContext.md` explaining what you discovered and what you changed.
