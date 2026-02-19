-- Fix: Allow all authenticated users to read carbon_submissions
-- Historical/institutional data is inserted under the admin user,
-- so students with the old policy see zero rows.

DROP POLICY IF EXISTS "Users can view their own submissions" ON carbon_submissions;

CREATE POLICY "All authenticated users can view submissions"
ON carbon_submissions FOR SELECT
TO authenticated
USING (true);
