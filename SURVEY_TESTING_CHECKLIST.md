# Survey System Testing Checklist

After applying the fix (migration 015), use this checklist to verify everything works correctly.

## Pre-Test Setup
- [ ] Migration `015_fix_survey_validation.sql` has been applied
- [ ] Frontend server is running (`npm run dev`)
- [ ] You have test student accounts (or can create them)

## Test Scenario 1: Hosteller Student
**Profile**: Lives in campus hostel, doesn't commute

### Steps:
1. [ ] Login as a student
2. [ ] Navigate to Student Survey page
3. [ ] Select any active survey
4. [ ] **Q1: Accommodation Type** → Select "Living in Hostel"
5. [ ] **Q2: Commute Mode** → Leave blank (skip)
6. [ ] **Q3: Commute Distance** → Leave blank (skip)
7. [ ] Fill remaining required questions:
   - [ ] Device usage hours
   - [ ] Water usage
   - [ ] Waste generation
   - [ ] Canteen meals
   - [ ] Paper usage
   - [ ] Plastic usage frequency
8. [ ] Leave optional questions blank or fill as desired
9. [ ] Click "Submit Survey"

### Expected Result:
✅ Survey submits successfully
✅ No "numeric value" error
✅ Carbon footprint calculated (if applicable)
✅ Success message shown

## Test Scenario 2: Day Scholar Student
**Profile**: Commutes to campus daily

### Steps:
1. [ ] Login as a student (different account)
2. [ ] Navigate to Student Survey page
3. [ ] Select any active survey
4. [ ] **Q1: Accommodation Type** → Select "Day Scholar (Commuting)"
5. [ ] **Q2: Commute Mode** → Select any option (e.g., "Public Bus")
6. [ ] **Q3: Commute Distance** → Enter a number (e.g., 15)
7. [ ] Fill remaining required questions
8. [ ] Click "Submit Survey"

### Expected Result:
✅ Survey submits successfully
✅ Travel emissions calculated from commute distance
✅ Total carbon footprint includes commute
✅ Success message shown

## Test Scenario 3: Mixed Responses
**Profile**: Test edge cases

### Steps:
1. [ ] Login as a student
2. [ ] Select survey
3. [ ] Fill some numeric questions with values
4. [ ] Fill some numeric questions with "0"
5. [ ] Leave some optional numeric questions blank
6. [ ] Select various text options in dropdown questions
7. [ ] Click "Submit Survey"

### Expected Result:
✅ All question types accepted
✅ Text options don't cause conversion errors
✅ Zero values accepted
✅ Blank optional fields accepted
✅ Emissions calculated correctly for non-zero values

## Test Scenario 4: Validation Checks
**Profile**: Test required field validation

### Steps:
1. [ ] Login as a student
2. [ ] Select survey
3. [ ] Leave a **required** field blank
4. [ ] Try to submit

### Expected Result:
❌ Submission blocked
✅ Error message shows which field is missing
✅ Message: "Please answer: [question text]"

### Continue:
5. [ ] Fill the required field
6. [ ] Submit again

### Expected Result:
✅ Submission successful

## Test Scenario 5: Faculty Survey
**Profile**: Test faculty survey works the same way

### Steps:
1. [ ] Login as faculty member (if role exists, or test with admin)
2. [ ] Navigate to Faculty Survey (if available)
3. [ ] Complete survey with mix of required/optional fields
4. [ ] Submit

### Expected Result:
✅ Same validation logic applies
✅ No numeric conversion errors
✅ Submission successful

## Test Scenario 6: Already Submitted
**Profile**: Test duplicate submission prevention

### Steps:
1. [ ] Use a student account that already submitted a survey
2. [ ] Navigate to that survey
3. [ ] View the response

### Expected Result:
✅ Shows "You have already submitted this survey"
✅ Shows submission date
✅ Shows calculated carbon footprint
✅ Form is not shown again

## Test Scenario 7: Database Verification
**Profile**: Check data is stored correctly

### Steps:
1. [ ] Go to Supabase Dashboard → Table Editor
2. [ ] Open `survey_responses` table
3. [ ] Find a recent response
4. [ ] Check the `responses` column (JSONB)

### Expected Result:
✅ Numeric values stored as numbers: `"question_id": "15"`
✅ Text values stored as text: `"question_id": "Living in Hostel"`
✅ Null values for skipped optional questions: `"question_id": null`
✅ `calculated_emissions` has values for numeric-only fields
✅ `total_carbon` is calculated

## Test Scenario 8: Emission Calculation Accuracy
**Profile**: Verify emissions are calculated correctly

### Sample Calculation:
If a day scholar enters:
- Commute distance: 20 km → 20 × 0.12 = 2.4 kg CO₂
- Device usage: 5 hours → 5 × 0.082 = 0.41 kg CO₂
- Water: 100 liters → 100 × 0.0003 = 0.03 kg CO₂

### Steps:
1. [ ] Submit survey with known values
2. [ ] Check displayed carbon footprint
3. [ ] Verify calculation matches expected values

### Expected Result:
✅ Emissions calculated only for numeric fields with factors
✅ Text-based questions ignored in calculation
✅ Total is sum of all categories

## Common Issues to Watch For

### ❌ "Answer should be numeric value"
- **Cause**: Select/radio question being converted to number
- **Fix**: Check question has correct `question_type` in database
- **Verify**: Migration 015 applied correctly

### ❌ "Missing required fields" for optional questions
- **Cause**: Frontend validation too strict
- **Fix**: Check validation logic uses `=== null` not `!response`
- **Verify**: StudentSurvey.tsx updated correctly

### ❌ Null values cause calculation errors
- **Cause**: Database function doesn't handle nulls
- **Fix**: Check `calculate_survey_emissions()` function
- **Verify**: Has `IF answer_text IS NULL ... CONTINUE` logic

### ❌ All emissions show as 0
- **Cause**: Questions don't have emission_category or conversion_factor
- **Fix**: Check survey_questions table for proper metadata
- **Verify**: Migration 015 sets these values correctly

## Success Criteria

All tests should pass:
- [x] Hostellers can skip commute questions
- [x] Day scholars can fill commute questions
- [x] Text options work without conversion errors
- [x] Null values handled properly
- [x] Required validation works
- [x] Emissions calculated correctly
- [x] No database errors
- [x] UI shows proper indicators

## If Tests Fail

1. **Check Migration Applied**:
   ```sql
   SELECT routine_name, routine_definition 
   FROM information_schema.routines 
   WHERE routine_name = 'calculate_survey_emissions';
   ```
   Should show updated function with safety checks.

2. **Check Questions Updated**:
   ```sql
   SELECT question_text, question_type, is_required, emission_category 
   FROM survey_questions 
   WHERE survey_id IN (SELECT id FROM surveys WHERE title LIKE '%Student%')
   ORDER BY order_index;
   ```
   Should show refined questions.

3. **Check Browser Console**:
   - F12 → Console tab
   - Look for JavaScript errors
   - Check Network tab for API errors

4. **Re-apply Fix**:
   - Re-run migration 015
   - Clear browser cache
   - Restart dev server

## Report Issues

If problems persist:
1. Note which test scenario failed
2. Copy exact error message
3. Check browser console logs
4. Check Supabase logs
5. Provide details of data entered
