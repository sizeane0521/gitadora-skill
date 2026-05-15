BEGIN;

-- Re-link scores that point to instrument-less gsv_ songs to the correct
-- Zetaraku or instrument-qualified song rows, then delete the orphaned gsv_ songs.
--
-- "Instrument-less" gsv_ songs: konami_song_id LIKE 'gsv_%' but NOT ending
-- with _guitar, _bass, or _drum.

DO $$
DECLARE
  rec RECORD;
  target_key TEXT;
  target_song_id INT;
BEGIN
  -- For each score linked to an instrument-less gsv_ song, find the correct song
  FOR rec IN
    SELECT
      sc.id          AS score_id,
      sc.game_type,
      so.title       AS song_title,
      so.id          AS old_song_id
    FROM scores sc
    JOIN songs so ON so.id = sc.song_id
    WHERE so.konami_song_id LIKE 'gsv_%'
      AND so.konami_song_id NOT LIKE '%\_guitar'
      AND so.konami_song_id NOT LIKE '%\_bass'
      AND so.konami_song_id NOT LIKE '%\_drum'
  LOOP
    -- Determine target key based on game_type
    IF rec.game_type = 'DM' THEN
      target_key := rec.song_title || '_drum';
    ELSE
      -- GF covers guitar and bass; default to guitar (bass has explicit instrument)
      target_key := rec.song_title || '_guitar';
    END IF;

    -- Look for a matching song in the Zetaraku catalogue
    SELECT id INTO target_song_id
    FROM songs
    WHERE konami_song_id = target_key
    LIMIT 1;

    -- Only update if a match was found (avoids nulling foreign keys)
    IF target_song_id IS NOT NULL AND target_song_id != rec.old_song_id THEN
      UPDATE scores
      SET song_id = target_song_id
      WHERE id = rec.score_id;
    END IF;
  END LOOP;
END;
$$;

-- Delete instrument-less gsv_ songs that no longer have any linked scores
DELETE FROM songs
WHERE konami_song_id LIKE 'gsv_%'
  AND konami_song_id NOT LIKE '%\_guitar'
  AND konami_song_id NOT LIKE '%\_bass'
  AND konami_song_id NOT LIKE '%\_drum'
  AND id NOT IN (SELECT DISTINCT song_id FROM scores);

COMMIT;
