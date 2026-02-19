-- Dashboard Data Refresh - Direct SQL Commands
-- Run these in your Supabase SQL editor if the /refresh-dashboard page isn't working
-- Choose the appropriate command based on your needs

-- ========================================
-- OPTION 1: Refresh Current Month Only
-- ========================================
-- Use this if you only added data for the current month
SELECT refresh_monthly_summary(
  EXTRACT(YEAR FROM NOW())::INT,
  EXTRACT(MONTH FROM NOW())::INT
);

-- ========================================
-- OPTION 2: Refresh Specific Month
-- ========================================
-- Replace YEAR and MONTH with your values (e.g., 2026, 3 for March 2026)
SELECT refresh_monthly_summary(2026, 3);

-- ========================================
-- OPTION 3: Refresh All 12 Months of Current Year
-- ========================================
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 1);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 2);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 3);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 4);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 5);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 6);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 7);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 8);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 9);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 10);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 11);
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, 12);

-- ========================================
-- OPTION 4: Refresh All 12 Months of a Specific Year
-- ========================================
-- Replace YEAR with your value (e.g., 2026)
SELECT refresh_monthly_summary(2026, 1);
SELECT refresh_monthly_summary(2026, 2);
SELECT refresh_monthly_summary(2026, 3);
SELECT refresh_monthly_summary(2026, 4);
SELECT refresh_monthly_summary(2026, 5);
SELECT refresh_monthly_summary(2026, 6);
SELECT refresh_monthly_summary(2026, 7);
SELECT refresh_monthly_summary(2026, 8);
SELECT refresh_monthly_summary(2026, 9);
SELECT refresh_monthly_summary(2026, 10);
SELECT refresh_monthly_summary(2026, 11);
SELECT refresh_monthly_summary(2026, 12);

-- ========================================
-- OPTION 5: Refresh Academic Year
-- ========================================
-- For academic year starting in 2025 (2025-2026)
SELECT refresh_academic_year_summary('2025-2026');

-- For academic year starting in 2026 (2026-2027)
SELECT refresh_academic_year_summary('2026-2027');

-- ========================================
-- OPTION 6: Full Refresh (Current Year)
-- ========================================
-- This refreshes the current month + current and next academic years
-- Replace YEAR with current year if needed
WITH RECURSIVE months AS (
  SELECT 1 as month
  UNION ALL
  SELECT month + 1 FROM months WHERE month < 12
)
SELECT refresh_monthly_summary(EXTRACT(YEAR FROM NOW())::INT, month)
FROM months;

-- Also refresh academic years
SELECT refresh_academic_year_summary(
  (EXTRACT(YEAR FROM NOW())::INT - 1)::TEXT || '-' || EXTRACT(YEAR FROM NOW())::INT
);
SELECT refresh_academic_year_summary(
  EXTRACT(YEAR FROM NOW())::INT::TEXT || '-' || (EXTRACT(YEAR FROM NOW())::INT + 1)::TEXT
);

-- ========================================
-- OPTION 7: Verify Data Was Refreshed
-- ========================================
-- Check if monthly_summary has data for your month
SELECT * FROM monthly_summary 
WHERE year = 2026 AND month = 3
ORDER BY created_at DESC
LIMIT 1;

-- Check if academic_year_summary has data
SELECT * FROM academic_year_summary 
WHERE academic_year = '2025-2026'
ORDER BY created_at DESC
LIMIT 1;

-- ========================================
-- OPTION 8: View Source Data
-- ========================================
-- Check what's in monthly_audit_data (raw data you added)
SELECT * FROM monthly_audit_data 
WHERE year = 2026 AND month = 3
ORDER BY created_at DESC;

-- ========================================
-- TIPS
-- ========================================
-- 1. Select and run one query at a time
-- 2. Look for "SUCCESS" response - no errors means it worked
-- 3. After running a refresh, go to /dashboard and refresh the page
-- 4. If dashboard still doesn't show data:
--    a) Verify the year/month in your monthly_audit_data matches your selection
--    b) Check monthly_summary was actually updated (OPTION 7)
--    c) Try refreshing your browser page (Ctrl+R)
--    d) Check browser console (F12) for JavaScript errors
