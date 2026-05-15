-- Grant authenticated users access to their own data tables
-- (RLS policies restrict row-level access; these grants allow table-level access)

GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scores TO authenticated;
GRANT SELECT, INSERT, UPDATE ON friendships TO authenticated;
