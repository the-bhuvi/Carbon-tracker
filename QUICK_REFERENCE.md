# Carbon Neutrality System - Quick Reference Card

## 🚀 Getting Started

### Apply Migrations
```bash
cd E:\Projects\Carbon-tracker
supabase db push
```

### Start Development
```bash
npm run dev
# Visit: http://localhost:5173/carbon-neutrality
```

---

## 📊 Key Features

### 1. Scope Classification
Automatic categorization:
- **Scope 1:** diesel × 2.68 + lpg × 2.98 + png × 2.75
- **Scope 2:** electricity × 0.82  
- **Scope 3:** travel, water, waste (various factors)

### 2. Campus Summary
- Yearly campus-wide emissions
- Tree absorption: 21 kg CO₂ per tree
- Net carbon: emissions - absorption
- Neutrality %: (absorption / emissions) × 100

### 3. Dashboard (`/carbon-neutrality`)
**Overview Tab:**
- 4 KPI cards
- Circular progress
- Scope breakdown chart

**Simulator Tab:**
- Electricity reduction slider
- Travel shift slider
- Diesel reduction slider
- Real-time projections

**Recommendations Tab:**
- Priority-grouped actions
- Impact estimates

### 4. Department Budgets
- Formula: 300 kg CO₂ × students
- Status: Green/Yellow/Exceeded

---

## 🔧 Database Functions

```sql
-- Get campus summary
SELECT * FROM get_campus_carbon_summary(2024);

-- Refresh summary with tree count
SELECT * FROM refresh_campus_carbon_summary(2024, 1000);

-- Run simulation
SELECT * FROM simulate_carbon_reduction(
  2024,  -- year
  1000,  -- tree count
  20,    -- electricity reduction %
  15,    -- travel reduction %
  30     -- diesel reduction %
);

-- Get recommendations
SELECT * FROM generate_recommendations(2024);

-- Check department budget
SELECT * FROM check_department_budget('dept-uuid', 2024);

-- All departments
SELECT * FROM get_all_department_budgets(2024);
```

---

## 🎨 React Components

### Using Dashboard
```tsx
import CarbonNeutralityPage from '@/pages/CarbonNeutralityPage';
// Route: /carbon-neutrality
```

### Using Individual Components
```tsx
import { CarbonKPICards } from '@/components/CarbonKPICards';
import { ScopeBreakdownChart } from '@/components/ScopeBreakdownChart';
import { NeutralityProgress } from '@/components/NeutralityProgress';
import { CarbonSimulator } from '@/components/CarbonSimulator';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';
import { DepartmentBudgetCard } from '@/components/DepartmentBudgetCard';

<CarbonKPICards summary={summary} />
<ScopeBreakdownChart summary={summary} />
<NeutralityProgress summary={summary} />
<CarbonSimulator year={2024} defaultTreeCount={1000} />
<RecommendationsPanel year={2024} />
<DepartmentBudgetCard departmentId="uuid" year={2024} />
```

---

## 🪝 React Hooks

```tsx
// Campus summary
const { data, isLoading } = useCampusCarbonSummary(2024);

// Simulation
const { data: sim } = useSimulateCarbon({
  year: 2024,
  treeCount: 1000,
  electricityReduction: 20,
  travelReduction: 15,
  dieselReduction: 30,
});

// Recommendations
const { data: recs } = useRecommendations(2024);

// Department budget
const { data: budget } = useDepartmentBudget(deptId, 2024);

// All departments
const { data: all } = useAllDepartmentBudgets(2024);
```

---

## 🐛 Common Issues

### Scope values NULL
```sql
UPDATE carbon_submissions SET updated_at = updated_at;
```

### No campus data
```sql
SELECT * FROM refresh_campus_carbon_summary(2024, 1000);
```

### Budget is 0
```sql
UPDATE departments SET student_count = 100 WHERE id = 'uuid';
```

### Permission denied
```sql
GRANT EXECUTE ON FUNCTION function_name(args) TO authenticated;
```

---

## 📁 File Locations

**Migrations:** `supabase/migrations/016-021_*.sql`  
**Components:** `src/components/Carbon*.tsx`  
**Hooks:** `src/hooks/use*.ts`  
**Types:** `src/types/database.ts`  
**Page:** `src/pages/CarbonNeutralityPage.tsx`

---

## 📚 Documentation

- **[CARBON_NEUTRALITY_GUIDE.md](./CARBON_NEUTRALITY_GUIDE.md)** - Full feature guide
- **[MIGRATION_APPLY_GUIDE.md](./MIGRATION_APPLY_GUIDE.md)** - Migration steps
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Technical details
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment steps

---

## ✅ Quick Verification

### Check migrations applied
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('campus_carbon_summary', 'carbon_simulations');
```

### Check functions exist
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%carbon%';
```

### Test data
```sql
SELECT * FROM carbon_submissions LIMIT 1;
SELECT * FROM get_campus_carbon_summary(2024);
```

---

## 🎯 Key Metrics

- **Tree Absorption:** 21 kg CO₂ per tree per year
- **Department Budget:** 300 kg CO₂ per student per year
- **Neutrality Goal:** 100% (absorption ≥ emissions)
- **Budget Status:**
  - Green: <70% utilized
  - Yellow: 70-100% utilized
  - Exceeded: >100% utilized

---

## 🔗 Navigation

**Route:** `/carbon-neutrality`  
**Menu:** Navigation bar → "Carbon Neutrality" (TreePine icon)  
**Access:** All authenticated users

---

## 💡 Tips

1. **Set realistic tree count** - Update via `refresh_campus_carbon_summary(year, trees)`
2. **Use simulator first** - Plan reductions before implementation
3. **Act on recommendations** - Prioritize High priority items
4. **Track progress** - Review dashboard monthly
5. **Share results** - Celebrate wins, address challenges

---

## 📞 Support

**Issue:** Check relevant guide  
**Database:** Review Supabase logs  
**Frontend:** Check browser console  
**Functions:** Test in SQL editor  

---

**Version:** 1.0.0  
**Updated:** 2026-02-17  
**Status:** ✅ Production Ready
