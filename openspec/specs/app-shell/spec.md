## ADDED Requirements

### Requirement: Responsive Layout Max-Width

The `AppShell` `<main>` element SHALL constrain content to a maximum width of `max-w-2xl` and center it horizontally with `mx-auto` on all screen sizes. This applies to all pages rendered inside `AppShell`.

#### Scenario: Desktop wide screen

- **WHEN** a user views any authenticated page on a screen wider than 672px
- **THEN** the page content SHALL be centered and SHALL NOT exceed 672px in width

#### Scenario: Mobile screen

- **WHEN** a user views any authenticated page on a screen narrower than 672px
- **THEN** the page content SHALL fill the full available width

---

### Requirement: Multi-Page Routing

The system SHALL use React Router v6 nested routing. The `AppShell` component SHALL serve as the layout wrapper for all authenticated routes, rendering the navigation and an `<Outlet />` for page content.

#### Scenario: Root route redirects authenticated users to dashboard

- **WHEN** an authenticated user visits `/`
- **THEN** the system SHALL redirect to `/dashboard`

#### Scenario: Root route shows landing page for unauthenticated users

- **WHEN** an unauthenticated user visits `/`
- **THEN** the system SHALL render the landing/introduction page with a "Login with Google" button

#### Scenario: Protected routes redirect to login

- **WHEN** an unauthenticated user navigates to any route except `/` and `/login`
- **THEN** the system SHALL redirect to `/login`

#### Scenario: 404 for unknown routes

- **WHEN** any user navigates to a route not defined in the router
- **THEN** the system SHALL render the NotFound page

---

### Requirement: Responsive Navigation

The system SHALL render a bottom navigation bar on screens narrower than 768px (md breakpoint) and a left sidebar on screens 768px and wider.

#### Scenario: Mobile shows bottom navigation

- **WHEN** the viewport width is less than 768px
- **THEN** the system SHALL render a fixed bottom navigation bar with 5 items: Dashboard, Songs, Kasegi, Friends, Import

#### Scenario: Desktop shows sidebar navigation

- **WHEN** the viewport width is 768px or wider
- **THEN** the system SHALL render a left sidebar 240px wide with all navigation items and the user avatar/name at the bottom

#### Scenario: Active navigation item is highlighted

- **WHEN** the current route matches a navigation item's path
- **THEN** that item SHALL be highlighted using `color-brand` as the active indicator color

---

### Requirement: GF/DM Instrument Mode Switching

The system SHALL track the current instrument mode (GF or DM) and apply the corresponding primary color token set by setting `data-instrument="gf"` or `data-instrument="dm"` on the root layout element.

#### Scenario: Instrument mode persists across page reloads

- **WHEN** a user sets the instrument mode to DM and reloads the page
- **THEN** the system SHALL restore `data-instrument="dm"` from localStorage and the DM color scheme SHALL be applied immediately on load

#### Scenario: Instrument mode defaults to user's main_game preference

- **WHEN** an authenticated user logs in for the first time on a device
- **THEN** the instrument mode SHALL default to the user's `main_game` value (`GF` or `DM`); if `main_game = 'BOTH'`, default to `GF`

#### Scenario: Switching instrument mode changes primary color

- **WHEN** a user toggles from GF mode to DM mode
- **THEN** `data-instrument` SHALL change to `"dm"`, all `--color-brand` CSS variables SHALL update to DM blue values, and the transition SHALL complete within 300ms

---

### Requirement: Light/Dark Theme Switching

The system SHALL support light and dark color modes, toggled manually by the user. The selected theme SHALL persist in localStorage under the key `siz-gitadora-theme`.

#### Scenario: User toggles to dark mode

- **WHEN** a user clicks the theme toggle button while in light mode
- **THEN** the system SHALL add `data-theme="dark"` to the root element, apply dark mode CSS variables, and save `"dark"` to localStorage

#### Scenario: Theme persists across page reloads

- **WHEN** a user who set dark mode reloads the page
- **THEN** the system SHALL read `siz-gitadora-theme` from localStorage and apply dark mode before first render (no flash of light mode)

#### Scenario: Default theme is light

- **WHEN** a new user with no localStorage value visits the app
- **THEN** the system SHALL apply light mode

---

### Requirement: Design System CSS Variables

The system SHALL define all color tokens from DESIGN.md as CSS custom properties in `src/index.css`. GF and DM primary color scales SHALL be defined under `[data-instrument="gf"]` and `[data-instrument="dm"]` selectors respectively. Dark mode semantic tokens SHALL be defined under `[data-theme="dark"]`.

#### Scenario: CSS variables are applied at root level

- **WHEN** the app renders
- **THEN** all semantic color tokens (e.g., `--color-brand`, `--color-bg-primary`, `--color-text-primary`) SHALL be accessible as CSS custom properties throughout the component tree

#### Scenario: Instrument mode updates brand color variables

- **WHEN** `data-instrument="gf"` is set on the root element
- **THEN** `--color-brand` SHALL equal `#FF6B35`; when `data-instrument="dm"` is set, `--color-brand` SHALL equal `#00A8E8`

## Requirements

### Requirement: Multi-Page Routing

The system SHALL use React Router v6 nested routing. The `AppShell` component SHALL serve as the layout wrapper for all authenticated routes, rendering the navigation and an `<Outlet />` for page content.

#### Scenario: Root route redirects authenticated users to dashboard

- **WHEN** an authenticated user visits `/`
- **THEN** the system SHALL redirect to `/dashboard`

#### Scenario: Root route shows landing page for unauthenticated users

- **WHEN** an unauthenticated user visits `/`
- **THEN** the system SHALL render the landing/introduction page with a "Login with Google" button

#### Scenario: Protected routes redirect to login

- **WHEN** an unauthenticated user navigates to any route except `/` and `/login`
- **THEN** the system SHALL redirect to `/login`

#### Scenario: 404 for unknown routes

- **WHEN** any user navigates to a route not defined in the router
- **THEN** the system SHALL render the NotFound page

---
### Requirement: Responsive Navigation

The system SHALL render a bottom navigation bar on screens narrower than 768px (md breakpoint) and a left sidebar on screens 768px and wider.

#### Scenario: Mobile shows bottom navigation

- **WHEN** the viewport width is less than 768px
- **THEN** the system SHALL render a fixed bottom navigation bar with 5 items: Dashboard, Songs, Kasegi, Friends, Import

#### Scenario: Desktop shows sidebar navigation

- **WHEN** the viewport width is 768px or wider
- **THEN** the system SHALL render a left sidebar 240px wide with all navigation items and the user avatar/name at the bottom

#### Scenario: Active navigation item is highlighted

- **WHEN** the current route matches a navigation item's path
- **THEN** that item SHALL be highlighted using `color-brand` as the active indicator color

---
### Requirement: GF/DM Instrument Mode Switching

The system SHALL track the current instrument mode (GF or DM) and apply the corresponding primary color token set by setting `data-instrument="gf"` or `data-instrument="dm"` on the root layout element.

#### Scenario: Instrument mode persists across page reloads

- **WHEN** a user sets the instrument mode to DM and reloads the page
- **THEN** the system SHALL restore `data-instrument="dm"` from localStorage and the DM color scheme SHALL be applied immediately on load

#### Scenario: Instrument mode defaults to user's main_game preference

- **WHEN** an authenticated user logs in for the first time on a device
- **THEN** the instrument mode SHALL default to the user's `main_game` value (`GF` or `DM`); if `main_game = 'BOTH'`, default to `GF`

#### Scenario: Switching instrument mode changes primary color

- **WHEN** a user toggles from GF mode to DM mode
- **THEN** `data-instrument` SHALL change to `"dm"`, all `--color-brand` CSS variables SHALL update to DM blue values, and the transition SHALL complete within 300ms

---
### Requirement: Light/Dark Theme Switching

The system SHALL support light and dark color modes, toggled manually by the user. The selected theme SHALL persist in localStorage under the key `siz-gitadora-theme`.

#### Scenario: User toggles to dark mode

- **WHEN** a user clicks the theme toggle button while in light mode
- **THEN** the system SHALL add `data-theme="dark"` to the root element, apply dark mode CSS variables, and save `"dark"` to localStorage

#### Scenario: Theme persists across page reloads

- **WHEN** a user who set dark mode reloads the page
- **THEN** the system SHALL read `siz-gitadora-theme` from localStorage and apply dark mode before first render (no flash of light mode)

#### Scenario: Default theme is light

- **WHEN** a new user with no localStorage value visits the app
- **THEN** the system SHALL apply light mode

---
### Requirement: Design System CSS Variables

The system SHALL define all color tokens from DESIGN.md as CSS custom properties in `src/index.css`. GF and DM primary color scales SHALL be defined under `[data-instrument="gf"]` and `[data-instrument="dm"]` selectors respectively. Dark mode semantic tokens SHALL be defined under `[data-theme="dark"]`.

#### Scenario: CSS variables are applied at root level

- **WHEN** the app renders
- **THEN** all semantic color tokens (e.g., `--color-brand`, `--color-bg-primary`, `--color-text-primary`) SHALL be accessible as CSS custom properties throughout the component tree

#### Scenario: Instrument mode updates brand color variables

- **WHEN** `data-instrument="gf"` is set on the root element
- **THEN** `--color-brand` SHALL equal `#FF6B35`; when `data-instrument="dm"` is set, `--color-brand` SHALL equal `#00A8E8`

---
### Requirement: Responsive Layout Max-Width

The `AppShell` `<main>` element SHALL constrain content to a maximum width of `max-w-2xl` and center it horizontally with `mx-auto` on all screen sizes. This applies to all pages rendered inside `AppShell`.

#### Scenario: Desktop wide screen

- **WHEN** a user views any authenticated page on a screen wider than 672px
- **THEN** the page content SHALL be centered and SHALL NOT exceed 672px in width

#### Scenario: Mobile screen

- **WHEN** a user views any authenticated page on a screen narrower than 672px
- **THEN** the page content SHALL fill the full available width
