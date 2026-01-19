# Workflow and Memory Bank

## How we document work

Long-lived context lives in `/memory/`.

- Requirements: `memory/requirements.md`
- Designs: `memory/designs/DES###-*.md`
- Tasks: `memory/tasks/_index.md` and `memory/tasks/TASK###-*.md`

When making meaningful changes, update (or recommend updating) the relevant `/memory` notes with:

- What changed (behavior, APIs, migrations)
- How it was validated (commands, checks)
- Any follow-ups or known issues

## Spec-driven workflow

Follow the phases from `.github/instructions/spec-driven-workflow-v1.instructions.md`:

- Analyze → Design → Implement → Validate → Reflect → Handoff

## When unsure

Prefer adding a short note to `memory/activeContext.md` explaining:

- what you discovered
- what you changed
- why you chose that approach
