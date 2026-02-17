# Campus Carbon Footprint Tracker

A comprehensive full-stack carbon tracking and neutrality planning system for educational institutions, built with React, TypeScript, Vite, and Supabase.

## ⚠️ IMPORTANT: If You're Getting Migration Errors

**Getting "total_carbon_kg does not exist" or similar errors?**

Your database has cached old functions. **Quick fix:**

```sql
-- Run this in Supabase SQL Editor first:
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();
```

Then apply migrations:
```bash
supabase db push
```

See **[WHICH_FIX_DO_I_NEED.md](./WHICH_FIX_DO_I_NEED.md)** for detailed troubleshooting.

---

## 🌟 Features

### Core Carbon Tracking
- **Student Surveys** - Track commute, electricity, water, and waste emissions
- **Faculty Surveys** - Monitor office and commute carbon footprint
- **Admin Dashboard** - Manage surveys and view analytics
- **Role-based Access** - Separate flows for students, faculty, and admins
- **Multi-source emission tracking**: Electricity, diesel, LPG, PNG, travel, water, waste
- **Real-time carbon calculations**: Automatic emission factor application

### 🌳 Advanced Carbon Neutrality System (NEW)
- **Scope Classification**: Automatic GHG Protocol Scope 1/2/3 categorization
  - Scope 1: Direct emissions (diesel, LPG, PNG)
  - Scope 2: Indirect emissions (electricity)
  - Scope 3: Other indirect (travel, water, waste)
- **Campus Carbon Summary**: Yearly campus-wide emissions and tree absorption tracking
- **Neutrality Dashboard**: Interactive visualizations showing progress toward carbon neutrality
- **Reduction Simulator**: What-if scenario planning with real-time projections
- **Smart Recommendations**: Data-driven emission reduction suggestions based on patterns
- **Department Budgets**: Per-capita carbon budgets (300 kg CO₂/student/year) with status tracking

### Analytics & Insights
- Department-level carbon summaries
- Per-capita emission tracking
- Monthly/yearly trend analysis
- Carbon score classifications (Green/Moderate/High)
- Tree equivalent calculations (21 kg CO₂ per tree per year)
- Neutrality percentage and net carbon tracking

## 🗂️ Documentation

### 🚀 Getting Started (Start Here!)
- **[MIGRATION_CHEAT_SHEET.md](./MIGRATION_CHEAT_SHEET.md)** - ⭐ Quick one-page reference for applying migrations
- **[APPLY_MIGRATIONS_NOW.md](./APPLY_MIGRATIONS_NOW.md)** - Detailed step-by-step migration guide with verification
- **[MIGRATION_FIXES_COMPLETE.md](./MIGRATION_FIXES_COMPLETE.md)** - Summary of all fixes made to migrations

### 📚 Feature Guides
- **[CARBON_NEUTRALITY_GUIDE.md](./CARBON_NEUTRALITY_GUIDE.md)** - Complete guide to carbon neutrality features (Phases 1-6)
- **[GHG_PROTOCOL_INVENTORY_GUIDE.md](./GHG_PROTOCOL_INVENTORY_GUIDE.md)** - Professional GHG Protocol inventory system guide
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Complete implementation summary

### 🔧 Technical Reference
- **[MIGRATIONS_ALL_FIXED.md](./MIGRATIONS_ALL_FIXED.md)** - Comprehensive migration documentation with dependencies
- **[QUICK_START.md](./QUICK_START.md)** - Original quick start guide
- **[MIGRATION_APPLY_GUIDE.md](./MIGRATION_APPLY_GUIDE.md)** - Original migration instructions

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd carbon-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

Deploy to Vercel:

```sh
npm run build
vercel --prod
```

## Documentation

- [Backend Guide](BACKEND_GUIDE.md)
- [Auth System Guide](AUTH_SYSTEM_GUIDE.md)
- [Survey System Guide](SURVEY_SYSTEM_GUIDE.md)
- [User Roles Guide](USER_ROLES_GUIDE.md)
