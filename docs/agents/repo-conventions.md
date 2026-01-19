# Repo conventions that matter

These are the patterns that most frequently cause subtle bugs when violated.

## Supabase + Next.js patterns

- **Server fetch patterns:** use `createClient()` from `utils/supabase/server.ts` in server components (e.g., `app/page.tsx`, `app/admin/page.tsx`).

- **Auth gating:** `middleware.ts` delegates to `utils/supabase/middleware.ts`.
  - Do not insert logic between `createServerClient()` and `supabase.auth.getUser()`.

- **Mutations:** prefer Next **Server Actions** and keep cache invalidation consistent with current behavior.
  - (See `open-questions.md` about the correct canonical location for Server Actions in this repo.)
