# Deployment Quick Guide - Visual Summary

## 🎯 5-Minute Deployment Overview

### Timeline
```
Local Testing (5 min)
        ↓
Deploy Database (2 min)
        ↓
Build Frontend (1 min)
        ↓
Deploy to Hosting (5 min)
        ↓
Verify (5 min)
═══════════════════════════════
Total: ~20 minutes
```

---

## 📋 The 3 Commands You Need

### 1️⃣ Deploy Database
**Via Supabase Dashboard:**
```
Login → SQL Editor → New Query → Paste Migration → Run
```

**Via CLI:**
```bash
supabase db push
```

### 2️⃣ Build Frontend
```bash
npm run build
```

### 3️⃣ Deploy to Hosting
**Vercel (Easiest):**
```
git push → Auto-deploys ✨
```

**Or upload `dist/` folder to your server**

---

## ✅ Deployment Checklist

```
DATABASE
☐ Migration runs without errors
☐ Test query works: SELECT * FROM get_top_contributor(2026, 1);

FRONTEND  
☐ npm run build succeeds
☐ dist/ folder created

APPLICATION
☐ Page loads
☐ Dashboard renders
☐ Charts work
☐ Simulator responds

FEATURES
☐ Top Contributor displays
☐ CO₂ per Student shows
☐ Net Zero Year visible
☐ Scope breakdown works
☐ Reduction Simulator functional
☐ View mode toggle works
```

---

## 🚀 Deploy to Different Platforms

### Vercel (Best for React)
```
1. Go to vercel.com/new
2. Select your GitHub repo
3. Add env variables
4. Click Deploy
5. Done! (Auto-deploys on git push)
```

### Netlify
```
1. netlify.com → New site
2. Connect GitHub
3. Build: npm run build, Publish: dist
4. Add env variables
5. Deploy
```

### Your Own Server
```
1. npm run build
2. scp dist/ to server
3. Configure Nginx/Apache
4. Done!
```

---

## 📊 Project Structure

```
carbon-tracker/
├── supabase/
│   └── migrations/
│       └── 027_analytical_features.sql ← Run this
├── src/
│   ├── pages/
│   │   └── EnhancedDashboard.tsx ← New dashboard
│   ├── components/
│   │   ├── ConfidenceIndicator.tsx
│   │   ├── ReductionSimulator.tsx
│   │   └── EmissionIntensityCards.tsx
│   ├── hooks/
│   │   └── useSupabase.ts (updated)
│   ├── lib/
│   │   └── supabase/
│   │       └── api.ts (updated)
│   └── types/
│       └── database.ts (updated)
├── package.json
├── vite.config.ts
└── RUN_AND_DEPLOY.md ← You are here
```

---

## 🧪 Quick Test Commands

```bash
# Local testing
npm run dev

# Build check
npm run build

# Database test (in Supabase SQL editor)
SELECT * FROM get_top_contributor(2026, 1);
SELECT * FROM get_emission_intensity(2026, 1);
```

---

## 🆘 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Migration fails | Re-run (idempotent). Check migration file syntax. |
| Dashboard won't load | Clear cache. Check console. Rebuild frontend. |
| No data showing | Verify monthly_audit_data has entries. |
| Simulator broken | Check RPC function exists. Restart server. |
| Slow performance | Run indexes. Check server resources. |

---

## 📚 Documentation Files

```
📖 ANALYTICAL_FEATURES_OVERVIEW.md      Quick overview
📖 ANALYTICAL_FEATURES_GUIDE.md         Complete user guide  
📖 RUN_AND_DEPLOY.md                   Deployment instructions
📖 IMPLEMENTATION_ANALYTICAL_FEATURES.md Technical details
📖 DEPLOY_ANALYTICAL_FEATURES.md        Quick deployment
```

---

## 🎯 Success Indicators

✅ Dashboard loads  
✅ Charts render  
✅ Simulator works  
✅ No console errors  
✅ Performance acceptable  
✅ All features functional  

---

## 🚀 You're Ready!

Follow the **3 Commands** above and you're done in 20 minutes.

Need help? Check **RUN_AND_DEPLOY.md** for detailed instructions.
