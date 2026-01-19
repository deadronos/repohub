# Agent docs (index)

This folder provides progressively-disclosed guidance for agents and humans working in this repository.

## Start here

- **Sources of truth:** `sources-of-truth.md`
- **Repo-specific conventions (Supabase + Next.js):** `repo-conventions.md`
- **Workflow + how to use `/memory`:** `workflow-and-memory.md`
- **Local dev & validation commands:** `local-dev-and-quality-gates.md`

## Known doc conflicts

Some instructions conflict across docs. Track and resolve these before doing broader cleanup:

- `open-questions.md`

## Suggested `docs/` structure

This repo already uses `docs/` for documentation. Suggested structure going forward:

- `docs/agents/` — instructions for agents and contributors (this folder)
  - `README.md` — index
  - `sources-of-truth.md` — canonical references
  - `repo-conventions.md` — Next.js/Supabase patterns to follow
  - `workflow-and-memory.md` — spec-driven loop + Memory Bank usage
  - `local-dev-and-quality-gates.md` — commands, validation checklist
  - `open-questions.md` — contradictions to resolve
  - `deletion-candidates.md` — items to remove or rewrite
- `docs/architecture/` — architecture notes and diagrams
- `docs/runbooks/` — operational runbooks (Supabase, deployments, etc.)
- `docs/decisions/` — ADRs / decision records
