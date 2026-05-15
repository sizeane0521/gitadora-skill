## ADDED Requirements

### Requirement: Friend Request

The system SHALL allow an authenticated user to send a friend request to another user by searching their `display_name` or `email`. The request SHALL create a `friendships` record with `status = 'pending'`.

#### Scenario: Send friend request by display name

- **WHEN** a user searches for another user by display_name and clicks "Add Friend"
- **THEN** the system SHALL create a `friendships` record with `requester_id = auth.uid()`, `addressee_id = target user's id`, and `status = 'pending'`

#### Scenario: Cannot send duplicate request

- **WHEN** a user attempts to send a friend request to someone they have already sent a pending request to
- **THEN** the system SHALL display an error: "Friend request already sent" and SHALL NOT create a duplicate record

#### Scenario: Cannot send request to self

- **WHEN** a user searches and finds their own account and clicks "Add Friend"
- **THEN** the system SHALL display an error: "You cannot add yourself as a friend" and SHALL NOT create a record

#### Scenario: Search returns no results

- **WHEN** a user searches for a display_name or email that matches no registered user
- **THEN** the system SHALL display "No user found" and SHALL NOT create any record

---

### Requirement: Friend Request Response

The system SHALL allow the addressee to accept, reject, or block a pending friend request.

#### Scenario: Accept friend request

- **WHEN** the addressee clicks "Accept" on a pending request
- **THEN** the system SHALL update `friendships.status` to `'accepted'` and both users SHALL appear in each other's friend list

#### Scenario: Reject friend request

- **WHEN** the addressee clicks "Reject" on a pending request
- **THEN** the system SHALL update `friendships.status` to `'rejected'` and the request SHALL no longer appear in the pending list

#### Scenario: Block user

- **WHEN** the addressee clicks "Block" on a pending request
- **THEN** the system SHALL update `friendships.status` to `'blocked'` and the requester SHALL NOT be able to send new requests to this user

---

### Requirement: Friend List

The system SHALL display all accepted friends at `/friends/list`. Each friend entry SHALL show their `display_name`, `avatar_url`, and `main_game`.

#### Scenario: Friend list shows only accepted friendships

- **WHEN** an authenticated user visits `/friends/list`
- **THEN** the system SHALL display only users where a `friendships` record with `status = 'accepted'` exists and `auth.uid()` is either `requester_id` or `addressee_id`

#### Scenario: Empty state when no friends exist

- **WHEN** a user has no accepted friendships
- **THEN** the system SHALL display an empty state with a link to `/friends/requests`

---

### Requirement: Friend Score Viewing

The system SHALL allow authenticated users to view the scores of accepted friends at `/friends/:userId`.

#### Scenario: User can view friend's scores

- **WHEN** an authenticated user visits `/friends/:userId` where `:userId` is an accepted friend
- **THEN** the system SHALL display the friend's score list (same layout as personal score list) using the friend's `user_id` in the query

#### Scenario: User cannot view non-friend's scores

- **WHEN** an authenticated user visits `/friends/:userId` where `:userId` is NOT an accepted friend
- **THEN** the system SHALL display "You are not friends with this user" and SHALL NOT display any scores

---

### Requirement: RLS for Scores and Friendships

The `scores` table SHALL enforce RLS allowing users to read scores of accepted friends. The `friendships` table SHALL enforce RLS restricting visibility to rows where `auth.uid()` is either `requester_id` or `addressee_id`.

#### Scenario: User can read own scores

- **WHEN** an authenticated user queries `scores` with no additional filter
- **THEN** the system SHALL return only rows where `user_id = auth.uid()`

#### Scenario: User can read accepted friend's scores

- **WHEN** an authenticated user queries scores for a `user_id` that is an accepted friend
- **THEN** the system SHALL return those scores

#### Scenario: User cannot read non-friend's scores

- **WHEN** an authenticated user queries scores for a `user_id` that is not an accepted friend
- **THEN** the system SHALL return zero rows

#### Scenario: User can only read own friendship records

- **WHEN** an authenticated user queries `friendships`
- **THEN** the system SHALL return only rows where `requester_id = auth.uid()` OR `addressee_id = auth.uid()`
