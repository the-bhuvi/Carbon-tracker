# GHG Protocol Carbon Inventory System - Implementation Guide

## 🎯 System Overview

This is a **professional, enterprise-level Campus Carbon Inventory System** based on the **Greenhouse Gas (GHG) Protocol**, implemented as a **parallel system** alongside your existing survey-based carbon tracker.

### Dual-System Architecture

**EXISTING SYSTEM (Preserved):**
- Student/Faculty Surveys
- Individual carbon submissions
- Survey management
- Personal tracking

**NEW INVENTORY SYSTEM (Added):**
- Official institutional carbon inventory
- GHG Protocol Scope 1/2/3 classification
- Admin-managed monthly data entry
- Professional reporting and analytics
- Configurable emission factors

---

## ✅ Completed Implementation

### 1. Database Schema (Migration 022)
**File:** `supabase/migrations/022_ghg_protocol_inventory_schema.sql`

**New Tables Created:**

#### `emission_categories`
- Scope-based category definitions (Scope1, Scope2, Scope3)
- Pre-seeded with 14 standard categories
- Extensible for custom categories
- Unit tracking (litres, kWh, kg, km, etc.)

**Seeded Categories:**
- **Scope 1:** Diesel Generator, Campus Vehicles (Diesel/Petrol), LPG, PNG
- **Scope 2:** Electricity - Grid
- **Scope 3:** Student Commute, Staff Commute, Waste (Solid/Organic), Water, Paper, Plastic, E-Waste

#### `emission_factors_config`
- Configurable emission factors
- Version history (valid_from, valid_to)
- Factor source tracking
- Pre-seeded with standard IPCC factors

#### `emission_records`
- Monthly institutional emission records
- **Automatic calculation:** `activity_value × emission_factor = calculated_emission_kg`
- Converted to tonnes automatically
- Prevents duplicate entries (unique constraint)
- Audit trail (created_by, notes)

#### `baseline_years`
- Store baseline year for comparison
- Track scope-wise baseline emissions
- Enable progress tracking

### 2. Backend Functions (Migration 023)
**File:** `supabase/migrations/023_ghg_protocol_functions.sql`

**10 Professional Functions Created:**

1. **`get_current_emission_factor(category_id, date)`**
   - Retrieves active emission factor for a category
   - Handles factor version history

2. **`insert_emission_record(...)`**
   - Smart insert with automatic calculation
   - Updates existing record if duplicate
   - Returns created/updated record

3. **`get_total_campus_emissions(start_month, start_year, end_month, end_year)`**
   - Total emissions by scope
   - Grand total in tonnes
   - Record count

4. **`get_scope_breakdown(...)`**
   - Emissions by scope
   - Percentage contribution
   - Category count per scope

5. **`get_category_breakdown(scope, start_month, start_year, end_month, end_year)`**
   - Detailed breakdown within a scope
   - Percentage of scope
   - Total activity and unit

6. **`get_dominant_scope(...)`**
   - Identifies highest emitting scope
   - Percentage and tonnage

7. **`get_monthly_trend(...)`**
   - Month-by-month emissions
   - Scope-wise breakdown
   - Time series data for charts

8. **`compare_to_baseline(current_month, current_year)`**
   - Compares current year to baseline
   - Shows change in tonnes and percentage
   - Status: Reduced/Increased/Stable

9. **`get_emission_intensity_per_student(...)`**
   - Emissions per student (kg)
   - Useful for benchmarking

10. **`detect_carbon_hotspots(...)`**
    - Top N emission sources
    - Percentage of total
    - Automated recommendations

### 3. TypeScript Types
**Updated:** `src/types/database.ts`

Added comprehensive types for:
- EmissionCategory
- EmissionFactorConfig
- EmissionRecord
- BaselineYear
- All function return types
- Database schema extensions

### 4. Security (RLS)
- All new tables have Row Level Security enabled
- Read access: All authenticated users
- Write/Modify access: Admins only
- Function permissions granted to authenticated role

---

## 🚧 Remaining Implementation

### Phase 1: Custom Hooks (Next Priority)
Create React Query hooks for data fetching:

**Files to Create:**
- `src/hooks/useEmissionCategories.ts`
- `src/hooks/useEmissionRecords.ts`
- `src/hooks/useInventoryDashboard.ts`
- `src/hooks/useEmissionFactors.ts`

### Phase 2: Admin Data Entry Components
Create forms for monthly data input:

**Files to Create:**
- `src/components/inventory/MonthlyEmissionForm.tsx`
- `src/components/inventory/EmissionFactorManager.tsx`
- `src/components/inventory/BaselineYearConfig.tsx`
- `src/components/inventory/BulkDataImport.tsx`

### Phase 3: Inventory Dashboard Components
Professional reporting dashboard:

**Files to Create:**
- `src/components/inventory/InventoryDashboard.tsx` (Main container)
- `src/components/inventory/TotalEmissionsCard.tsx`
- `src/components/inventory/ScopeBreakdownChart.tsx` (Pie/Donut)
- `src/components/inventory/CategoryBreakdownTable.tsx`
- `src/components/inventory/DominantScopeHighlight.tsx`
- `src/components/inventory/MonthlyTrendChart.tsx` (Line chart)
- `src/components/inventory/BaselineComparisonCard.tsx`
- `src/components/inventory/EmissionIntensityCard.tsx`
- `src/components/inventory/CarbonHotspotsPanel.tsx`

### Phase 4: Pages & Routing
Add new pages:

**Files to Create:**
- `src/pages/InventoryDashboard.tsx`
- `src/pages/EmissionDataEntry.tsx`
- `src/pages/EmissionFactorsConfig.tsx`

**Update Routing:**
- Add routes in `src/App.tsx`
- Update navigation in `src/components/Navigation.tsx`

### Phase 5: Integration & Testing
- Link inventory system to main dashboard
- Add admin menu items
- Test all functions
- Verify RLS policies
- End-to-end testing

---

## 📋 Migration Application

### Step 1: Apply Database Migrations

#### Using Supabase CLI:
```bash
cd E:\Projects\Carbon-tracker
supabase db push
```

#### Using Supabase Dashboard:
1. Go to SQL Editor
2. Apply Migration 022: `022_ghg_protocol_inventory_schema.sql`
3. Apply Migration 023: `023_ghg_protocol_functions.sql`

### Step 2: Verify Installation

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('emission_categories', 'emission_factors_config', 
                     'emission_records', 'baseline_years');

-- Check categories seeded
SELECT scope, category_name FROM emission_categories ORDER BY scope;

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%emission%' OR routine_name LIKE '%carbon%';
```

### Step 3: Test Functions

```sql
-- Test total emissions (will be empty initially)
SELECT * FROM get_total_campus_emissions(1, 2024, 12, 2024);

-- Insert test record
SELECT * FROM insert_emission_record(
  1, -- January
  2024,
  (SELECT id FROM emission_categories WHERE category_name = 'Electricity - Grid'),
  50000.0, -- 50,000 kWh
  auth.uid(),
  'Test data'
);

-- Verify calculation
SELECT * FROM emission_records WHERE year = 2024;
```

---

## 🎯 Usage Workflows

### Admin Workflow: Monthly Data Entry

1. **Navigate to Emission Data Entry page**
2. **Select Month/Year**
3. **Enter Activity Data by Category:**
   - Scope 1: Diesel litres, LPG kg, etc.
   - Scope 2: Electricity kWh
   - Scope 3: Commute km, Waste kg, etc.
4. **System automatically calculates emissions**
5. **Save and review totals**

### Admin Workflow: Configure Emission Factors

1. **Navigate to Emission Factors Config**
2. **Select category to modify**
3. **Update factor with source**
4. **Set validity period**
5. **Save (creates new version)**

### Admin Workflow: Set Baseline Year

1. **Navigate to Baseline Configuration**
2. **Select baseline year**
3. **Enter historical totals by scope**
4. **Mark as active**

### Viewing Inventory Dashboard

1. **Navigate to Inventory Dashboard**
2. **Select date range**
3. **View:**
   - Total campus emissions (tonnes CO₂)
   - Scope breakdown (Scope 1/2/3 percentages)
   - Category breakdown within each scope
   - Dominant scope highlighted
   - Monthly trend chart
   - Baseline comparison
   - Emission intensity metrics
   - Carbon hotspots with recommendations

---

## 🔑 Key Features

### GHG Protocol Compliance
- ✅ Scope 1: Direct emissions
- ✅ Scope 2: Indirect energy emissions
- ✅ Scope 3: Other indirect emissions
- ✅ Proper categorization
- ✅ Audit trail

### Professional Calculations
- ✅ Activity data × Emission factor = Emissions
- ✅ Automatic kg to tonnes conversion
- ✅ Configurable factors with version control
- ✅ No hardcoded values

### Advanced Analytics
- ✅ Total campus footprint
- ✅ Scope-wise breakdown with percentages
- ✅ Category-wise within scope
- ✅ Dominant scope identification
- ✅ Monthly trends
- ✅ Baseline comparison
- ✅ Emission intensity per student
- ✅ Carbon hotspot detection with recommendations

### Data Integrity
- ✅ Unique constraint prevents duplicates
- ✅ Foreign key relationships
- ✅ Check constraints on scope values
- ✅ Automatic timestamp tracking
- ✅ Audit trail (created_by)

---

## 📊 Example Queries

### Get Annual Summary
```sql
SELECT * FROM get_total_campus_emissions(1, 2024, 12, 2024);
```

### Get Scope Breakdown
```sql
SELECT * FROM get_scope_breakdown(1, 2024, 12, 2024);
```

### Get Scope 2 Category Breakdown
```sql
SELECT * FROM get_category_breakdown('Scope2', 1, 2024, 12, 2024);
```

### Get Monthly Trend
```sql
SELECT * FROM get_monthly_trend(1, 2024, 12, 2024);
```

### Compare to Baseline
```sql
SELECT * FROM compare_to_baseline(12, 2024);
```

### Detect Hotspots
```sql
SELECT * FROM detect_carbon_hotspots(1, 2024, 12, 2024, 5);
```

---

## 🔐 Security Model

**Read Access:** All authenticated users can view inventory data  
**Write Access:** Only admins can:
- Add/edit emission records
- Configure emission factors
- Manage categories
- Set baseline years

**RLS Policies:**
- Enforced at database level
- Role-based via users table
- Cannot be bypassed from frontend

---

## 🎨 Dashboard Design Recommendations

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ Total Campus Emissions: 1,234.56 tonnes CO₂ │
├─────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌──────────┐   │
│ │ Scope 1   │ │ Scope 2   │ │ Scope 3  │   │
│ │ 35.2%     │ │ 42.8%     │ │ 22.0%    │   │
│ │ 434 t     │ │ 528 t     │ │ 272 t    │   │
│ └───────────┘ └───────────┘ └──────────┘   │
├─────────────────────────────────────────────┤
│ [Pie Chart: Scope Breakdown]                │
│                                             │
│ [Bar Chart: Category Breakdown]            │
├─────────────────────────────────────────────┤
│ [Line Chart: Monthly Trend]                │
├─────────────────────────────────────────────┤
│ Baseline Comparison: +5.2% vs 2020        │
│ Emission Intensity: 245 kg/student         │
├─────────────────────────────────────────────┤
│ Carbon Hotspots:                           │
│ 1. Electricity - Grid (42.8%)             │
│    → Install solar panels                  │
│ 2. Diesel Generator (28.4%)               │
│    → Switch to renewable alternatives      │
└─────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
E:\Projects\Carbon-tracker\
├── supabase/migrations/
│   ├── 022_ghg_protocol_inventory_schema.sql ✅
│   └── 023_ghg_protocol_functions.sql ✅
├── src/
│   ├── types/
│   │   └── database.ts ✅ (updated)
│   ├── hooks/
│   │   ├── useEmissionCategories.ts 🚧
│   │   ├── useEmissionRecords.ts 🚧
│   │   ├── useInventoryDashboard.ts 🚧
│   │   └── useEmissionFactors.ts 🚧
│   ├── components/inventory/
│   │   ├── InventoryDashboard.tsx 🚧
│   │   ├── MonthlyEmissionForm.tsx 🚧
│   │   ├── TotalEmissionsCard.tsx 🚧
│   │   ├── ScopeBreakdownChart.tsx 🚧
│   │   └── ... (8 more components) 🚧
│   └── pages/
│       ├── InventoryDashboard.tsx 🚧
│       ├── EmissionDataEntry.tsx 🚧
│       └── EmissionFactorsConfig.tsx 🚧
```

**Legend:**
- ✅ Complete
- 🚧 To be implemented

---

## 🚀 Next Steps

1. **Apply Migrations** (Ready now!)
2. **Create Custom Hooks** (Priority 1)
3. **Build Admin Forms** (Priority 2)
4. **Build Dashboard Components** (Priority 3)
5. **Integrate with Existing UI** (Priority 4)
6. **Testing & Documentation** (Priority 5)

---

## ✅ Success Criteria

- [x] Database schema designed and created
- [x] 10 backend functions implemented
- [x] TypeScript types defined
- [x] RLS security configured
- [ ] Custom hooks created
- [ ] Admin data entry forms functional
- [ ] Dashboard displays all required metrics
- [ ] Integration with existing system complete
- [ ] No breaking changes to existing features

---

## 📞 Support

**Documentation:**
- This guide
- Inline SQL comments
- TypeScript type definitions

**Testing:**
- Test functions in Supabase SQL Editor
- Verify with sample data
- Check RLS policies with different user roles

**Troubleshooting:**
- Check Supabase logs
- Verify user role in users table
- Ensure migrations applied in order

---

**Status:** Phase 1 & 2 Complete (Database & Backend)  
**Next:** Phase 3 (Custom Hooks) - Ready to implement!  
**Version:** 1.0.0  
**Last Updated:** 2026-02-17
