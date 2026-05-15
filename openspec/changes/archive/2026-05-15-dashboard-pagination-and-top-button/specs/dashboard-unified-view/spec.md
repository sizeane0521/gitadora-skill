## ADDED Requirements

### Requirement: Page-based Pagination on Dashboard Score List

The Dashboard scores page SHALL display songs in pages of 25 songs each, using a page-navigation control (SongListPagination component). The "載入更多" (load more) button SHALL be removed. When the user navigates to a different page, the browser window SHALL scroll to the top of the page.

The pagination control SHALL display: first-page button, previous-page button, up to 5 consecutive page number buttons (with ellipsis when there are more pages), next-page button, and last-page button. The current page number SHALL be visually highlighted. The pagination control SHALL NOT render when there is only 1 page.

Navigating between HOT/OTHER tabs, changing the sort selector, or toggling the underperforming filter SHALL reset the current page to 1.

#### Scenario: First page shows items 1–25

- **WHEN** the Dashboard scores page loads with more than 25 songs matching the current filter
- **THEN** only the first 25 songs SHALL be displayed
- **THEN** the pagination control SHALL be visible below the song list

#### Scenario: Navigating to page 2 shows items 26–50

- **WHEN** the user clicks the next-page button or page 2 button
- **THEN** songs 26–50 SHALL be displayed
- **THEN** the browser window SHALL scroll to the top of the page

#### Scenario: Filter change resets to page 1

- **WHEN** the user switches between HOT and OTHER tabs while on page 3
- **THEN** the displayed page SHALL reset to page 1 and songs 1–25 SHALL be shown

#### Scenario: Single page hides pagination control

- **WHEN** the total number of filtered songs is 25 or fewer
- **THEN** the pagination control SHALL NOT be rendered

##### Example: page calculation

| Total songs | PAGE_SIZE | Total pages | Page 1 items | Page 2 items |
|-------------|-----------|-------------|--------------|--------------|
| 60 | 25 | 3 | 1–25 | 26–50 |
| 25 | 25 | 1 | 1–25 | (no page 2) |
| 26 | 25 | 2 | 1–25 | 26–26 |

---

### Requirement: Scroll-to-Top Button

The Dashboard scores page SHALL display a floating "scroll to top" button that appears when the user has scrolled more than 300px from the top of the window. Clicking the button SHALL scroll the browser window smoothly to the top. The button SHALL be positioned at the bottom-right of the viewport, above the BottomNav bar, and SHALL animate in/out with a 150ms opacity+translate transition.

#### Scenario: Button appears after scrolling past threshold

- **WHEN** the user scrolls down more than 300px on the Dashboard scores page
- **THEN** the scroll-to-top button SHALL become visible

#### Scenario: Button scrolls to top when clicked

- **WHEN** the user clicks the scroll-to-top button
- **THEN** `window.scrollTo({ top: 0, behavior: "smooth" })` SHALL be invoked
- **THEN** the button SHALL disappear once the scroll position returns below 300px
