-- ======================================================
-- VERIFY AND REFRESH DASHBOARD DATA
-- Run this in Supabase SQL Editor after importing data
-- ======================================================

-- Step 1: Check if data was imported
SELECT 
  '📊 IMPORTED DATA CHECK' as status,
  COUNT(*) as total_records,
  MIN(submission_date) as earliest_date,
  MAX(submission_date) as latest_date,
  SUM(electricity_kwh) as total_electricity,
  SUM(diesel_liters) as total_diesel
FROM carbon_submissions
WHERE submission_date >= '2024-07-01' 
  AND submission_date <= '2025-06-30';

-- Step 2: Check if calculations were triggered
SELECT 
  '🔢 CALCULATION CHECK' as status,
  total_carbon_kg,
  carbon_score,
  submission_date
FROM carbon_submissions
WHERE submission_date >= '2024-07-01' 
  AND submission_date <= '2025-06-30'
ORDER BY submission_date;

-- Step 3: Manually trigger carbon calculations if needed
UPDATE carbon_submissions
SET updated_at = NOW()
WHERE submission_date >= '2024-07-01' 
  AND submission_date <= '2025-06-30'
  AND (total_carbon_kg = 0 OR total_carbon_kg IS NULL);

-- Step 4: Check materialized views
SELECT '📈 MONTHLY SUMMARY CHECK' as status;
SELECT * FROM monthly_summary 
WHERE year IN (2024, 2025) 
ORDER BY year, month;

SELECT '📅 ACADEMIC YEAR CHECK' as status;
SELECT * FROM academic_year_summary 
WHERE academic_year LIKE '2024-2025';

-- Step 5: Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY academic_year_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY factor_breakdown;

SELECT '✅ All materialized views refreshed!' as status;

-- Step 6: Final verification
SELECT 
  '🎉 FINAL VERIFICATION' as status,
  COUNT(*) as records_in_monthly_summary
FROM monthly_summary
WHERE year IN (2024, 2025);
