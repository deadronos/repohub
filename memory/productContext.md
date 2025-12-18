# Product Context

## Why this exists

A single place to present a curated, visually distinctive portfolio of projects with low friction updates.

## User Experience Goals

- “Cyber-minimalist” look: dark background, subtle neon glow, glass panels.
- Project discovery: bento grid cards with immediate visual scan.
- Low cognitive load: click a card to expand into a modal with details + links.
- Admin workflow should be quick: add/edit project in one modal form.

## Key User Journeys

### Visitor

1. Land on home page.
2. View project cards (title, short description, tags).
3. Click a card → modal expands (framer-motion layout).
4. Open Demo and/or Repo links.

### Admin

1. Navigate to /admin.
2. If unauthenticated → redirected to /login.
3. Submit email/password → server action logs in.
4. Admin dashboard displays projects.
5. Create new project (optional image upload).
6. Edit existing project (optional image replacement).
7. Select and delete projects.

## Content Model (Conceptual)

- Project: title, short description, full description, image URL, repo/demo URLs, tags.
