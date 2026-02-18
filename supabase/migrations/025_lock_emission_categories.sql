-- Lock emission categories from any modifications
-- This migration removes write permissions on emission_categories table

-- Drop the old modify policy that allowed admins to edit
DROP POLICY IF EXISTS "Only admins can modify emission categories" ON emission_categories;

-- Create new read-only policy
-- Categories can only be read, never modified by any user
CREATE POLICY "emission_categories_read_only"
  ON emission_categories FOR SELECT
  TO authenticated USING (true);

-- Explicitly deny all insert/update/delete operations
CREATE POLICY "emission_categories_no_insert"
  ON emission_categories FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "emission_categories_no_update"
  ON emission_categories FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "emission_categories_no_delete"
  ON emission_categories FOR DELETE
  TO authenticated
  USING (false);
