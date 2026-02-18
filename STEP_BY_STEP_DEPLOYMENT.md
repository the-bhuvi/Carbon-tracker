# Step-by-Step Deployment Walkthrough

## 🎬 Complete Visual Guide

---

## STEP 1: Deploy Database (2 minutes)

### Option A: Supabase Dashboard (Easiest)

**1. Open Supabase**
```
https://app.supabase.com → Your Project
```

**2. Go to SQL Editor**
```
Left Menu → SQL Editor → New Query
```

**3. Copy Migration**
```
Open: supabase/migrations/027_analytical_features.sql
Copy: All content (Ctrl+A, Ctrl+C)
```

**4. Paste in Editor**
```
Click in SQL editor → Paste (Ctrl+V)
```

**5. Run Migration**
```
Click "Run" button (top right)
Watch: "Success" notification appears
```

**6. Verify**
```
Run this test query:
SELECT * FROM factor_scope_mapping LIMIT 1;

Expected: Returns 1-2 rows ✅
```

---

### Option B: Supabase CLI

**1. Install & Login**
```bash
npm install -g supabase
supabase login
```

**2. Link Project**
```bash
supabase link --project-ref YOUR_PROJECT_ID
# Find YOUR_PROJECT_ID in Supabase dashboard URL
```

**3. Deploy**
```bash
supabase db push
# Runs all pending migrations
```

**4. Check Status**
```bash
supabase migration list
# Should show 027_analytical_features as "Deployed"
```

---

## STEP 2: Build Frontend (1 minute)

**In your terminal:**

```bash
# Navigate to project
cd E:\Carbon-tracker

# Build for production
npm run build

# Wait for: "built in X.XXs" message
# Check: dist/ folder created with files
```

**Expected output:**
```
✓ 1234 modules transformed
✓ built in 2.45s
```

---

## STEP 3: Deploy to Hosting

### 🔷 Option 1: Vercel (Recommended - Easiest)

**1. Go to Vercel**
```
https://vercel.com/new
```

**2. Connect GitHub**
```
Select your carbon-tracker repository
Choose main branch
```

**3. Configure Build**
```
Framework: Vite ✓
Build Command: npm run build ✓
Output Directory: dist ✓
```

**4. Add Environment Variables**
```
VITE_SUPABASE_URL → Your Supabase URL
VITE_SUPABASE_ANON_KEY → Your Anon Key
```

**5. Click Deploy**
```
Wait for: "Deployment Successful" ✓
Your app is now live!
```

**Done!** 🎉
Every git push auto-deploys automatically.

---

### 🔷 Option 2: Netlify

**1. Go to Netlify**
```
https://netlify.com
```

**2. Click "Add new site" → "Import an existing project"**
```
Select GitHub → Select your repo
```

**3. Build Settings**
```
Build command: npm run build
Publish directory: dist
```

**4. Deploy Settings**
```
Add Env Variables:
VITE_SUPABASE_URL = xxx
VITE_SUPABASE_ANON_KEY = xxx
```

**5. Deploy**
```
Click "Deploy site"
Wait for completion
```

**Done!** Your app is live at `xxx.netlify.app`

---

### 🔷 Option 3: Traditional Server (Nginx)

**1. Build**
```bash
npm run build
```

**2. Upload Files**
```bash
# Copy dist/ folder to your server
scp -r dist/ user@yourserver.com:/var/www/carbon-tracker/
```

**3. Configure Nginx**

Create `/etc/nginx/sites-available/carbon-tracker`:
```nginx
server {
    listen 80;
    server_name carbon-tracker.example.com;
    
    root /var/www/carbon-tracker;
    index index.html;
    
    # React Router: redirect to index.html for all routes
    location / {
        try_files $uri /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**4. Enable & Start**
```bash
sudo ln -s /etc/nginx/sites-available/carbon-tracker \
           /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl restart nginx
```

**Done!** App live at `carbon-tracker.example.com`

---

### 🔷 Option 4: Docker

**1. Create Dockerfile**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**2. Build Image**
```bash
docker build -t carbon-tracker:latest .
```

**3. Run Container**
```bash
docker run -p 3000:3000 carbon-tracker:latest
```

**4. Access**
```
http://localhost:3000
```

---

## STEP 4: Verify Deployment (5 minutes)

### Check Database
```sql
-- In Supabase SQL Editor, run:
SELECT * FROM get_top_contributor(2026, 1);
```
✅ Returns: factor_name, total_co2e_kg, percentage_contribution

---

### Check Frontend

**1. Open Your App**
```
Your deployed URL
```

**2. Check Dashboard Loads**
```
✅ No errors
✅ Page renders
✅ No blank page
```

**3. Test Features**
```
✅ Click "Monthly View" toggle
✅ Select a month
✅ Charts appear
✅ Metrics display
```

**4. Test Simulator**
```
✅ Scroll to Reduction Simulator
✅ Enter reduction value (e.g., 20)
✅ Click "Simulate Reduction"
✅ Results appear
```

**5. Check Console**
```
✅ No red errors
✅ No network failures
✅ API calls successful
```

---

## STEP 5: Performance Check

### Load Time
```
✅ Dashboard loads < 3 seconds
✅ Charts render < 500ms
✅ Simulator responds instantly
```

### Check in Browser
```
F12 → Network tab
Refresh page
Watch waterfall chart
Total time should be < 3 seconds
```

---

## 🎉 You're Done!

**Summary:**
```
✅ Database migrated
✅ Frontend built
✅ App deployed
✅ Features verified
✅ Performance checked
```

Your Campus Carbon Tracking System is now enhanced and live! 🌱

---

## 📱 After Deployment

### Share with Users
1. Send link to dashboard
2. Share `ANALYTICAL_FEATURES_GUIDE.md` with them
3. Train on new features:
   - Top contributor identification
   - Reduction simulator usage
   - Academic year view toggle
   - Net zero projections

### Monitor
1. Check app performance weekly
2. Review error logs
3. Gather user feedback
4. Plan Phase 2 enhancements

### Maintenance
1. Keep dependencies updated
2. Backup database regularly
3. Monitor database growth
4. Update emission factors quarterly

---

## 🆘 If Something Goes Wrong

### Dashboard Won't Load
```
1. Check browser console (F12)
2. Look for red errors
3. Check deployment logs
4. Verify env variables set
5. Try clearing cache (Ctrl+Shift+Delete)
```

### Database Queries Fail
```
1. Verify migration completed
2. Run test query in Supabase editor
3. Check function names spelled correctly
4. Check RLS policies aren't blocking
```

### Simulator Broken
```
1. Check browser console
2. Verify RPC function exists
3. Check input values (0-100)
4. Restart development server
```

---

## 📞 Need More Help?

📖 **Full Documentation:**
- `RUN_AND_DEPLOY.md` - Detailed instructions
- `ANALYTICAL_FEATURES_GUIDE.md` - Feature usage
- `IMPLEMENTATION_ANALYTICAL_FEATURES.md` - Technical details

💻 **Source Code:**
- Database: `supabase/migrations/027_analytical_features.sql`
- Dashboard: `src/pages/EnhancedDashboard.tsx`
- Components: `src/components/`
- Hooks: `src/hooks/useSupabase.ts`

---

**Congratulations! Your deployment is complete! 🚀**

Next: Gather feedback and plan Phase 2 enhancements.
