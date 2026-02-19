# Campus Carbon Footprint Tracker

A comprehensive full-stack carbon tracking and neutrality planning system for educational institutions, built with React, TypeScript, Vite, and Supabase.

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

- **[QUICK_START.md](./QUICK_START.md)** - Getting started guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview
- **[BACKEND_GUIDE.md](./BACKEND_GUIDE.md)** - Backend & Supabase reference
- **[AUTH_SYSTEM_GUIDE.md](./AUTH_SYSTEM_GUIDE.md)** - Authentication system guide
- **[SURVEY_SYSTEM_GUIDE.md](./SURVEY_SYSTEM_GUIDE.md)** - Survey system guide
- **[USER_ROLES_GUIDE.md](./USER_ROLES_GUIDE.md)** - User roles & permissions
- **[CARBON_NEUTRALITY_GUIDE.md](./CARBON_NEUTRALITY_GUIDE.md)** - Carbon neutrality features
- **[GHG_PROTOCOL_INVENTORY_GUIDE.md](./GHG_PROTOCOL_INVENTORY_GUIDE.md)** - GHG Protocol inventory system
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing reference

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
- [Architecture](ARCHITECTURE.md)
- [Carbon Neutrality Guide](CARBON_NEUTRALITY_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)
