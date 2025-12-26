# Tech Context

## Stack

- Framework: Next.js 16 (App Router)
- UI: React 19, Tailwind CSS v4 (via `@import "tailwindcss"`)
- Animations: framer-motion
- Icons: lucide-react
- Backend: Supabase (Postgres + Auth + Storage)
- Supabase client: `@supabase/ssr` + `@supabase/supabase-js`

## Runtime / Tooling

- Node.js 18+ (recommended)
- TypeScript 5
- ESLint 9 + `eslint-config-next`

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

Optional:

- `GITHUB_TOKEN` (GitHub API token; helps avoid rate limits for stats fetching)

Defined in `env.example` and expected in `.env.local`.

## Local Development

- Install: `npm install`
- Run: `npm run dev`

## Validation

- Tests: `npm run test` (or `npm run test:coverage`)
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

## Supabase Setup

- SQL schema lives in `supabase/schema.sql` (projects table + RLS policies).
- Storage bucket expected: `projects` (public bucket).

## Next.js Image

- `next.config.ts` allows remote images from `*.supabase.co`.
