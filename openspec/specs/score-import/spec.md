## Requirements

### Requirement: Bookmarklet Generation and Display

The system SHALL provide two Bookmarklet scripts on the `/import` page: one for arcade (`bookmarklet/arcade.js`) and one for home version Konaste (`bookmarklet/konaste.js`). Each bookmarklet SHALL be displayed as a draggable link that users can add to their browser bookmarks bar.

#### Scenario: User sees bookmarklet on import page

- **WHEN** an authenticated user visits `/import/arcade` or `/import/konaste`
- **THEN** the page SHALL display a draggable bookmarklet link, step-by-step instructions, and a visual guide showing how to drag it to the bookmarks bar

#### Scenario: Bookmarklet link contains minified JavaScript

- **WHEN** the import page renders the bookmarklet link
- **THEN** the `href` attribute SHALL contain a `javascript:` URI with the complete minified bookmarklet code (no external script loading)

---
### Requirement: Bookmarklet Authentication Check

Before uploading scores, the bookmarklet SHALL verify that the user is logged into SIZ_GITADORA by checking for a valid Supabase session token in localStorage.

#### Scenario: User is authenticated before import

- **WHEN** the user activates the bookmarklet on the Konami website while logged into SIZ_GITADORA
- **THEN** the bookmarklet SHALL proceed to scrape scores

#### Scenario: User is not authenticated

- **WHEN** the user activates the bookmarklet without a valid SIZ_GITADORA session token in localStorage
- **THEN** the bookmarklet SHALL display an alert: "Please log in to SIZ_GITADORA first" and SHALL NOT attempt to upload any data

---
### Requirement: Score Scraping from Konami Website

The bookmarklet SHALL parse the current Konami website page DOM to extract score data fields for each song entry.

#### Scenario: Arcade bookmarklet extracts scores from p.eagate.573.jp

- **WHEN** the arcade bookmarklet runs on a valid Konami arcade score page
- **THEN** it SHALL extract for each entry: song title, game type (GF/DM), difficulty (BSC/ADV/EXT/MAS), achievement rate (%), skill point, play count, best grade, is_excellent (boolean), is_full_combo (boolean), and set `source = 'arcade'`

#### Scenario: Konaste bookmarklet extracts scores from Konaste page

- **WHEN** the Konaste bookmarklet runs on a valid Konaste score page
- **THEN** it SHALL extract the same fields and set `source = 'konaste'`

#### Scenario: Bookmarklet runs on wrong page

- **WHEN** the bookmarklet runs on a page that does not contain recognizable score table HTML
- **THEN** the bookmarklet SHALL display an alert: "No score data found on this page" and SHALL NOT upload anything

---
### Requirement: Score Upload to Supabase

The bookmarklet SHALL POST extracted scores to Supabase via the REST API, using the authenticated user's session token for authorization.

#### Scenario: Successful score upload

- **WHEN** the bookmarklet successfully scrapes scores and the user is authenticated
- **THEN** it SHALL upsert all score records into the `scores` table (matching on `user_id + song_id + difficulty + source`) and display an alert: "Import complete: N songs updated"

#### Scenario: Partial upload failure

- **WHEN** the Supabase API returns an error for one or more records during upload
- **THEN** the bookmarklet SHALL display an alert showing how many records succeeded and how many failed, and SHALL NOT silently discard errors

---
### Requirement: Import History Display

The `/import` page SHALL display the timestamp and record count of the user's most recent import for each source (arcade, konaste).

#### Scenario: User sees last import time

- **WHEN** an authenticated user visits `/import`
- **THEN** the page SHALL display "Last arcade import: [date/time] — N records" and "Last Konaste import: [date/time] — N records" (or "Never imported" if no history exists)

---
### Requirement: Bookmarklet Uses Real Implementation

The `makeBookmarkletHref()` function in Import.tsx SHALL import `bookmarklet/arcade.js` as a raw string using Vite's `?raw` query, replace `%%VITE_SUPABASE_URL%%` with `import.meta.env.VITE_SUPABASE_URL` and `%%VITE_SUPABASE_ANON_KEY%%` with `import.meta.env.VITE_SUPABASE_ANON_KEY` at runtime, then return the result as a `javascript:` URI. The function SHALL NOT contain hardcoded bookmarklet logic.

#### Scenario: Bookmarklet href contains real Supabase URL

- **WHEN** `makeBookmarkletHref("arcade")` is called with env vars set
- **THEN** the returned href SHALL start with `javascript:`
- **THEN** the href SHALL NOT contain the literal string `%%VITE_SUPABASE_URL%%`
- **THEN** the href SHALL contain the actual Supabase project URL
