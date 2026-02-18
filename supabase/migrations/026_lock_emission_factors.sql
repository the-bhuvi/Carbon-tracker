-- Lock emission factors from any modifications
-- This migration makes emission_factors_config table read-only

-- Drop the old modify policy that allowed admins to edit
DROP POLICY IF EXISTS "Only admins can modify emission factors" ON emission_factors_config;

-- Create new read-only policy
-- Factors can only be read, never modified by any user
CREATE POLICY "emission_factors_read_only"
  ON emission_factors_config FOR SELECT
  TO authenticated USING (true);

-- Explicitly deny all insert/update/delete operations
CREATE POLICY "emission_factors_no_insert"
  ON emission_factors_config FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "emission_factors_no_update"
  ON emission_factors_config FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "emission_factors_no_delete"
  ON emission_factors_config FOR DELETE
  TO authenticated
  USING (false);
