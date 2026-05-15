## Requirements

### Requirement: Shared Auth Context

The application SHALL provide a shared `AuthProvider` React context component that wraps the existing `useAuth()` hook. All components that need authentication state SHALL use `useAuthContext()` instead of calling `useAuth()` directly. The `AuthProvider` SHALL be mounted once at or above the `AppShell` level so that auth state persists across page navigation without re-initializing.

#### Scenario: Auth state persists on navigation

- **WHEN** an authenticated user navigates from the Dashboard to another page and back
- **THEN** the `user` object in auth context SHALL remain non-null throughout the navigation
- **THEN** the Dashboard scores list SHALL display immediately without showing "尚無歌曲資料"

#### Scenario: Single onAuthStateChange subscription

- **WHEN** the application mounts
- **THEN** exactly one `onAuthStateChange` subscription SHALL be active regardless of how many components call `useAuthContext()`

##### Example: navigation does not clear scores

- **GIVEN** the user is authenticated and Dashboard shows 83 songs
- **WHEN** the user taps "賺分曲" in the bottom nav and then taps "成績"
- **THEN** the Dashboard SHALL show the same 83 songs without a loading flash

---
### Requirement: Google OAuth Login

The system SHALL support login exclusively via Google OAuth through Supabase Auth. The system SHALL NOT support email/password registration.

#### Scenario: First-time login creates user record

- **WHEN** a user completes Google OAuth for the first time
- **THEN** the system SHALL create a record in the `users` table with `id` from `auth.uid()`, `email` from Google, `display_name` from Google display name, and `avatar_url` from Google profile photo

#### Scenario: Returning user restores session

- **WHEN** a user who has previously logged in visits the app
- **THEN** the system SHALL restore the Supabase session from localStorage and skip the login page

#### Scenario: Unauthenticated access is blocked

- **WHEN** an unauthenticated user navigates to any route except `/` and `/login`
- **THEN** the system SHALL redirect to `/login`

#### Scenario: Logout clears session

- **WHEN** a user clicks the logout button
- **THEN** the system SHALL call `supabase.auth.signOut()`, clear the local session, and redirect to `/`

---
### Requirement: User Profile Management

The system SHALL allow authenticated users to update their profile fields: `display_name`, `avatar_url`, `konami_id`, and `main_game`.

#### Scenario: Update display name

- **WHEN** a user submits a new display name (1–50 characters) on the profile settings page
- **THEN** the system SHALL update `users.display_name` for the authenticated user and display a success toast

#### Scenario: Display name length validation

- **WHEN** a user submits a display name with 0 characters or more than 50 characters
- **THEN** the system SHALL display a validation error and SHALL NOT update the database

#### Scenario: Set main game preference

- **WHEN** a user selects `GF`, `DM`, or `BOTH` as their main game
- **THEN** the system SHALL update `users.main_game` and the app shell SHALL use this preference as the default instrument mode on next load

---
### Requirement: Row Level Security for Users

The `users` table SHALL enforce RLS such that each user can only read and write their own row.

#### Scenario: User cannot read another user's record

- **WHEN** an authenticated user queries the `users` table without a WHERE clause on their own `id`
- **THEN** the system SHALL return only the row matching `auth.uid()`

#### Scenario: User cannot update another user's record

- **WHEN** an authenticated user attempts an UPDATE on a row where `id != auth.uid()`
- **THEN** the system SHALL return a permission error and SHALL NOT modify the row
