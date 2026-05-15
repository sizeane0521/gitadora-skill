-- SIZ_GITADORA Initial Schema
-- Run this in Supabase SQL Editor or via Supabase CLI

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE game_type AS ENUM ('GF', 'DM');
CREATE TYPE difficulty AS ENUM ('BSC', 'ADV', 'EXT', 'MAS');
CREATE TYPE score_source AS ENUM ('arcade', 'konaste');
CREATE TYPE main_game AS ENUM ('GF', 'DM', 'BOTH');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');

-- ============================================================
-- TABLES
-- ============================================================

-- users (mirrors Supabase auth.users)
CREATE TABLE users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  display_name text NOT NULL,
  avatar_url  text,
  konami_id   text,
  main_game   main_game NOT NULL DEFAULT 'GF',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- songs (master data)
CREATE TABLE songs (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  konami_song_id  text UNIQUE NOT NULL,
  title           text NOT NULL,
  artist          text NOT NULL DEFAULT '',
  cover_url       text,
  game_type       game_type NOT NULL,
  level_bsc       numeric(4,2),
  level_adv       numeric(4,2),
  level_ext       numeric(4,2),
  level_mas       numeric(4,2),
  version         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- scores (player scores per song/difficulty/source)
CREATE TABLE scores (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id          bigint NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  game_type        game_type NOT NULL,
  difficulty       difficulty NOT NULL,
  achievement_rate numeric(5,2) NOT NULL DEFAULT 0,
  skill_point      numeric(8,2) NOT NULL DEFAULT 0,
  play_count       integer NOT NULL DEFAULT 0,
  best_grade       text,
  is_excellent     boolean NOT NULL DEFAULT false,
  is_full_combo    boolean NOT NULL DEFAULT false,
  source           score_source NOT NULL,
  imported_at      timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, song_id, difficulty, source)
);

-- friendships (bidirectional friend relationships)
CREATE TABLE friendships (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       friendship_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX scores_user_game_idx ON scores (user_id, game_type);
CREATE INDEX scores_user_source_idx ON scores (user_id, source);
CREATE INDEX friendships_requester_idx ON friendships (requester_id);
CREATE INDEX friendships_addressee_idx ON friendships (addressee_id);

-- ============================================================
-- RLS: USERS
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Row Level Security for Users: read own row only
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Row Level Security for Users: update own row only
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Row Level Security for Users: insert own row only (first login)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- RLS: SONGS (public read, no user writes)
-- ============================================================

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "songs_select_all" ON songs
  FOR SELECT USING (true);

-- ============================================================
-- RLS: SCORES
-- ============================================================

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Users can read own scores
CREATE POLICY "scores_select_own" ON scores
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read accepted friends' scores
CREATE POLICY "scores_select_friends" ON scores
  FOR SELECT USING (
    user_id IN (
      SELECT CASE
        WHEN requester_id = auth.uid() THEN addressee_id
        WHEN addressee_id = auth.uid() THEN requester_id
      END
      FROM friendships
      WHERE status = 'accepted'
        AND (requester_id = auth.uid() OR addressee_id = auth.uid())
    )
  );

-- Users can insert own scores
CREATE POLICY "scores_insert_own" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own scores
CREATE POLICY "scores_update_own" ON scores
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- RLS: FRIENDSHIPS
-- ============================================================

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can read their own friendship records only
CREATE POLICY "friendships_select_own" ON friendships
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- Users can insert (send request) as requester
CREATE POLICY "friendships_insert_own" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Users can update (accept/reject/block) as addressee
CREATE POLICY "friendships_update_addressee" ON friendships
  FOR UPDATE USING (auth.uid() = addressee_id);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER scores_updated_at BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
