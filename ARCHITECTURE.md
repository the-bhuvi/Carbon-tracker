# Carbon Tracker - Backend Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                          │
│  (Dashboard, AdminInput, StudentSurvey, History)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ React Query Hooks
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    src/hooks/useSupabase.ts                     │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ useCarbonSub   │  │ useDepartments │  │ useCurrentUser  │  │
│  │ missions       │  │                │  │                 │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API Calls
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   src/lib/supabase/api.ts                       │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ carbonSubmis-    │  │ departments  │  │ analytics        │ │
│  │ sionsApi         │  │ Api          │  │ Api              │ │
│  │ - create()       │  │ - getAll()   │  │ - getDeptSummary │ │
│  │ - getByUserId()  │  │ - create()   │  │ - getTrends()    │ │
│  │ - update()       │  │ - update()   │  │ - getPerCapita() │ │
│  └──────────────────┘  └──────────────┘  └──────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Supabase Client
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  src/lib/supabase/client.ts                     │
│                    Configured Supabase Client                   │
│              (URL + Anon Key from .env)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API / PostgreSQL
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      SUPABASE BACKEND                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │ departments │  │    users    │  │ carbon_         │  │  │
│  │  │             │  │             │  │ submissions     │  │  │
│  │  │ - id        │  │ - id        │  │ - id            │  │  │
│  │  │ - name      │  │ - name      │  │ - user_id       │  │  │
│  │  │ - area      │  │ - email     │  │ - dept_id       │  │  │
│  │  │ - students  │  │ - role      │  │ - electricity   │  │  │
│  │  │             │  │ - dept_id   │  │ - diesel        │  │  │
│  │  └─────────────┘  └─────────────┘  │ - total_carbon  │  │  │
│  │                                     │ - carbon_score  │  │  │
│  │  ┌─────────────┐                   │ - suggestions[] │  │  │
│  │  │ emission_   │                   └─────────────────┘  │  │
│  │  │ factors     │                                        │  │
│  │  │             │                                        │  │
│  │  │ - elec=0.82 │                                        │  │
│  │  │ - diesel=.. │                                        │  │
│  │  └─────────────┘                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Database Functions                      │  │
│  │  - calculate_carbon_metrics() (TRIGGER)                 │  │
│  │  - get_department_summary()                             │  │
│  │  - get_monthly_trends()                                 │  │
│  │  - get_per_capita_emissions()                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Row Level Security (RLS)                    │  │
│  │  Students: See only their own submissions               │  │
│  │  Admins: See everything, manage all data                │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Authentication                          │  │
│  │  Email/Password, Session Management, JWT                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Creating a Carbon Submission

```
1. User fills form
   └─> StudentSurvey.tsx

2. Form submission
   └─> useCreateCarbonSubmission()

3. Hook calls API
   └─> carbonSubmissionsApi.create(data)

4. API sends to Supabase
   └─> supabase.from('carbon_submissions').insert(data)

5. Database receives data
   └─> TRIGGER: calculate_carbon_metrics()
       ├─> Calculates total_carbon
       ├─> Assigns carbon_score
       ├─> Calculates tree_equivalent
       └─> Generates suggestions[]

6. Data saved & returned
   └─> Response includes calculated fields

7. React Query updates cache
   └─> UI automatically refreshes

8. User sees result
   └─> Carbon score, trees, suggestions displayed
```

## Carbon Calculation Flow

```
Input Data:                     Emission Factors:
─────────────                   ─────────────────
electricity_kwh: 450           electricity_factor: 0.82
diesel_liters: 20         ×    diesel_factor: 2.68
petrol_liters: 30              petrol_factor: 2.31
travel_km: 80                  travel_factor: 0.12
water_liters: 8000             water_factor: 0.0003
                                    ↓
                            AUTOMATIC TRIGGER
                                    ↓
                         calculate_carbon_metrics()
                                    ↓
                    ┌───────────────┴───────────────┐
                    │                               │
            Calculate Total           Generate Suggestions
                    │                               │
            total_carbon = 536.7      - "Switch to LED bulbs"
                    │                 - "Use public transport"
                    ↓                               │
            Assign Score                            ↓
                    │                     suggestions[] array
            carbon_score = "High"                   │
                    ↓                               │
            Calculate Trees                         │
                    │                               │
            tree_equivalent = 25.6                  │
                    │                               │
                    └───────────────┬───────────────┘
                                    ↓
                            Saved to Database
                                    ↓
                            Returned to User
```

## Security Model (Row Level Security)

```
┌─────────────────────────────────────────────────────────┐
│                    User Authentication                  │
│                     (Supabase Auth)                     │
└────────────────────────┬────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
      Student Role                 Admin Role
           │                           │
           ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Student Permissions │    │  Admin Permissions   │
│  ──────────────────  │    │  ─────────────────   │
│  ✅ View own data    │    │  ✅ View all data    │
│  ✅ Create own sub   │    │  ✅ View all subs    │
│  ✅ Update own sub   │    │  ✅ Manage depts     │
│  ✅ View depts       │    │  ✅ Manage users     │
│  ✅ View own profile │    │  ✅ Update factors   │
│  ❌ View others data │    │  ✅ Full access      │
│  ❌ Manage depts     │    │                      │
│  ❌ Manage users     │    │                      │
└──────────────────────┘    └──────────────────────┘
```

## TypeScript Type Safety

```
┌──────────────────────────────────────────────────────┐
│              src/types/database.ts                   │
│  ─────────────────────────────────────────────────   │
│  interface CarbonSubmission {                        │
│    id: string;                                       │
│    user_id: string;                                  │
│    electricity_kwh: number;                          │
│    total_carbon: number | null;  // Auto-calculated │
│    carbon_score: 'Green' | 'Moderate' | 'High';     │
│    suggestions: string[] | null;                     │
│  }                                                   │
└─────────────────────┬────────────────────────────────┘
                      │
                      │ Enforced at compile time
                      │
┌─────────────────────▼────────────────────────────────┐
│              API Functions & Hooks                   │
│  Type-safe parameters and return values              │
│  ✅ Auto-complete in IDE                             │
│  ✅ Catch errors before runtime                      │
│  ✅ IntelliSense support                             │
└──────────────────────────────────────────────────────┘
```

## Integration Points with Existing Pages

```
┌────────────────────────────────────────────────────────┐
│                    Dashboard.tsx                       │
│  ─────────────────────────────────────────────────     │
│  import { useDepartmentSummary, useMonthlyTrends }    │
│                                                        │
│  const { data: summary } = useDepartmentSummary();    │
│  const { data: trends } = useMonthlyTrends();         │
│                                                        │
│  → Display in charts using Recharts                   │
│  → Show top polluting departments                     │
│  → Display monthly trends                             │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                  StudentSurvey.tsx                     │
│  ─────────────────────────────────────────────────     │
│  import { useCreateCarbonSubmission }                 │
│                                                        │
│  const { mutate: submit } = useCreateCarbonSubmission();│
│                                                        │
│  const handleSubmit = (formData) => {                 │
│    submit(formData);                                  │
│  };                                                    │
│                                                        │
│  → Connect form to backend                            │
│  → Auto-calculate carbon on submit                    │
│  → Show results (score, trees, tips)                  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                     History.tsx                        │
│  ─────────────────────────────────────────────────     │
│  import { useCarbonSubmissions }                      │
│                                                        │
│  const { data: history } = useCarbonSubmissions(id);  │
│                                                        │
│  → Display user's past submissions                    │
│  → Show trends over time                              │
│  → Filter by date range                               │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   AdminInput.tsx                       │
│  ─────────────────────────────────────────────────     │
│  import { useDepartments, useUpdateEmissionFactors }  │
│                                                        │
│  const { data: depts } = useDepartments();            │
│  const { mutate: update } = useUpdateEmissionFactors();│
│                                                        │
│  → Manage departments                                 │
│  → Update emission factors                            │
│  → View all submissions (admin)                       │
└────────────────────────────────────────────────────────┘
```

---

**This architecture provides:**
- ✅ Type-safe API calls
- ✅ Automatic data caching (React Query)
- ✅ Optimistic updates
- ✅ Auto-calculation of carbon metrics
- ✅ Role-based security
- ✅ Real-time capabilities (optional)
- ✅ Scalable and maintainable code
