# Local dev and quality gates

## Local setup

- Package manager: `npm`
- Required Node version: `>=20.9.0`
- Start local dev: `npm run dev`

## Environment setup

Start from `env.example` and create a local env file such as `.env.local`.

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

Common project variables:

- `ADMIN_EMAILS`
- `GITHUB_TOKEN` for GitHub API requests when you want higher rate limits

If you change admin emails, keep `ADMIN_EMAILS` and the inline allowlist in `supabase/schema.sql` synchronized.

## Canonical validation

Run these before handoff when your change affects runtime behavior:

- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Shortcut:

- `npm run check` runs test + lint + typecheck

## Handoff checklist

- Add or update deterministic tests under `tests/` for changed behavior.
- Confirm `npm run check` passes, or record why a subset was run.
- Confirm `npm run build` passes for changes that can affect runtime or bundling.
- If you touched Supabase tables, policies, or RPCs, treat `supabase/schema.sql` as canonical and keep setup docs aligned.
- If you changed behavior or architecture, update the relevant notes in `memory/`.

## Build reliability notes

- Avoid build-time network dependencies such as `next/font/google`.
- Prefer local fonts or CSS fallbacks so `next build` stays deterministic in CI and local environments.
- Keep external fetches off critical rendering paths when possible; this project intentionally keeps the project grid lightweight and defers some work until the modal opens.
