-- NUCLEAR OPTION: Complete cleanup and fresh start
-- ⚠️ WARNING: This will delete all scope-related data and GHG Protocol tables
-- Only use this if you want to start completely fresh with migrations 016-023

-- ============================================
-- 1. Drop all new functions
-- ============================================
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics() CASCADE;
DROP FUNCTION IF EXISTS get_campus_carbon_summary(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS refresh_campus_carbon_summary(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS simulate_carbon_reduction(INTEGER, INTEGER, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS generate_recommendations(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS calculate_department_budget(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_department_budget(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_all_department_budgets(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_current_emission_factor(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS insert_emission_record(INTEGER, INTEGER, UUID, DECIMAL, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_total_campus_emissions(INTEGER, INTEGER, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_scope_breakdown(INTEGER, INTEGER, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_category_breakdown(TEXT, INTEGER, INTEGER, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_monthly_trend(INTEGER, INTEGER, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_emission_intensity(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_baseline_comparison(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_emission_factor(UUID, DECIMAL, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS detect_carbon_hotspots(INTEGER, INTEGER, INTEGER, INTEGER) CASCADE;

-- ============================================
-- 2. Drop all new tables
-- ============================================
DROP TABLE IF EXISTS baseline_years CASCADE;
DROP TABLE IF EXISTS emission_records CASCADE;
DROP TABLE IF EXISTS emission_factors_config CASCADE;
DROP TABLE IF EXISTS emission_categories CASCADE;
DROP TABLE IF EXISTS carbon_simulations CASCADE;
DROP TABLE IF EXISTS campus_carbon_summary CASCADE;

-- ============================================
-- 3. Remove new columns from carbon_submissions
-- ============================================
ALTER TABLE carbon_submissions 
DROP COLUMN IF EXISTS scope1_emissions_kg,
DROP COLUMN IF EXISTS scope2_emissions_kg,
DROP COLUMN IF EXISTS scope3_emissions_kg,
DROP COLUMN IF EXISTS plastic_kg CASCADE,
DROP COLUMN IF EXISTS organic_waste_kg CASCADE,
DROP COLUMN IF EXISTS paper_factor,
DROP COLUMN IF EXISTS plastic_factor,
DROP COLUMN IF EXISTS ewaste_factor,
DROP COLUMN IF EXISTS organic_factor;

-- ============================================
-- 4. Remove carbon_budget from departments
-- ============================================
ALTER TABLE departments DROP COLUMN IF EXISTS carbon_budget;

-- ============================================
-- 5. Restore original trigger (if it exists)
-- ============================================
-- This will be recreated when you apply migrations

-- ============================================
-- DONE - Database is now clean
-- ============================================
-- Next steps:
-- 1. Apply migrations in order: 016 → 017 → 018 → 019 → 020 → 021 → 022 → 023
-- 2. Use: supabase db push
-- 3. Or apply manually in SQL Editor

SELECT 'Cleanup complete. Ready for fresh migration application.' AS status;
