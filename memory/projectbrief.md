# Project Brief — RepoHub

## Summary

RepoHub is a cyber-minimalist portfolio and project gallery built with Next.js (App Router) and Supabase. It shows a public grid of projects and provides an authenticated admin dashboard for CRUD operations and image uploads.

## Goals

- Public, fast-loading gallery of projects backed by Supabase Postgres.
- Smooth, premium UI (bento grid + modal expansion animations).
- Simple, secure-ish admin workflow (login + protected admin route).
- Minimal operational burden: single Next.js app + Supabase managed services.

## Non-Goals (Current)

- Public user sign-up or multi-tenant accounts.
- Roles/permissions beyond “authenticated vs not authenticated”.
- Full CMS features (drafts, scheduling, rich text editor).
- Image lifecycle management (e.g., deleting old uploads).

## Primary Users

- Visitor: browses projects and opens details.
- Admin: logs in and manages project records.

## Success Criteria

- Visitor can view projects without authentication.
- Unauthenticated user is redirected away from /admin.
- Authenticated user can create/update/delete projects.
- Image uploads store files in Supabase Storage and render via Next image remotePatterns.
