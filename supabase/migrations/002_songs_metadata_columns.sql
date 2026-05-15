ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS instrument text CHECK (instrument IN ('guitar', 'bass', 'drums')),
  ADD COLUMN IF NOT EXISTS reading    text,
  ADD COLUMN IF NOT EXISTS category   text CHECK (category IN ('HOT', 'Other')),
  ADD COLUMN IF NOT EXISTS tags       text;
