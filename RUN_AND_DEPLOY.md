# How to Run and Deploy - Analytical Features

## 🏃 Quick Start (Local Development)

### 1. Start Development Server
```bash
# Install dependencies (if needed)
npm install

# Start dev server
npm run dev

# Dashboard available at: http://localhost:5173
```

### 2. Test New Features Locally

**Access Dashboard:**
- Navigate to `/dashboard` (or `/enhanced-dashboard` if you renamed it)
- View mode toggle: Monthly ↔ Academic Year
- All new features should work with existing data

**Test Simulator:**
1. Select a month with data
2. Go to "Reduction Simulator" section
3. Enter percentage reduction (e.g., 20% for Electricity)
4. Click "Simulate Reduction"
5. See results instantly

---

## 🗄️ Database Setup

### Option A: Supabase Dashboard (Easiest)

**Step 1: Connect to Supabase**
```
https://app.supabase.com
```

**Step 2: Go to SQL Editor**
- Click "SQL Editor" in left menu
- Click "New Query"

**Step 3: Copy & Paste Migration**
- Open: `supabase/migrations/027_analytical_features.sql`
- Copy entire content
- Paste in SQL Editor
- Click "Run"

**Step 4: Verify**
```sql
-- Run these tests:
SELECT * FROM factor_scope_mapping LIMIT 5;
SELECT * FROM get_top_contributor(2026, 1);
```

---

### Option B: Supabase CLI (Recommended for CI/CD)

**Prerequisites:**
```bash
npm install -g supabase
```

**Deploy Migration:**
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

**Verify:**
```bash
# Check migration status
supabase migration list
```

---

### Option C: Manual SQL (Command Line)

**Using psql directly:**
```bash
# Connect to your Supabase database
psql "postgresql://user:password@host:port/database"

# Copy and paste migration SQL
\i supabase/migrations/027_analytical_features.sql
```

---

## 🏗️ Migration Verification

After running the migration, verify everything worked:

```sql
-- Check tables exist
\dt factor_scope_mapping
\dt emission_simulations

-- Check columns added
\d monthly_audit_data

-- Check functions exist
\df get_top_contributor
\df get_emission_intensity
\df get_scope_breakdown
\df simulate_emission_reduction
\df calculate_net_zero_year

-- Test each function
SELECT * FROM get_top_contributor(2026, 1);
SELECT * FROM get_factor_percentages(2026, 1);
SELECT * FROM get_emission_intensity(2026, 1);
SELECT * FROM get_scope_breakdown(2026, 1);
SELECT * FROM simulate_emission_reduction(2026, 1, '{"Electricity": 20}'::jsonb);
SELECT * FROM calculate_net_zero_year(2026, 5);
```

---

## 📦 Frontend Build

### Development Build
```bash
npm run dev
```
- Includes source maps for debugging
- Hot reload enabled
- Not optimized

### Production Build
```bash
npm run build
```
**Output:**
- `dist/` folder
- Optimized for performance
- Ready to deploy

**Check build output:**
```bash
# See what was built
ls -la dist/

# Or on Windows
dir dist/
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Easiest for React)

**Step 1: Connect Repository**
```
https://vercel.com/new
```
- Select your GitHub repository
- Select "Vite" as framework

**Step 2: Environment Variables**
Add to Vercel dashboard:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Step 3: Deploy**
- Vercel auto-deploys on Git push
- Or click "Deploy" manually

**Done!** Your app is live.

---

### Option 2: Netlify

**Step 1: Connect Repository**
```
https://netlify.com
Click: Add new site → Import an existing project
```

**Step 2: Build Settings**
```
Build command: npm run build
Publish directory: dist
```

**Step 3: Environment Variables**
```
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_anon_key
```

**Step 4: Deploy**
```bash
# Or deploy from CLI
npm install -g netlify-cli
netlify deploy
```

---

### Option 3: Docker (Self-Hosted)

**Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm ci

COPY . .

# Build
RUN npm run build

# Serve
RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build & Run:**
```bash
# Build image
docker build -t carbon-tracker .

# Run container
docker run -p 3000:3000 carbon-tracker
```

---

### Option 4: Traditional Hosting (Apache, Nginx)

**Step 1: Build**
```bash
npm run build
```

**Step 2: Deploy dist/ folder**
```bash
# Upload dist/ contents to your server
scp -r dist/ user@server:/var/www/carbon-tracker/
```

**Step 3: Configure Web Server**

**For Nginx:**
```nginx
server {
    listen 80;
    server_name carbon-tracker.example.com;
    
    root /var/www/carbon-tracker;
    
    location / {
        try_files $uri /index.html;
    }
    
    # Cache busting
    location ~* \.(js|css)$ {
        expires 1y;
    }
}
```

**For Apache:**
```apache
<Directory /var/www/carbon-tracker>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</Directory>
```

---

## ✅ Post-Deployment Checklist

### Database
- [ ] Migration ran without errors
- [ ] Tables created (`factor_scope_mapping`, `emission_simulations`)
- [ ] Columns added (`data_confidence`, `scope`)
- [ ] Functions created (7 RPC functions)
- [ ] Test queries return data

### Frontend
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] `dist/` folder created
- [ ] Files uploaded to server

### Application
- [ ] Page loads without errors
- [ ] Dashboard renders
- [ ] Charts display correctly
- [ ] Reduction simulator works
- [ ] View mode toggle functions
- [ ] No console errors
- [ ] Performance acceptable (< 3 seconds load)

### Features
- [ ] Top contributor displays
- [ ] Intensity metrics show
- [ ] Scope breakdown visible
- [ ] Net zero year displays
- [ ] Simulator calculates correctly
- [ ] Academic year view works

---

## 🧪 Testing

### Run Tests (if setup)
```bash
npm run test
```

### Manual Testing Checklist
```
Dashboard:
  ☐ Load without errors
  ☐ Select different months
  ☐ Toggle view modes
  ☐ Charts render

Features:
  ☐ Top Contributor card shows data
  ☐ CO₂ per Student displays
  ☐ Net Zero Year shows projection
  ☐ Scope breakdown pie chart renders
  ☐ Intensity metrics cards visible

Simulator:
  ☐ Can input reduction values
  ☐ Simulate button works
  ☐ Results display correctly
  ☐ Multiple factors can be reduced

Data:
  ☐ Monthly data loads
  ☐ Academic year aggregation correct
  ☐ Per-capita calculations accurate
  ☐ Percentages add to ~100%
```

---

## 🐛 Troubleshooting

### Migration Failed
```
Error: Column already exists
→ Migration has idempotent checks, safe to re-run
→ Or delete duplicate column manually

Error: Function syntax error
→ Check PostgreSQL version (need 11+)
→ Verify no typos in migration file
→ Check Supabase logs for details
```

### Dashboard Won't Load
```
Error: Cannot find useTopContributor
→ Rebuild frontend: npm run build
→ Clear browser cache (Ctrl+Shift+Delete)
→ Check browser console for more errors

Error: Query returned no data
→ Verify monthly_audit_data has entries
→ Check enrolled_students_config populated
→ Run test query in SQL editor
```

### Simulator Not Working
```
Error: RPC function not found
→ Verify migration completed
→ Run: SELECT * FROM pg_proc WHERE proname = 'simulate_emission_reduction'
→ Restart backend if hosted elsewhere

Error: Invalid JSON in reduction
→ Ensure reduction values are 0-100
→ Check browser console for error details
```

### Performance Issues
```
Dashboard loads slowly
→ Check network tab (API calls too slow?)
→ Run: ANALYZE monthly_audit_data;
→ Verify indexes created (run migration verify queries)
→ Check server resources (CPU, memory)
```

---

## 📊 Environment Variables

Create `.env.local` for local development (copy from `.env.example`):

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx

# Optional: Analytics
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

---

## 🔄 Rollback Plan

If you need to revert the changes:

### Frontend Rollback
```bash
# Revert code changes
git revert HEAD~1

# Rebuild
npm run build

# Redeploy
# (Follow same deployment steps as above)
```

### Database Rollback

**Option 1: Run Cleanup Script**
```sql
-- This is in the migration file, uncomment and run to rollback
DROP FUNCTION IF EXISTS calculate_net_zero_year CASCADE;
DROP FUNCTION IF EXISTS get_scope_breakdown CASCADE;
DROP FUNCTION IF EXISTS simulate_emission_reduction CASCADE;
DROP FUNCTION IF EXISTS get_emission_intensity CASCADE;
DROP FUNCTION IF EXISTS get_factor_percentages CASCADE;
DROP FUNCTION IF EXISTS get_top_contributor CASCADE;
DROP TABLE IF EXISTS emission_simulations CASCADE;
DROP TABLE IF EXISTS factor_scope_mapping CASCADE;
ALTER TABLE monthly_audit_data DROP COLUMN IF EXISTS data_confidence;
ALTER TABLE monthly_audit_data DROP COLUMN IF EXISTS scope;
```

**Option 2: Restore from Backup**
- Supabase keeps automatic backups
- Go to Supabase dashboard → Backups
- Restore from previous backup

---

## 📈 Monitoring

### Check Database Health
```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes 
WHERE idx_scan > 0;

-- Check function performance
SELECT proname, calls, total_time 
FROM pg_stat_user_functions 
ORDER BY total_time DESC;

-- Check table sizes
SELECT tablename, 
  pg_size_pretty(pg_total_relation_size(tablename)) 
FROM pg_tables 
WHERE tablename LIKE 'monthly_%' OR tablename LIKE 'factor_%';
```

### Frontend Monitoring
- Use browser DevTools → Network tab
- Monitor page load time
- Check for API call failures
- Watch console for errors

---

## 📝 Next Steps

After deployment:

1. **Verify All Features Work** - Run post-deployment checklist
2. **Train Users** - Share `ANALYTICAL_FEATURES_GUIDE.md`
3. **Monitor Performance** - Check logs regularly
4. **Gather Feedback** - Ask users about experience
5. **Plan Phase 2** - See enhancement ideas in guide

---

## ❓ Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run lint` | Check code quality |
| `supabase db push` | Deploy database |
| `supabase migration list` | Check migrations |

---

## Support

📖 **Full Guides:**
- `ANALYTICAL_FEATURES_GUIDE.md` - Feature documentation
- `IMPLEMENTATION_ANALYTICAL_FEATURES.md` - Technical details
- `ANALYTICAL_FEATURES_OVERVIEW.md` - Quick overview

🔧 **Code Location:**
- Database: `supabase/migrations/027_analytical_features.sql`
- Components: `src/components/`
- Dashboard: `src/pages/EnhancedDashboard.tsx`
- Hooks: `src/hooks/useSupabase.ts`

---

**Ready to deploy?**

1. ✅ Run database migration
2. ✅ Build frontend: `npm run build`
3. ✅ Deploy to your hosting
4. ✅ Verify features work
5. ✅ Celebrate! 🎉

Questions? Check the troubleshooting section above or review the documentation files.
