# Candidates for deletion (or rewrite)

This list is focused on content that is redundant, too vague to act on, or overly obvious.

## From the previous root `AGENTS.md`

### Redundant / already implied

- "This repo is designed to be worked on by AI coding agents and humans."
  - Why: not actionable; the repo name + existence of `AGENTS.md` already conveys this.

### Too vague to be actionable

- "Schedule or recommend to update documentation in the /memory folder as part of your work."
  - Why: unclear trigger and definition of "recommend".
  - Rewrite idea: define concrete triggers (e.g., "after behavior changes", "after schema changes", "after adding a feature").

- "When unsure: Prefer updating/adding a short note in `/memory/activeContext.md`..."
  - Why: directionally good, but "when unsure" is subjective.
  - Rewrite idea: list specific uncertainty types (e.g., unclear requirements, conflicting docs, surprising behavior).

### Overly obvious (avoid stating unless project-specific)

- "Prefer strict typing" / "Add tests" / "Run checks" can read as generic advice.
  - Why: these are broadly good practices.
  - Keep only if you want these to be enforced as repo policy (and keep them in `local-dev-and-quality-gates.md`).
