## 2024-05-23 - Form Accessibility Pattern
**Learning:** Forms in this codebase use a sibling structure for labels and inputs (`<div><label/><input/></div>`) instead of nesting. This requires explicit `htmlFor` and `id` linking for accessibility, which was consistently missing.
**Action:** When working on forms, always verify label association using `screen.getByLabelText` in tests. Add visual indicators (`*`) for required fields as they were missing.
