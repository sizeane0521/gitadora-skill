-- Add game_type to scores unique constraint so GF and DM scores for the same
-- song can coexist. Previously (user_id, song_id, difficulty, source) caused
-- 409 conflicts when the same song appeared in both GF and DM skill tables.

ALTER TABLE scores
  DROP CONSTRAINT IF EXISTS scores_unique_key;

ALTER TABLE scores
  ADD CONSTRAINT scores_user_id_song_id_game_type_difficulty_source_key
  UNIQUE (user_id, song_id, game_type, difficulty, source);
