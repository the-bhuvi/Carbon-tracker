# Quick Fix Guide - Survey Validation Error

## Problem
Getting "answer should be numeric value" error when submitting surveys.

## Solution Applied
1. ✅ Fixed database trigger to only convert numeric question types
2. ✅ Refined survey questions (campus-focused, conditional for student types)
3. ✅ Updated frontend to handle null values properly

## Apply the Fix (3 Steps)

### Step 1: Run the Migration
```bash
# Option A: Using Supabase CLI (if connected)
cd E:\Projects\Carbon-tracker
supabase db push

# Option B: Manual SQL execution
# Go to Supabase Dashboard → SQL Editor
# Copy and run the contents of:
# supabase/migrations/015_fix_survey_validation.sql
```

### Step 2: Restart Development Server
```bash
npm run dev
```

### Step 3: Test It
1. Login as a student
2. Go to Student Survey
3. Try both scenarios:
   - **Hosteller**: Select "Living in Hostel", leave commute blank, submit ✅
   - **Day Scholar**: Select "Day Scholar", fill commute info, submit ✅

## What Changed

### Database (SQL)
- Fixed `calculate_survey_emissions()` to only process numeric questions
- Updated survey questions to be campus-focused
- Made commute questions optional for hostellers

### Frontend (React)
- Handle empty values as `null` for optional fields
- Show "(Optional)" label clearly
- Add helpful hints for skippable questions

## Files Changed
- ✅ `/supabase/migrations/015_fix_survey_validation.sql` (NEW)
- ✅ `/src/pages/StudentSurvey.tsx`
- ✅ `/src/pages/FacultySurvey.tsx`
- 📄 `/SURVEY_VALIDATION_FIX.md` (Full documentation)

## Need Help?
See `SURVEY_VALIDATION_FIX.md` for complete details.
