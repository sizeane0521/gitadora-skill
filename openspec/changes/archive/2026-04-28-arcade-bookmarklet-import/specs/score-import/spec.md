## ADDED Requirements

### Requirement: Bookmarklet Uses Real Implementation

The `makeBookmarkletHref()` function in Import.tsx SHALL import `bookmarklet/arcade.js` as a raw string using Vite's `?raw` query, replace `%%VITE_SUPABASE_URL%%` with `import.meta.env.VITE_SUPABASE_URL` and `%%VITE_SUPABASE_ANON_KEY%%` with `import.meta.env.VITE_SUPABASE_ANON_KEY` at runtime, then return the result as a `javascript:` URI. The function SHALL NOT contain hardcoded bookmarklet logic.

#### Scenario: Bookmarklet href contains real Supabase URL

- **WHEN** `makeBookmarkletHref("arcade")` is called with env vars set
- **THEN** the returned href SHALL start with `javascript:`
- **THEN** the href SHALL NOT contain the literal string `%%VITE_SUPABASE_URL%%`
- **THEN** the href SHALL contain the actual Supabase project URL
