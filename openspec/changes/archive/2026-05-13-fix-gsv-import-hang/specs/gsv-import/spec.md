## ADDED Requirements

### Requirement: GSV.fun API Fetch Timeout

All HTTP requests to the gsv.fun GraphQL endpoint SHALL be wrapped with a 15-second timeout using an AbortController. If the request does not complete within 15 seconds, it SHALL be aborted and the import function SHALL throw an AbortError.

The import handler SHALL catch any thrown error (including AbortError) and SHALL call `setGsvImporting(false)` to release the loading state, then display a destructive toast with title "匯入失敗" and description "gsv.fun 連線失敗，請稍後再試".

#### Scenario: gsv.fun API responds within 15 seconds

- **WHEN** the user clicks the import button with a valid skill ID
- **THEN** the fetch SHALL complete normally and the import SHALL proceed to the Supabase write steps

#### Scenario: gsv.fun API does not respond within 15 seconds

- **WHEN** the gsv.fun GraphQL endpoint does not return a response within 15 seconds
- **THEN** the AbortController SHALL cancel the in-flight request
- **THEN** the import button SHALL return to its default (non-loading) state
- **THEN** a destructive toast SHALL appear with title "匯入失敗" and description "gsv.fun 連線失敗，請稍後再試"
- **THEN** no data SHALL be written to the `scores` or `songs` tables

##### Example: timeout boundary

| Elapsed time | Expected behaviour |
| ------------ | ------------------ |
| 0–14.999 s   | Request in-flight, button shows "匯入中…" |
| 15.000 s     | AbortController fires, request cancelled, toast shown, button resets |
