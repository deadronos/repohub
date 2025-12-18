# Requirements (EARS)

1. WHEN a visitor opens the home page, THE SYSTEM SHALL display a list of projects sourced from the `projects` table.  
   Acceptance: with at least one row in Supabase, the UI renders at least one card.

2. WHEN a user requests `/admin` without being authenticated, THE SYSTEM SHALL redirect the user to `/login`.  
   Acceptance: open `/admin` in a fresh session → browser navigates to `/login`.

3. WHEN an authenticated user submits valid credentials on `/login`, THE SYSTEM SHALL create a session and redirect to `/admin`.  
   Acceptance: valid Supabase user → redirect occurs and dashboard loads.

4. WHEN an authenticated user submits the admin project form, THE SYSTEM SHALL create or update a `projects` row and revalidate the home and admin pages.  
   Acceptance: after submit, `/` shows the new/updated card.

5. WHEN an authenticated user uploads a project image, THE SYSTEM SHALL upload the file to the Supabase Storage bucket `projects` and persist the public URL in `projects.image_url`.  
   Acceptance: image renders in both gallery card and modal.
