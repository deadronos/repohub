# Sources of truth

Before making changes, read and follow these sources of truth in this order.

## 1) Runtime and architecture truth

- `.github/copilot-instructions.md`
  - High-level architecture, Supabase usage, mutation patterns, and validation commands.
- `AGENTS.md`
  - The top-level entry point for progressive disclosure plus important learned constraints.
- `package.json`
  - Canonical scripts, package manager, Node version, and dependency stack.
- The live code in `app/`, `components/`, `utils/`, and `types/`
  - If a doc disagrees with implementation, the implementation wins until the doc is updated.

## 2) Data model and security truth

- `supabase/schema.sql`
  - Canonical database schema, RLS policies, storage policies, and RPCs.
  - Any setup doc that mentions SQL must match this file exactly.
- `env.example`
  - Canonical list of required environment variables.

## 3) Repo guardrails

- `.github/instructions/`
  - Linting, TypeScript, markdown, testing, performance, and workflow rules.

## 4) Repo memory and design history

- `memory/`
  - Long-lived repo notes, design docs, and task tracking used by this project.
- `.github/instructions/memory-bank.instructions.md`
  - How to treat those repo docs and when to update them.

## 5) Agent docs in this folder

- `docs/agents/*.md`
  - These files summarize the codebase for faster orientation.
  - They are guidance, not the primary source of truth.
