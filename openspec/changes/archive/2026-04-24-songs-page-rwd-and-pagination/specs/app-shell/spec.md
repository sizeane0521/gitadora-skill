## ADDED Requirements

### Requirement: Responsive Layout Max-Width

The `AppShell` `<main>` element SHALL constrain content to a maximum width of `max-w-2xl` and center it horizontally with `mx-auto` on all screen sizes. This applies to all pages rendered inside `AppShell`.

#### Scenario: Desktop wide screen

- **WHEN** a user views any authenticated page on a screen wider than 672px
- **THEN** the page content SHALL be centered and SHALL NOT exceed 672px in width

#### Scenario: Mobile screen

- **WHEN** a user views any authenticated page on a screen narrower than 672px
- **THEN** the page content SHALL fill the full available width
