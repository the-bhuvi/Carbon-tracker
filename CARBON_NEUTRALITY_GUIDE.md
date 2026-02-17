# Carbon Neutrality & Advanced Features Implementation Guide

## Overview
This guide documents the advanced carbon tracking features added to the Carbon Tracker system, including scope classification, campus-wide carbon summaries, neutrality tracking, reduction simulation, smart recommendations, and department budgets.

## Features Implemented

### 1. Scope Classification Layer
**Location:** Database migration `016_add_scope_columns.sql` and `017_update_carbon_calculation_trigger.sql`

Automatically classifies emissions into three scopes:
- **Scope 1 (Direct Emissions):** Diesel, LPG, PNG combustion
  - Formula: `diesel * 2.68 + lpg * 2.98 + png * 2.75`
- **Scope 2 (Indirect - Electricity):** Purchased electricity
  - Formula: `electricity * 0.82`
- **Scope 3 (Other Indirect):** Travel, water, waste
  - Formula: `travel * 0.12 + water * 0.0003 + ewaste * 1.5 + paper * 1.3 + plastic * 2.7 + organic_waste * 0.5`

**Database Changes:**
- Added columns: `scope1_emissions_kg`, `scope2_emissions_kg`, `scope3_emissions_kg`
- Updated `calculate_carbon_metrics()` trigger to auto-calculate scope emissions

### 2. Campus Carbon Summary
**Location:** Migration `018_campus_carbon_summary.sql`

Tracks campus-wide yearly carbon metrics:
- Total emissions by scope
- Tree absorption (21 kg CO₂ per tree per year)
- Net carbon footprint
- Carbon neutrality percentage
- Trees needed to offset remaining emissions

**Functions:**
- `get_campus_carbon_summary(year)` - Retrieves/calculates summary for a year
- `refresh_campus_carbon_summary(year, tree_count)` - Recalculates with updated tree count

### 3. Carbon Neutrality Dashboard
**Location:** `src/components/CarbonNeutralityDashboard.tsx` and related components

**Components:**
- `CarbonKPICards.tsx` - Displays 4 key metrics
- `ScopeBreakdownChart.tsx` - Bar chart showing Scope 1/2/3 distribution
- `NeutralityProgress.tsx` - Circular progress gauge and metrics
- Main dashboard with year selector and tabbed views

**Route:** `/carbon-neutrality`

### 4. Carbon Reduction Simulator
**Location:** Migration `019_carbon_simulations.sql`, Component `CarbonSimulator.tsx`

Interactive simulator to project emission reductions:
- Sliders for electricity, travel, and diesel reduction percentages
- Tree count input
- Real-time calculation of projected emissions
- Shows reduction achieved and new neutrality percentage

**Function:** `simulate_carbon_reduction(year, tree_count, electricity_reduction, travel_reduction, diesel_reduction)`

### 5. Smart Recommendation Engine
**Location:** Migration `020_recommendation_engine.sql`, Component `RecommendationsPanel.tsx`

Generates data-driven recommendations based on emission patterns:

**Recommendation Logic:**
- If Scope 2 > 40% → Solar panel installation
- If Scope 3 > 35% → Electric shuttle/carpooling
- If Scope 1 > 30% or diesel > 5000L → Generator replacement
- If net carbon > 0 → Tree planting target
- Additional recommendations for waste, water, energy efficiency

**Function:** `generate_recommendations(year)`

### 6. Department Carbon Budget
**Location:** Migration `021_department_budgets.sql`, Component `DepartmentBudgetCard.tsx`

Per-capita carbon budget system:
- **Budget Formula:** 300 kg CO₂ per student per year
- Auto-calculates when student count changes
- Status levels: Green (<70%), Yellow (70-100%), Exceeded (>100%)

**Functions:**
- `check_department_budget(dept_id, year)` - Single department status
- `get_all_department_budgets(year)` - All departments comparison

---

## Database Schema

### New Tables

#### campus_carbon_summary
```sql
- id: UUID
- year: INTEGER (unique)
- total_scope1, total_scope2, total_scope3: DECIMAL
- total_emissions: DECIMAL
- total_tree_count: INTEGER
- tree_absorption_kg: DECIMAL
- net_carbon_kg: DECIMAL
- carbon_neutrality_percentage: DECIMAL
- trees_needed_for_offset: INTEGER
```

#### carbon_simulations
```sql
- id: UUID
- user_id: UUID (references users)
- year: INTEGER
- electricity_reduction_percent: DECIMAL (0-100)
- travel_shift_percent: DECIMAL (0-100)
- diesel_reduction_percent: DECIMAL (0-100)
- baseline_scope1/2/3: DECIMAL
- projected_scope1/2/3: DECIMAL
- projected_emissions: DECIMAL
- tree_absorption_kg: DECIMAL
- projected_net_carbon: DECIMAL
- projected_neutrality_percent: DECIMAL
```

### Modified Tables

#### carbon_submissions
**Added columns:**
- `scope1_emissions_kg: DECIMAL`
- `scope2_emissions_kg: DECIMAL`
- `scope3_emissions_kg: DECIMAL`
- `plastic_kg: DECIMAL` (if not present)

#### departments
**Added columns:**
- `carbon_budget: DECIMAL`

#### emission_factors
**Added columns:**
- `paper_factor: DECIMAL (default 1.3)`
- `plastic_factor: DECIMAL (default 2.7)`
- `organic_waste_factor: DECIMAL (default 0.5)`

---

## TypeScript Types

All types are defined in `src/types/database.ts`:

```typescript
interface CampusCarbonSummary { ... }
interface CarbonSimulation { ... }
interface Recommendation { ... }
interface DepartmentBudget { ... }
```

---

## React Hooks

### useCampusCarbonSummary(year)
Fetches campus carbon summary for a specific year.

```typescript
const { data, isLoading, error } = useCampusCarbonSummary(2024);
```

### useSimulateCarbon({ year, treeCount, electricityReduction, travelReduction, dieselReduction })
Runs real-time carbon reduction simulation.

```typescript
const { data: simulation } = useSimulateCarbon({
  year: 2024,
  treeCount: 1000,
  electricityReduction: 20, // 20%
  travelReduction: 15,
  dieselReduction: 30,
});
```

### useRecommendations(year)
Fetches smart recommendations for the year.

```typescript
const { data: recommendations } = useRecommendations(2024);
```

### useDepartmentBudget(departmentId, year)
Fetches budget status for a department.

```typescript
const { data: budget } = useDepartmentBudget(deptId, 2024);
```

---

## API Functions (RPC)

All functions are accessible via Supabase RPC:

```typescript
// Get campus summary
await supabase.rpc('get_campus_carbon_summary', { target_year: 2024 });

// Refresh summary with new tree count
await supabase.rpc('refresh_campus_carbon_summary', { 
  target_year: 2024, 
  tree_count: 1500 
});

// Run simulation
await supabase.rpc('simulate_carbon_reduction', {
  target_year: 2024,
  tree_count: 1000,
  electricity_reduction: 20,
  travel_reduction: 15,
  diesel_reduction: 30,
});

// Get recommendations
await supabase.rpc('generate_recommendations', { target_year: 2024 });

// Check department budget
await supabase.rpc('check_department_budget', { 
  dept_id: 'uuid-here',
  target_year: 2024 
});

// Get all department budgets
await supabase.rpc('get_all_department_budgets', { target_year: 2024 });
```

---

## Migration Order

Apply migrations in this order:
1. `016_add_scope_columns.sql` - Adds scope columns
2. `017_update_carbon_calculation_trigger.sql` - Updates trigger
3. `018_campus_carbon_summary.sql` - Creates summary table
4. `019_carbon_simulations.sql` - Creates simulation table
5. `020_recommendation_engine.sql` - Creates recommendation function
6. `021_department_budgets.sql` - Adds budget system

### Applying Migrations

#### Via Supabase CLI:
```bash
supabase db push
```

#### Via Supabase Dashboard:
1. Go to SQL Editor
2. Copy each migration file content
3. Execute in order

---

## Usage Examples

### Viewing Carbon Neutrality Dashboard
Navigate to `/carbon-neutrality` in the app. The dashboard shows:
- KPI cards with total emissions, tree absorption, net carbon, trees needed
- Tabbed interface with:
  - **Overview:** Neutrality progress and scope breakdown
  - **Simulator:** Interactive reduction planning
  - **Recommendations:** AI-powered suggestions

### Running a Simulation
1. Go to Carbon Neutrality Dashboard
2. Click "Simulator" tab
3. Adjust sliders:
   - Electricity Reduction: 30%
   - Travel Shift: 20%
   - Diesel Reduction: 50%
4. See instant projection of emissions and neutrality percentage

### Checking Department Budget
```typescript
import { DepartmentBudgetCard } from '@/components/DepartmentBudgetCard';

<DepartmentBudgetCard 
  departmentId="dept-uuid"
  year={2024}
/>
```

---

## Calculations

### Tree Absorption
Each tree absorbs **21 kg CO₂** per year.

### Net Carbon
`Net Carbon = Total Emissions - Tree Absorption`

If negative, campus is carbon positive (absorbing more than emitting).

### Carbon Neutrality Percentage
`Neutrality % = (Tree Absorption / Total Emissions) × 100`

Capped at 100%.

### Trees Needed
`Trees Needed = CEIL(Net Carbon / 21)`

Only calculated if net carbon is positive.

### Department Budget
`Budget = Student Count × 300 kg CO₂`

Based on global average of 300 kg CO₂ per capita per year.

---

## Security & Permissions

### Row Level Security (RLS)
All new tables have RLS enabled:
- `campus_carbon_summary`: Read by all authenticated, modify by admins only
- `carbon_simulations`: Users see own simulations, admins see all

### Function Permissions
All RPC functions granted to `authenticated` role.

---

## Testing Checklist

- [ ] Apply all migrations successfully
- [ ] Verify scope calculations are correct
- [ ] Test campus summary retrieval
- [ ] Run simulation with various parameters
- [ ] Generate recommendations for different scenarios
- [ ] Check department budget calculations
- [ ] Test year selector in dashboard
- [ ] Verify charts render correctly
- [ ] Test with existing data
- [ ] Ensure backward compatibility

---

## Troubleshooting

### Issue: Summary not showing data
**Solution:** Run `refresh_campus_carbon_summary` for the year:
```sql
SELECT * FROM refresh_campus_carbon_summary(2024, 1000);
```

### Issue: Recommendations not appearing
**Solution:** Ensure there's sufficient data for the year. Recommendations are generated based on emission patterns.

### Issue: Department budget showing 0
**Solution:** Ensure `student_count` is set for the department. Budget auto-calculates on update.

### Issue: Scope values null
**Solution:** Trigger update on existing records:
```sql
UPDATE carbon_submissions SET updated_at = updated_at;
```

---

## Future Enhancements

Potential additions:
1. Historical trend analysis (multi-year comparison)
2. Export simulation results to PDF
3. Email notifications when budgets exceeded
4. Mobile-optimized views
5. Real-time dashboard updates
6. Integration with external carbon offset APIs
7. Department-level simulation tools
8. Automated report generation

---

## Support

For issues or questions:
1. Check this guide
2. Review migration files for schema details
3. Inspect TypeScript types for data structures
4. Test RPC functions directly in Supabase SQL editor

## Files Created

**Migrations:**
- `supabase/migrations/016_add_scope_columns.sql`
- `supabase/migrations/017_update_carbon_calculation_trigger.sql`
- `supabase/migrations/018_campus_carbon_summary.sql`
- `supabase/migrations/019_carbon_simulations.sql`
- `supabase/migrations/020_recommendation_engine.sql`
- `supabase/migrations/021_department_budgets.sql`

**Components:**
- `src/components/CarbonKPICards.tsx`
- `src/components/ScopeBreakdownChart.tsx`
- `src/components/NeutralityProgress.tsx`
- `src/components/CarbonSimulator.tsx`
- `src/components/RecommendationsPanel.tsx`
- `src/components/DepartmentBudgetCard.tsx`
- `src/components/CarbonNeutralityDashboard.tsx`

**Hooks:**
- `src/hooks/useCampusCarbonSummary.ts`
- `src/hooks/useSimulateCarbon.ts`
- `src/hooks/useRecommendations.ts`
- `src/hooks/useDepartmentBudget.ts`

**Pages:**
- `src/pages/CarbonNeutralityPage.tsx`

**Types:**
- Updated `src/types/database.ts`

**Routing:**
- Updated `src/App.tsx`
- Updated `src/components/Navigation.tsx`
