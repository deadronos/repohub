# Agent docs (index)

This folder provides progressively disclosed guidance for agents and contributors working in RepoHub.

Status: reviewed and aligned with the current codebase on 2026-03-22.

## Read in this order

1. `sources-of-truth.md` — what is canonical when docs and code disagree.
1. `repo-conventions.md` — current Next.js, Supabase, caching, admin, and UI patterns.
1. `workflow-and-memory.md` — how this repo uses `memory/` and how that differs from Copilot memory.
1. `local-dev-and-quality-gates.md` — local setup, validation commands, and handoff expectations.

## Supporting files

- `open-questions.md` — only for active documentation drift or unresolved follow-ups.
- `findings-and-learnings.md` — durable lessons from fixes, refactors, and docs/code alignment work.
- `deletion-candidates.md` — cleanup backlog for agent docs. Non-normative.

## Scope of this folder

These files are a convenience layer for progressive disclosure.

If anything here disagrees with the live code, trust the sources listed in `sources-of-truth.md` and update this folder to match.

Major repo changes should usually leave a doc trace here too: update the relevant guide, add a durable lesson to `findings-and-learnings.md`, or record unresolved drift in `open-questions.md`.
