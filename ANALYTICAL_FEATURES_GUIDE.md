# Campus Carbon Tracking System - Analytical Features Guide

## Overview

This guide explains the professional-level analytical features added to the Campus Carbon Emission Tracking System. These features provide deeper insights into institutional carbon emissions and support data-driven decision making.

---

## 1. Data Confidence Feature

### Purpose
Indicates the reliability and source of each emission factor data point.

### Confidence Levels

| Level | Indicator | Meaning | Color |
|-------|-----------|---------|-------|
| **Actual** | 🟢 | Data from verified, primary sources (meters, bills, invoices) | Green |
| **Estimated** | 🟡 | Data estimated from averages, projections, or surveys | Yellow |
| **Not Available** | 🔴 | Data missing; 0 emissions recorded | Red |

### How to Use

1. **When entering data**, specify the confidence level
2. **On the dashboard**, confidence indicators display next to each factor
3. **Hover over indicators** to see the source/method

### Implementation

- Stored in `monthly_audit_data.data_confidence` column
- Use the `<ConfidenceIndicator>` component in UI
- Automatically defaults to "Estimated" if not specified

### Best Practices

- Prioritize Actual data from utility bills and meters
- Use Estimated for projections based on similar periods
- Document reasons for Not Available status

---

## 2. Top Emission Contributor

### Purpose
Automatically identifies the highest-emitting factor for any selected period.

### Display Format
```
"Top Contributor: Electricity (62%)"
```

### Features

- **Automatic Calculation**: No manual intervention needed
- **Dynamic Updates**: Recalculates based on selected month/year
- **Percentage Display**: Shows % contribution of total emissions

### How to Access

1. Navigate to Dashboard
2. Select desired month or academic year
3. View "Top Contributor" card in Key Metrics

### Use Cases

- Identify priority areas for reduction initiatives
- Benchmark against previous periods
- Communicate focus areas to stakeholders

### Backend Function

```sql
get_top_contributor(p_year, p_month) 
-- Returns: factor_name, total_co2e_kg, percentage_contribution
```

---

## 3. Emission Intensity Metrics

### Purpose
Normalize emissions to institution-specific metrics for meaningful comparisons.

### Available Metrics

| Metric | Unit | Formula | Use Case |
|--------|------|---------|----------|
| **CO₂ per Student** | kg/student | Total CO₂ / Enrolled Students | Per-capita benchmarking |
| **CO₂ per Month** | kg/month | Total CO₂ / 12 months | Average monthly load |
| **CO₂ per Academic Year** | kg/year | Total CO₂ for 7-month period | Year-over-year comparison |
| **Scope 1 Total** | kg | Sum of direct emissions | Fuel/combustion tracking |
| **Scope 2 Total** | kg | Sum of purchased energy | Electricity-focused initiatives |
| **Scope 3 Total** | kg | Sum of other indirect | Travel/waste reduction focus |

### How to Access

1. Open Dashboard
2. View "CO₂ per Student" in Key Metrics
3. Scroll to "Emission Intensity" section for scope breakdown

### Dynamic Updates

- **Monthly View**: Shows metrics for selected month
- **Academic Year View**: Shows aggregated metrics (July-June)
- **Selection-based**: Changes when you select different periods

### Backend Function

```sql
get_emission_intensity(p_year, p_month DEFAULT NULL)
-- Returns: total_emissions_kg, total_students, co2_per_student_kg, 
--          scope1_kg, scope2_kg, scope3_kg
```

---

## 4. Reduction Simulator

### Purpose
Interactive what-if analysis for emission reduction scenarios.

### How to Use

1. **Open Reduction Simulator** card on Dashboard
2. **Input reduction percentages** for each factor
   - Example: Electricity -20%, Diesel -10%
3. **Click "Simulate Reduction"**
4. **View results**:
   - Total reduction amount (kg CO₂)
   - Reduction percentage from baseline
   - Projected new total emissions

### Output Example

```
Emission Reduction: -450 kg CO₂ (5.2%)
Baseline: 8,600 kg
Projected: 8,150 kg
```

### Use Cases

- **Scenario Planning**: What if we reduce electricity by 15%?
- **Goal Setting**: How much reduction needed to reach target?
- **Stakeholder Communication**: Show impact of initiatives
- **Cost-Benefit Analysis**: Quantify emission reduction benefits

### Constraints

- Reductions capped at 100% (cannot exceed 0 kg)
- Negative reductions (increases) not allowed
- Only for current selected month

### Backend Function

```sql
simulate_emission_reduction(p_year, p_month, p_reduction_json)
-- Input: {factor_name: percentage_reduction, ...}
-- Returns: baseline_total_kg, simulated_total_kg, total_reduction_kg, reduction_percentage
```

---

## 5. Academic Year Mode

### Purpose
Support fiscal year analysis (July-June) common in academic institutions.

### Features

- **Toggle View**: Switch between "Monthly View" and "Academic Year View"
- **Date Range**: July-June of specified academic year
- **Aggregated Data**: All 12 months compiled into single summary
- **Comparison Support**: Previous year data available for benchmarking

### Academic Year Format

```
2024-2025 = July 2024 through June 2025
2025-2026 = July 2025 through June 2026
```

### How to Access

1. Dashboard header has two toggle buttons
2. Click "Academic Year View"
3. Select academic year from dropdown
4. View aggregated metrics and charts

### Available Data in Academic Year View

- Total emissions for full academic year
- Per-capita emissions
- Factor breakdown (top contributors)
- Scope breakdown
- Trend comparison with previous year (if available)

### Backend Tables

- `academic_year_summary`: Pre-aggregated data
- `monthly_summary`: Source data (aggregated monthly)

---

## 6. Scope-wise Breakdown

### Purpose
Classify emissions per GHG Protocol standard (Scope 1, 2, 3).

### Scope Definitions

| Scope | Category | Examples |
|-------|----------|----------|
| **Scope 1** | Direct Emissions | Diesel generators, campus vehicles, LPG, PNG |
| **Scope 2** | Indirect Energy | Purchased electricity from grid |
| **Scope 3** | Other Indirect | Student travel, waste disposal, water treatment |

### Display

- **Pie Chart**: Visual distribution of scopes
- **Percentages**: % contribution of each scope
- **Totals**: Scope-wise subtotals in cards

### How to Access

1. Dashboard → "Scope-wise Breakdown" section
2. Pie chart shows relative contribution
3. Scope 1/2/3 cards show detailed totals

### Backend Function

```sql
get_scope_breakdown(p_year, p_month DEFAULT NULL)
-- Returns: scope, total_co2e_kg, percentage_contribution
```

### Factor-to-Scope Mapping

Managed in `factor_scope_mapping` table:
- Electricity → Scope 2
- Diesel/Petrol/LPG/PNG → Scope 1
- Travel/Water/E-Waste/Paper → Scope 3

---

## 7. Net Zero Projection

### Purpose
Estimate the timeline to carbon neutrality based on historical reduction trends.

### Display Format

```
"Projected Net Zero Year: 2038"
(Based on 5% annual reduction rate)
```

### Assumptions

- **Baseline**: Current year's total emissions
- **Annual Reduction**: Default 5% per year (configurable)
- **Linear Projection**: Assumes consistent annual reduction
- **Zero Emissions Goal**: Year when projected emissions reach ~0

### How to Use

1. View "Net Zero Year" card on Dashboard
2. Card displays projected year
3. Customize reduction rate (% per year)

### Calculation Example

```
2024 Baseline: 1000 tonnes
Reduction Rate: 5% annually

2025: 1000 × 0.95 = 950 tonnes
2026: 950 × 0.95 = 902.5 tonnes
2027: 902.5 × 0.95 = 857 tonnes
...
2039: ~0 tonnes → Projected Net Zero: 2039
```

### Customization

Modify in `useNetZeroProjection` hook:
```typescript
useNetZeroProjection(baselineYear, annualReductionPercentage)
// Default annual reduction: 5%
// Pass custom percentage to adjust
```

### Backend Function

```sql
calculate_net_zero_year(p_baseline_year, p_annual_reduction_percentage DEFAULT 5.0)
-- Returns: baseline_year, baseline_emissions_tonnes, annual_reduction_percentage, projected_net_zero_year
```

---

## Database Schema Changes

### New Columns

#### monthly_audit_data

```sql
ALTER TABLE monthly_audit_data 
ADD COLUMN data_confidence VARCHAR(50) CHECK (data_confidence IN ('Actual', 'Estimated', 'Not Available'));
ADD COLUMN scope VARCHAR(50) CHECK (scope IN ('Scope1', 'Scope2', 'Scope3'));
```

### New Tables

#### factor_scope_mapping

Maps each emission factor to its GHG Protocol scope.

```sql
CREATE TABLE factor_scope_mapping (
  id UUID PRIMARY KEY,
  factor_name VARCHAR(255) UNIQUE,
  scope VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### emission_simulations

Tracks reduction scenarios and their results.

```sql
CREATE TABLE emission_simulations (
  id UUID PRIMARY KEY,
  month INTEGER,
  year INTEGER,
  baseline_total_kg DECIMAL,
  simulated_total_kg DECIMAL,
  reduction_percentage DECIMAL,
  reduction_details JSONB,
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Updated Tables

#### academic_year_summary

Added scope-wise totals:

```sql
ALTER TABLE academic_year_summary 
ADD COLUMN scope1_kg DECIMAL(14, 2) DEFAULT 0;
ADD COLUMN scope2_kg DECIMAL(14, 2) DEFAULT 0;
ADD COLUMN scope3_kg DECIMAL(14, 2) DEFAULT 0;
```

---

## API & Hooks Reference

### React Hooks (useSupabase.ts)

```typescript
// Top Contributor
useTopContributor(year?, month?)
// Returns: TopContributor | null

// Factor Percentages
useFactorPercentages(year?, month?)
// Returns: FactorPercentage[]

// Emission Intensity
useEmissionIntensity(year?, month?)
// Returns: EmissionIntensityMetrics | null

// Scope Breakdown
useScopeBreakdown(year?, month?)
// Returns: ScopeBreakdownMetric[]

// Net Zero Projection
useNetZeroProjection(baselineYear?, annualReduction?)
// Returns: NetZeroProjection | null

// Reduction Simulator
useSimulateReduction()
// Returns: useMutation() for simulating reductions
```

### Supabase RPC Functions (api.ts)

```typescript
// Top Contributor API
topContributorApi.getForMonth(year, month)

// Factor Percentages API
factorPercentagesApi.getForMonth(year, month)
factorPercentagesApi.getForYear(year)

// Emission Intensity API
emissionIntensityApi.getForMonth(year, month)
emissionIntensityApi.getForYear(year)

// Scope Breakdown API
scopeBreakdownApi.getForMonth(year, month)
scopeBreakdownApi.getForYear(year)

// Net Zero Projection API
netZeroProjectionApi.calculate(baselineYear, annualReductionPercentage)

// Reduction Simulator API
reductionSimulatorApi.simulate(year, month, reductionJson)
```

---

## UI Components

### ConfidenceIndicator

Displays data confidence with colored badge and tooltip.

```typescript
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';

<ConfidenceIndicator 
  level="Actual" 
  showLabel={true} 
/>
```

### ReductionSimulator

Interactive form for modeling emission reductions.

```typescript
import { ReductionSimulator } from '@/components/ReductionSimulator';

<ReductionSimulator
  factors={factorData}
  onSimulate={handleSimulate}
  isLoading={isSimulating}
  result={simulationResult}
/>
```

### EmissionIntensityCards

Display scope-wise emission breakdown.

```typescript
import { EmissionIntensityCards } from '@/components/EmissionIntensityCards';

<EmissionIntensityCards
  scope1Kg={1000}
  scope2Kg={5000}
  scope3Kg={2000}
  coPerStudentKg={45.5}
  totalStudents={160}
/>
```

---

## Dashboard Integration

### EnhancedDashboard Component

The enhanced dashboard integrates all analytical features:

```
Location: src/pages/EnhancedDashboard.tsx

Sections:
1. Key Metrics (Total, CO2/student, Top Contributor, Net Zero Year)
2. Factor Breakdown Chart (Pie)
3. Scope-wise Breakdown Chart (Pie)
4. Monthly Trend Chart (Line)
5. Intensity Metrics Cards (Scope 1/2/3)
6. Reduction Simulator
7. Footer Statistics
```

### Data Flow

```
Dashboard Selection (Month/Year)
    ↓
Fetch Multiple Datasets:
  - Monthly emission data
  - Factor breakdown
  - Intensity metrics
  - Scope breakdown
  - Top contributor
  - Net zero projection
    ↓
Render Components
    ↓
User Interaction (Simulator)
    ↓
Mutation → Recalculate
    ↓
Display Results
```

---

## Best Practices

### Data Entry

1. **Use Actual data** from utility bills and meters whenever possible
2. **Document sources** for Estimated data
3. **Mark as Not Available** rather than guessing
4. **Update scope classification** when factors change

### Analysis

1. **Compare trends** across academic years, not random months
2. **Focus on Scope 2** (electricity) for biggest impact areas
3. **Use simulator** to set realistic reduction goals
4. **Benchmark** against previous years and peer institutions

### Stakeholder Communication

1. **Start with top contributor** to highlight focus area
2. **Use simulator results** to show achievable targets
3. **Reference net zero year** to frame long-term strategy
4. **Break down by scope** to align with organizational structure

### Continuous Improvement

1. **Monitor CO₂ per student** as key metric
2. **Track reduction initiatives** with simulator
3. **Update academic year summaries** quarterly
4. **Verify data confidence** levels regularly

---

## Troubleshooting

### Issue: No data showing

- Verify monthly_audit_data has entries for selected month/year
- Check enrolled_students_config for the academic year
- Ensure data_confidence is set (defaults to "Estimated")

### Issue: Simulator not working

- Ensure factors have non-zero values
- Check reduction percentages are 0-100
- Verify month/year selection is correct

### Issue: Net Zero Year showing far future

- Current reduction rate may be too low
- Adjust annual_reduction_percentage parameter
- Review baseline emissions for accuracy

### Issue: Scope breakdown missing

- Check that monthly_audit_data.scope is populated
- Run migration 027 to ensure columns exist
- Verify factor_scope_mapping has all factors

---

## Future Enhancements

Potential features for future releases:

1. **Custom reduction scenarios** with multiple years
2. **Comparison with benchmark institutions**
3. **Automatic reduction from historical trends**
4. **API for external tools integration**
5. **Custom date range selection** (not just fiscal periods)
6. **Historical trend analysis** (5-year lookback)
7. **Anomaly detection** for unusual emission spikes
8. **Predictive modeling** using ML

---

## Support & Questions

For questions about specific features:

1. Check the relevant section above
2. Review the migration file: `supabase/migrations/027_analytical_features.sql`
3. Check component implementation in `src/components/` and `src/pages/EnhancedDashboard.tsx`
4. Review API definitions in `src/lib/supabase/api.ts`

---

**Version**: 1.0
**Last Updated**: 2026-02-18
**Status**: Production Ready
