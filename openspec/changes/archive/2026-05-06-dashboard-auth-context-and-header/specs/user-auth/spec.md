## ADDED Requirements

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
