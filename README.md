# Carbon Tracker

A campus carbon footprint tracking application that helps students and faculty monitor and reduce their environmental impact.

## Features

- **Student Surveys** - Track commute, electricity, water, and waste emissions
- **Faculty Surveys** - Monitor office and commute carbon footprint
- **Admin Dashboard** - Manage surveys and view analytics
- **Role-based Access** - Separate flows for students, faculty, and admins

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
