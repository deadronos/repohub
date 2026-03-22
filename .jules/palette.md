## 2024-05-23 - Form Accessibility Pattern
**Learning:** Forms in this codebase use a sibling structure for labels and inputs (`<div><label/><input/></div>`) instead of nesting. This requires explicit `htmlFor` and `id` linking for accessibility, which was consistently missing.
**Action:** When working on forms, always verify label association using `screen.getByLabelText` in tests. Add visual indicators (`*`) for required fields as they were missing.

## 2025-05-22 - Component Extraction for Clean Code
**Learning:** Extracted action buttons from `ProjectModal.tsx` into a reusable `ProjectActions.tsx` component. This reduced the nesting level in the modal and improved maintainability by encapsulating button styles and conditional rendering logic.
**Action:** When a component's JSX becomes deeply nested or contains logic for rendering multiple related elements (like a group of action buttons), consider extracting them into a dedicated sub-component. This keeps the parent component focused on layout and high-level structure.
