# Findings and learnings

Use this file to capture durable lessons discovered while fixing bugs, aligning docs with code, tightening security, improving performance, or clarifying workflows.

This file is for lessons that should change how future contributors work in RepoHub.

## When to update it

Add or update an entry when a change reveals something non-obvious and reusable, such as:

- a bug pattern that is easy to reintroduce
- a fragile integration or build constraint
- a performance trap worth avoiding
- a security or authorization gotcha
- a docs/code mismatch that caused confusion and is likely to happen again

## When not to use it

- Do not use this file for active contradictions. Put those in `open-questions.md`.
- Do not use this file for one-off task notes. Put those in `memory/`.
- Do not duplicate the full changelog. Keep entries short and action-oriented.

## Entry format

For each learning, capture:

- **Finding:** what was discovered
- **Why it matters:** the risk or impact
- **What changed:** the fix or policy now in place
- **Where it lives:** key files or systems involved
- **Follow-up:** optional next step if the work is incomplete

## Working rule

When a major code change happens, expect at least one documentation touch in the same pass:

- update a canonical guide in `docs/agents/`
- add a durable lesson here
- or do both when the change is significant

When a major docs correction happens, verify the corresponding code or config before closing the loop.

## Current learnings

### Build-time external font fetches make builds flaky

- **Finding:** Using `next/font/google` can cause build-time network fetches that fail in CI or constrained environments.
- **Why it matters:** A healthy codebase can still fail `next build` for reasons unrelated to app logic.
- **What changed:** Prefer local fonts or CSS fallbacks so builds stay deterministic.
- **Where it lives:** `AGENTS.md`, `docs/agents/local-dev-and-quality-gates.md`, `app/globals.css`, `app/layout.tsx`

### WebGPU renderers must be initialized before first render

- **Finding:** `WebGPURenderer` requires `await renderer.init()` before use.
- **Why it matters:** Rendering before initialization causes runtime failures that only show up in specific environments.
- **What changed:** The runtime now awaits initialization when present and falls back to WebGL deterministically.
- **Where it lives:** `AGENTS.md`, `components/WebGPUCanvas.tsx`, `tests/components/WebGPUCanvas.spec.tsx`, `tests/components/WebGPUCanvas.init.spec.tsx`

### Admin allowlists must stay synchronized across app code and RLS

- **Finding:** App-side admin checks and database-side RLS can drift if they are maintained separately.
- **Why it matters:** Auth can appear correct in the UI while DB policies still deny or allow the wrong operations.
- **What changed:** Agent docs now explicitly require keeping `ADMIN_EMAILS` and the inline allowlist in `supabase/schema.sql` synchronized.
- **Where it lives:** `docs/agents/repo-conventions.md`, `docs/agents/local-dev-and-quality-gates.md`, `supabase/schema.sql`, `utils/supabase/admin.ts`

### Heavy per-card async work degrades the project grid quickly

- **Finding:** Fetching extra data for every visible card adds unnecessary client/server fan-out.
- **Why it matters:** The gallery may still work functionally while feeling slower and becoming more expensive to render.
- **What changed:** GitHub stats are treated as on-demand modal content rather than default per-card content.
- **Where it lives:** `docs/agents/repo-conventions.md`, `components/ProjectModal.tsx`, `components/ProjectCard.tsx`, `components/GitHubStats.tsx`
