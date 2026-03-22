# Workflow and memory

## Two different memory systems exist here

- `memory/`
  - A repo folder committed with the codebase.
  - Use it for project-specific designs, requirements, and task history.
- Copilot memory (`/memories/...`)
  - Agent-managed memory outside the repo.
  - Useful for reusable agent context, but not a substitute for committed project docs.

When repo behavior, setup, or architecture changes, prefer updating the committed `memory/` notes so the next contributor sees the same history.

## Repo memory layout

- Requirements: `memory/requirements.md`
- Designs: `memory/designs/DES###-*.md`
- Tasks: `memory/tasks/_index.md` and `memory/tasks/TASK###-*.md`
- Active context: `memory/activeContext.md`
- Progress snapshot: `memory/progress.md`

## What to record after meaningful changes

- Behavior changes
- Schema, policy, or storage changes
- Validation steps that were actually run
- Follow-ups, caveats, or technical debt

## Documentation learning loop

Treat major code changes and major doc changes as a two-way sync:

- When fixing a substantial bug or making a meaningful architecture, performance, security, or workflow change, update the relevant docs in the same pass.
- When correcting docs because they were stale, also verify the live code and config so the docs are not merely made internally consistent while still wrong.
- When a change teaches a durable lesson that should influence future work, add it to `docs/agents/findings-and-learnings.md`.
- When the only outcome is an unresolved contradiction, record it in `docs/agents/open-questions.md` instead of hiding it.

Good rule of thumb: every major code change should leave either a doc update, a learning entry, or both. Every major doc correction should be backed by a code or config check.

## Workflow expectation

Follow the phases from `.github/instructions/spec-driven-workflow-v1.instructions.md`:

- Analyze → Design → Implement → Validate → Reflect → Handoff

For small changes, keep that loop lightweight; for larger changes, record enough detail in `memory/` that another contributor can pick up the work without rediscovering context.
