## ADDED Requirements

### Requirement: Fetch Community Pian-Fen Data from gsv.fun

The system SHALL fetch community skill-farming song data from the gsv.fun GraphQL endpoint (`https://gsv.fun/graphql`) using an HTTP POST request with a `kasegiNew` query. The request SHALL include variables `type` (GameType: GF or DM) and `version` (fixed to `"gitadora-fuzz-up"`). The response SHALL be parsed into `PianFenData` containing `hot` and `other` arrays of `PianFenRecord`.

#### Scenario: Successful data fetch returns hot and other categories

- **WHEN** the user navigates to the PianFen page with instrument `gf`
- **THEN** the system SHALL send a POST to `https://gsv.fun/graphql` with `{ type: "GF", version: "gitadora-fuzz-up" }`
- **THEN** the page SHALL display two sections: HOT and LONG AGO, each containing a ranked list of `PianFenRecord` entries

#### Scenario: Network error shows error state

- **WHEN** the fetch to gsv.fun fails (network error or non-2xx response)
- **THEN** the page SHALL display an error message indicating the community data could not be loaded
- **THEN** no partial list SHALL be displayed

#### Scenario: GF mode filters to guitar and bass records

- **WHEN** the user is on the PianFen page with instrument `gf`
- **THEN** only records with `part` equal to `"guitar"` or `"bass"` SHALL be displayed

#### Scenario: DM mode filters to drum records

- **WHEN** the user is on the PianFen page with instrument `dm`
- **THEN** only records with `part` equal to `"drum"` SHALL be displayed

---

### Requirement: PianFen Page Displays Ranked Song List

The PianFen page SHALL display community pian-fen songs at route `/pian-fen/:instrument` where `:instrument` is `gf` or `dm`. The page SHALL include a GF/DM instrument switcher tab at the top, followed by a HOT section and a LONG AGO section. Each section SHALL list entries in the order returned by the API. Each entry SHALL show: rank number, song name, difficulty label (BSC/ADV/EXT/MAS), instrument part (Guitar/Bass/Drums), level value (diffValue), and average skill (averageSkill).

#### Scenario: Page renders list with rank numbers

- **WHEN** the API returns 10 hot records and 20 other records
- **THEN** the HOT section SHALL display 10 entries numbered 1–10
- **THEN** the LONG AGO section SHALL display 20 entries numbered 1–20 (each section has its own rank sequence)

#### Scenario: Instrument tab switch changes displayed data

- **WHEN** user taps the DM tab
- **THEN** the route SHALL change to `/pian-fen/dm`
- **THEN** the page SHALL re-fetch and display drum records only

#### Scenario: Loading state shown during fetch

- **WHEN** the fetch is in progress
- **THEN** the page SHALL display a loading spinner in place of the list
- **THEN** no list content SHALL be visible during loading

#### Scenario: No-login required

- **WHEN** an unauthenticated user accesses `/pian-fen`
- **THEN** the page SHALL redirect to login (PianFen is within the ProtectedRoute wrapper)

---

### Requirement: Data Caching via TanStack Query

The `usePianFen` hook SHALL use TanStack Query `useQuery` with a `staleTime` of 5 minutes (300,000 ms) to avoid redundant requests to gsv.fun during a session.

#### Scenario: Repeated navigation does not re-fetch within stale window

- **WHEN** the user visits PianFen GF, navigates away, and returns within 5 minutes
- **THEN** the system SHALL serve the cached response without issuing a new HTTP request to gsv.fun
