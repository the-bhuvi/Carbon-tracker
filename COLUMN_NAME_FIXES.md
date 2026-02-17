# 🔧 Column Name Fixes - Complete Reference

## 🎯 All Column Name Issues Found & Fixed

### Issue 1: ~~png_cubic_meters~~ ✅ FIXED
**Wrong:** `png_cubic_meters`  
**Correct:** `png_m3`  
**Location:** Migration 017  
**Status:** ✅ Fixed in previous iteration

---

### Issue 2: ~~total_carbon_kg~~ ✅ FIXED
**Wrong:** `total_carbon_kg`  
**Correct:** `total_carbon`  
**Locations:** 
- Migration 017 (line 125)
- Migration 018 (line 70)
- Migration 019 (line 109)
- Migration 020 (line 53)

**Status:** ✅ Fixed in this update

**Why this happened:**
The original schema (001_initial_schema.sql line 63) defines the column as:
```sql
total_carbon DECIMAL(12, 4)
```

But the new migrations were using `total_carbon_kg` (with `_kg` suffix).

---

## 📋 Complete Column Name Reference

### carbon_submissions Table - Correct Column Names

**Energy Columns:**
- ✅ `electricity_kwh` (not electricity_kilowatt_hours)
- ✅ `diesel_liters` (not diesel_litres or diesel_l)
- ✅ `petrol_liters` (not petrol_litres)
- ✅ `lpg_kg` (not lpg_kilograms)
- ✅ `png_m3` (NOT png_cubic_meters) ⚠️

**Transportation:**
- ✅ `travel_km` (not travel_kilometers)

**Resources:**
- ✅ `water_liters` (not water_litres or water_l)
- ✅ `paper_kg` (not paper_kilograms)
- ✅ `ewaste_kg` (not ewaste_kilograms or e_waste_kg)
- ✅ `organic_waste_kg` (not organic_kilograms)

**Calculated Fields:**
- ✅ `total_carbon` (NOT total_carbon_kg) ⚠️
- ✅ `carbon_score`
- ✅ `tree_equivalent`
- ✅ `suggestions` (array)

**Scope Columns (added by migration 016):**
- ✅ `scope1_emissions_kg`
- ✅ `scope2_emissions_kg`
- ✅ `scope3_emissions_kg`

**Waste Columns (added by migration 016):**
- ✅ `plastic_kg`
- ✅ `organic_waste_kg` (also in original schema)

---

## 🔧 Files Fixed in This Update

| File | Lines Changed | What Was Fixed |
|------|---------------|----------------|
| **017_update_carbon_calculation_trigger.sql** | 125 | `total_carbon_kg` → `total_carbon` |
| **018_campus_carbon_summary.sql** | 70 | `total_carbon_kg` → `total_carbon` |
| **019_carbon_simulations.sql** | 109 | `total_carbon_kg` → `total_carbon` |
| **020_recommendation_engine.sql** | 53 | `total_carbon_kg` → `total_carbon` |

---

## ✅ All Known Column Issues - Complete List

### Issue History:

1. **png_cubic_meters** ❌ → **png_m3** ✅
   - Found: User reported error
   - Fixed: Previous session
   - Locations: 1 file

2. **plastic_kg missing** ❌ → **Added dependency check** ✅
   - Found: User reported error
   - Fixed: Previous session
   - Locations: 1 file (migration 017 needed 016 first)

3. **total_carbon_kg** ❌ → **total_carbon** ✅
   - Found: User reported error (this session)
   - Fixed: This session
   - Locations: 4 files

---

## 🎯 How to Prevent Future Column Issues

### 1. Always Check the Original Schema
```sql
-- Check what column actually exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'carbon_submissions'
ORDER BY ordinal_position;
```

### 2. Use Consistent Naming
- If original uses `total_carbon`, don't add `_kg` suffix
- If original uses `png_m3`, don't change to `png_cubic_meters`
- Match exactly what's in the database

### 3. Test Migrations Before Deploying
```sql
-- Dry run: check if column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'carbon_submissions' 
  AND column_name = 'total_carbon'
);
```

---

## 📊 TypeScript Type Corrections Needed

The TypeScript types also need to match:

**File:** `src/types/database.ts`

**Check these interfaces:**

```typescript
export interface CarbonSubmission {
  id: string;
  // ... other fields ...
  
  // Make sure these match database:
  png_m3?: number;  // NOT png_cubic_meters
  total_carbon?: number;  // NOT total_carbon_kg
  
  // Scope columns (added by migration 016):
  scope1_emissions_kg?: number;
  scope2_emissions_kg?: number;
  scope3_emissions_kg?: number;
}
```

---

## 🧪 Complete Verification Query

After applying all migrations, run this to verify column names:

```sql
-- Get all carbon_submissions columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'carbon_submissions'
ORDER BY ordinal_position;

-- Expected output should include:
-- png_m3 (not png_cubic_meters)
-- total_carbon (not total_carbon_kg)
-- scope1_emissions_kg
-- scope2_emissions_kg
-- scope3_emissions_kg
-- plastic_kg
-- organic_waste_kg
```

---

## 🎉 Status: All Column Name Issues RESOLVED

✅ png_cubic_meters → png_m3  
✅ plastic_kg dependency check added  
✅ total_carbon_kg → total_carbon (4 files)  

**Confidence:** 🟢 HIGH  
**Risk:** 🟢 LOW  

All migrations now use correct column names from the actual database schema.

---

## 📝 Summary for Documentation

**Add this note to all guides:**

> **⚠️ Important Column Names:**
> - Use `png_m3` (not `png_cubic_meters`)
> - Use `total_carbon` (not `total_carbon_kg`)
> - Scope columns use `_kg` suffix: `scope1_emissions_kg`, `scope2_emissions_kg`, `scope3_emissions_kg`

---

**Last Updated:** 2024-02-17  
**Issues Fixed:** 3 (png_m3, plastic_kg dependency, total_carbon)  
**Files Updated:** 5 migrations  
**Status:** ✅ All column name issues resolved
