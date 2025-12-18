# TASK002 - Global UI Improvements and Admin UX

## Context
The application lacks global loading states, error boundaries, and custom 404 pages. The Admin Dashboard also uses full page reloads for updates, which is poor UX.

## Requirements
1. **Loading State:** specific `loading.tsx` with cyberpunk theme.
2. **Not Found:** specific `not-found.tsx` with cyberpunk theme.
3. **Error Boundary:** specific `error.tsx` for graceful failure.
4. **Metadata:** Update `layout.tsx` to reflect the "Project Hub" branding.
5. **Admin UX:** Refactor `AdminDashboard.tsx` to use `router.refresh()`.

## Plan
- [ ] Create `app/loading.tsx`
- [ ] Create `app/not-found.tsx`
- [ ] Create `app/error.tsx`
- [ ] Update `app/layout.tsx` metadata
- [ ] Refactor `components/AdminDashboard.tsx`
- [ ] Verify with tests

## Validation
- `npm run test` should pass.
- Manual verification of routes (simulated).
