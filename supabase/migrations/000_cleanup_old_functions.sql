-- Clean up old/broken functions before applying fixed migrations
-- Run this BEFORE applying migrations 017-023

-- Drop the old calculate_carbon_metrics function if it exists
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();

-- Drop any other functions that might have issues
DROP FUNCTION IF EXISTS get_campus_carbon_summary(INTEGER);
DROP FUNCTION IF EXISTS simulate_carbon_reduction(INTEGER, INTEGER, DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS generate_recommendations(INTEGER);

-- This prepares for clean migration application
-- After running this, apply migrations 017-023 in order
