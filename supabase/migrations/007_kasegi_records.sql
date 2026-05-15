CREATE TABLE kasegi_records (
  id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope                integer NOT NULL,
  game_type            text NOT NULL,
  category             text NOT NULL,
  song_title           text NOT NULL,
  diff                 text NOT NULL,
  part                 text NOT NULL,
  diff_value           numeric(4,2),
  average_skill        numeric(8,2),
  player_percent       numeric(6,2),
  player_count         integer,
  average_player_skill numeric(10,2),
  synced_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, game_type, category, song_title, diff, part)
);

ALTER TABLE kasegi_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kasegi_select_all" ON kasegi_records FOR SELECT USING (true);

GRANT SELECT ON kasegi_records TO anon, authenticated;
GRANT ALL ON kasegi_records TO service_role;
GRANT USAGE ON SEQUENCE kasegi_records_id_seq TO service_role;
