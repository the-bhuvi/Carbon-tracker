# Institutional Monthly Audit - Quick Developer Guide

## Quick Start for Adding a New Feature

### 1. Add Monthly Audit Data
```typescript
import { useUpsertMonthlyAudit } from "@/hooks/useSupabase";

// In your component:
const { mutate: upsertAudit } = useUpsertMonthlyAudit();

upsertAudit({
  year: 2024,
  month: 7,
  factor_name: "Electricity",
  activity_data: 5000,
  emission_factor: 0.73,
  unit: "kWh",
  notes: "Building A monthly consumption"
});
```

### 2. Query Monthly Emission Data
```typescript
import { useMonthlyEmissionByYear } from "@/hooks/useSupabase";

// Get all months for 2024
const { data: monthlyData } = useMonthlyEmissionByYear(2024);

// Each item has: month, year, total_emission_kg, per_capita_kg, student_count, factor_count
```

### 3. Get Factor Breakdown
```typescript
import { useFactorBreakdown } from "@/hooks/useSupabase";

// For a specific month
const { data: factors } = useFactorBreakdown(2024, 7);

// For entire year
const { data: yearFactors } = useFactorBreakdown(2024);

// Each item: { factor_name, total_co2e_kg, percentage }
```

### 4. Calculate Neutrality
```typescript
import { useMonthlyNeutrality, useAcademicYearNeutrality } from "@/hooks/useSupabase";

// Monthly neutrality
const { data: monthlyNeutrality } = useMonthlyNeutrality(2024, 7);

// Academic year neutrality (July-June)
const { data: yearNeutrality } = useAcademicYearNeutrality("2024-2025");

// Returns number 0-100 (percent)
```

### 5. Update Student Enrollment
```typescript
import { useUpsertEnrolledStudents } from "@/hooks/useSupabase";

const { mutate: updateStudents } = useUpsertEnrolledStudents();

updateStudents({
  academicYear: "2024-2025",
  totalStudents: 1200,
  notes: "Updated enrollment for fall semester"
});
```

## Common Query Patterns

### Get Monthly Summary for Dashboard
```typescript
import { useMonthlyEmissionByYear, useFactorBreakdown, useMonthlyNeutrality } from "@/hooks/useSupabase";

const year = 2024;
const month = 7;

const { data: monthlyData } = useMonthlyEmissionByYear(year);
const { data: factors } = useFactorBreakdown(year, month);
const { data: neutrality } = useMonthlyNeutrality(year, month);

const currentMonth = monthlyData?.find(m => m.month === month);

// Use data:
// currentMonth.total_emission_kg
// currentMonth.per_capita_kg
// factors[0].total_co2e_kg (highest factor)
// neutrality (0-100)
```

### Get Academic Year Summary
```typescript
import { useAcademicYearEmissionSummary, useFactorBreakdown, useAcademicYearNeutrality } from "@/hooks/useSupabase";

const academicYear = "2024-2025";
const year = 2024;

const { data: summary } = useAcademicYearEmissionSummary(academicYear);
const { data: factors } = useFactorBreakdown(year);
const { data: neutrality } = useAcademicYearNeutrality(academicYear);

// Use data:
// summary.total_emission_kg
// summary.per_capita_kg
// summary.avg_students
// summary.highest_factor_name
// factors (sorted by emissions)
```

### Track Offsets & Reductions
```typescript
import { useCreateCarbonOffset, useCreateCarbonReduction } from "@/hooks/useSupabase";

const { mutate: addOffset } = useCreateCarbonOffset();
const { mutate: addReduction } = useCreateCarbonReduction();

// Record offset (e.g., tree planting)
addOffset({
  year: 2024,
  month: 7,
  offset_type: "reforestation",
  quantity: 50,
  unit: "trees",
  co2e_offset_kg: 1050, // 50 trees × 21 kg/tree
  source_description: "Campus reforestation initiative"
});

// Record reduction (e.g., energy efficiency)
addReduction({
  year: 2024,
  month: 7,
  reduction_type: "energy_efficiency",
  baseline_co2e_kg: 5000,
  actual_co2e_kg: 4500,
  initiative_description: "LED retrofit in Building A"
});

// After update, neutrality % will automatically include these
```

## Database Function Calls (Direct)

### Refresh Monthly Summary
```typescript
import { supabase } from "@/lib/supabase";

// After adding/updating audit data, refresh the summary
await supabase.rpc('refresh_monthly_summary', {
  p_year: 2024,
  p_month: 7
});
```

### Refresh Academic Year Summary
```typescript
await supabase.rpc('refresh_academic_year_summary', {
  p_academic_year: "2024-2025"
});
```

### Get Academic Year from Date
```typescript
const { data: academicYear } = await supabase
  .rpc('get_academic_year', {
    from_date: new Date().toISOString().split('T')[0]
  });

// Returns "2024-2025" for July 2024 - June 2025
```

## API Reference

### monthlyAuditApi
```typescript
monthlyAuditApi.upsert(data)          // Insert/update audit entry
monthlyAuditApi.getByMonth(year, month) // Get all factors for month
monthlyAuditApi.getByFactor(name, year?) // Get factor time series
monthlyAuditApi.getByYear(year)       // Get all months' data
monthlyAuditApi.delete(id)            // Delete entry
```

### monthlyEmissionApi
```typescript
monthlyEmissionApi.getByMonth(year, month)  // Get aggregated summary
monthlyEmissionApi.getByYear(year)          // Get all monthly summaries
monthlyEmissionApi.getTrendData(year)       // Get in chart format
monthlyEmissionApi.refresh(year, month)     // Trigger recalculation
```

### academicYearEmissionApi
```typescript
academicYearEmissionApi.getByAcademicYear(year)  // Get summary
academicYearEmissionApi.getAll()                 // Get all years
academicYearEmissionApi.refresh(year)            // Trigger recalculation
```

### enrolledStudentsApi
```typescript
enrolledStudentsApi.getByAcademicYear(year)  // Get config
enrolledStudentsApi.getAll()                 // Get all years
enrolledStudentsApi.upsert(year, count, notes) // Create/update
```

### carbonOffsetsApi / carbonReductionsApi
```typescript
api.create(data)                    // Add new entry
api.getByMonth(year, month)         // Get for month
api.getByAcademicYear(academicYear) // Get for academic year
api.delete(id)                      // Remove entry
```

### neutralityApi / factorBreakdownApi
```typescript
neutralityApi.getMonthlyNeutrality(year, month)
neutralityApi.getAcademicYearNeutrality(academicYear)

factorBreakdownApi.getByMonth(year, month)
factorBreakdownApi.getByYear(year)
```

## Common Factors & Emissions

Pre-configured in AdminInput.tsx:

| Factor | Unit | Factor Value |
|--------|------|--------------|
| Electricity | kWh | 0.73 |
| Natural Gas | m³ | 1.89 |
| Diesel | liters | 2.68 |
| Petrol | liters | 2.31 |
| LPG | kg | 1.50 |
| PNG | m³ | 1.89 |
| Water | liters | 0.35 |
| Paper | kg | 1.70 |
| Plastic | kg | 2.00 |
| E-Waste | kg | 3.50 |
| Organic Waste | kg | 0.30 |
| Travel | km | 0.12 |

## Key Formulas

```
Monthly Emission = Σ(activity_data × emission_factor) for all factors

Per Capita = Total Monthly Emission / Annual Student Count

Factor Percentage = (Factor Total / Monthly Total) × 100

Neutrality % = (Total Offsets + Total Reductions) / Total Emissions × 100
             (capped at 100%)

Academic Year = July (year) through June (year + 1)
```

## Types to Import

```typescript
import type {
  EnrolledStudentsConfig,
  MonthlyAuditData,
  MonthlyEmissionSummary,
  AcademicYearEmissionSummary,
  FactorBreakdown,
  CarbonOffset,
  CarbonReduction,
  DashboardViewMode
} from "@/types/database";
```

## Error Handling

All hooks return error state:

```typescript
const { data, isLoading, error } = useMonthlyAuditData(2024, 7);

if (error) {
  console.error("Failed to load audit data:", error);
  // Show error toast to user
}
```

## Performance Tips

1. Use `useMemo` for calculations in components
2. Leverage React Query caching (staleTime, gcTime)
3. Limit queries to specific months/years when possible
4. Use `invalidateQueries` after mutations to refresh
5. Factor breakdown is pre-sorted in database (no client sort needed)

## Database Schema Notes

- All timestamps are UTC with timezone
- Decimal precision: 4 places for activity, 6 for factors, 2 for calculations
- Year is 4-digit integer (2024-2099)
- Month is 1-12 integer
- Academic year format: "YYYY-YYYY" (e.g., "2024-2025")
- UUID for IDs, generated automatically
- Foreign keys support ON DELETE SET NULL for user references

## Next Steps

1. Apply migration to your database: `024_institutional_monthly_audit.sql`
2. Verify all 6 tables created and helper functions registered
3. Test AdminInput form with sample data
4. Verify Dashboard displays correct aggregations
5. Set up admin workflow for monthly data entry
6. Configure enrollment numbers for each academic year
7. Create reports from academic_year_summary table

---

For detailed implementation, see REFACTORING_COMPLETE.md
