## 2025-02-18 - Stored XSS via URL Fields
**Vulnerability:** The `createProject` and `updateProject` actions accepted arbitrary strings for `repo_url` and `demo_url` without validation. An authenticated admin could inject `javascript:alert(1)` which would be executed when a user clicks the "Play / Demo" or "View Code" buttons in the Project Gallery.
**Learning:** Even in a trusted admin environment, defense-in-depth requires validating all inputs. The `formData.get()` cast to string bypasses type safety, so explicit runtime validation is critical.
**Prevention:** Added `isValidUrl` validation in `app/actions.ts` to ensure URLs start with `http:` or `https:`.
