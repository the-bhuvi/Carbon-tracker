# Carbon Tracker - System Overview

## 🔸 Features (What the System Does)

| Feature | Description |
|---------|-------------|
| **Student Surveys** | Students submit carbon footprint data (commute, electricity, water, waste) |
| **Faculty Surveys** | Faculty monitor office and commute emissions |
| **Admin Dashboard** | Create/manage surveys, view analytics, track submissions |
| **Role-based Access** | Separate flows for students, faculty, and admins |
| **Auto Carbon Calculation** | Database triggers automatically calculate emissions, scores, and suggestions |
| **Department Analytics** | Summary by department, monthly trends, per-capita emissions |
| **Dynamic Survey Builder** | Admins can create custom surveys with various question types |

---

## 🔸 Data Collected (All Fields)

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| `name` | text | User's name |
| `email` | text | Unique email |
| `role` | enum | `admin`, `student`, `faculty` |
| `department_id` | UUID | Links to department |

### Carbon Submissions (Direct Input Mode)
| Field | Type | Description |
|-------|------|-------------|
| `electricity_kwh` | decimal | Electricity consumption |
| `diesel_liters` | decimal | Diesel fuel usage |
| `petrol_liters` | decimal | Petrol fuel usage |
| `lpg_kg` | decimal | LPG gas usage |
| `png_cubic_meters` | decimal | Piped natural gas |
| `travel_km` | decimal | Travel/commute distance |
| `water_liters` | decimal | Water consumption |
| `ewaste_kg` | decimal | E-waste generated |
| `paper_kg` | decimal | Paper usage |
| `plastic_kg` | decimal | Plastic waste |
| `organic_waste_kg` | decimal | Organic waste |

### Survey System (Dynamic Questions)
| Question Types | Example Categories |
|----------------|-------------------|
| Text, Number, Select, Radio, Checkbox | electricity, diesel, petrol, lpg, png, travel, water, paper, ewaste, organic_waste |

### Departments Table
| Field | Description |
|-------|-------------|
| `name` | Department name |
| `building_area` | Area in sq meters |
| `student_count` | Number of students |

---

## 🔸 What's Already Calculated (Auto via DB Triggers)

| Calculated Field | Formula/Logic |
|------------------|---------------|
| **`total_carbon_kg`** | Sum of all inputs × emission factors |
| **`carbon_score`** | `Green` (<100kg), `Moderate` (100-500kg), `High` (>500kg) |
| **`tree_equivalent`** | `total_carbon / 21` (21kg CO₂/tree/year) |
| **`suggestions[]`** | Dynamic tips based on high-consumption categories |

### Emission Factors (Conversion Rates)
| Category | Factor (kg CO₂ per unit) |
|----------|--------------------------|
| Electricity | 0.82 per kWh |
| Diesel | 2.68 per liter |
| Petrol | 2.31 per liter |
| LPG | 2.98 per kg |
| PNG | 2.75 per m³ |
| Travel | 0.12 per km |
| Water | 0.0003 per liter |
| E-waste | 1.5 per kg |

### Analytics Functions
- `get_department_summary()` — Total/avg emissions per department
- `get_monthly_trends()` — Historical trends by month
- `get_per_capita_emissions()` — Emissions per student/department

---

## 🔸 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **State Management** | React Query (TanStack Query) |
| **Charts** | Recharts |
| **Backend/Database** | **Supabase** (PostgreSQL) |
| **Auth** | Supabase Auth (Email/Password, JWT) |
| **Security** | Row Level Security (RLS) — users see only their data |
| **Deployment** | **Vercel** |
| **Package Manager** | npm / Bun |

---

## 🔸 Database Schema Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────────┐
│   departments   │       │     users       │       │  carbon_submissions │
├─────────────────┤       ├─────────────────┤       ├─────────────────────┤
│ id (PK)         │◄──────│ department_id   │       │ id (PK)             │
│ name            │       │ id (PK)         │◄──────│ user_id (FK)        │
│ building_area   │       │ name            │       │ department_id (FK)  │
│ student_count   │       │ email           │       │ submission_date     │
└─────────────────┘       │ role            │       │ electricity_kwh     │
                          └─────────────────┘       │ diesel_liters       │
                                                    │ petrol_liters       │
┌─────────────────┐                                 │ lpg_kg              │
│ emission_factors│                                 │ png_cubic_meters    │
├─────────────────┤                                 │ travel_km           │
│ electricity=0.82│                                 │ water_liters        │
│ diesel=2.68     │                                 │ ewaste_kg           │
│ petrol=2.31     │                                 │ paper_kg            │
│ lpg=2.98        │                                 │ total_carbon_kg     │
│ png=2.75        │                                 │ carbon_score        │
│ travel=0.12     │                                 │ tree_equivalent     │
│ water=0.0003    │                                 │ suggestions[]       │
│ ewaste=1.5      │                                 └─────────────────────┘
└─────────────────┘

┌─────────────────┐       ┌─────────────────────┐   ┌─────────────────────┐
│    surveys      │       │  survey_questions   │   │  survey_responses   │
├─────────────────┤       ├─────────────────────┤   ├─────────────────────┤
│ id (PK)         │◄──────│ survey_id (FK)      │   │ id (PK)             │
│ title           │       │ id (PK)             │   │ survey_id (FK)      │
│ description     │       │ question_text       │   │ user_id (FK)        │
│ target_audience │       │ question_type       │   │ responses (JSONB)   │
│ status          │       │ options (JSONB)     │   │ calculated_emissions│
│ start_date      │       │ is_required         │   │ total_carbon        │
│ end_date        │       │ emission_category   │   └─────────────────────┘
│ created_by      │       │ conversion_factor   │
└─────────────────┘       └─────────────────────┘
```

---

## 🔸 API Endpoints (via Supabase)

All data access goes through the Supabase client with RLS policies:

```typescript
// Carbon Submissions
carbonSubmissionsApi.create(data)
carbonSubmissionsApi.getByUserId(userId)
carbonSubmissionsApi.update(id, data)

// Departments
departmentsApi.getAll()
departmentsApi.create(data)
departmentsApi.update(id, data)

// Analytics
analyticsApi.getDeptSummary()
analyticsApi.getTrends()
analyticsApi.getPerCapita()

// Surveys
surveysApi.getAll()
surveysApi.create(data)
surveysApi.getQuestions(surveyId)
surveysApi.submitResponse(data)
```

---

## 🔸 User Roles & Permissions

| Role | Can Do |
|------|--------|
| **Student** | Submit surveys, view own submissions, see dashboard |
| **Faculty** | Submit faculty surveys, view own data |
| **Admin** | Create/manage surveys, view all submissions, manage departments, full analytics |
