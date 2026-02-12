# Quick Reference: Formulas & Authentication

## 🧮 Carbon Calculation Formulas (Summary)

### Admin Facility Emissions

| Category | Formula | Factor |
|----------|---------|--------|
| **Classrooms** | Classrooms × 500 | 500 kg CO₂e/classroom/year |
| **Buildings** | Buildings × 2000 | 2000 kg CO₂e/building/year |
| **Hostels** | Hostels × 3000 | 3000 kg CO₂e/hostel/year |
| **Canteens** | Canteens × 1500 × Food Type | 1500 kg CO₂e/canteen/year |
| **Electricity** | kWh × 0.82 | 0.82 kg CO₂e/kWh |
| **Water** | (Liters ÷ 1000) × 0.298 | 0.298 kg CO₂e/1000L |
| **Waste** | kg × 0.5 | 0.5 kg CO₂e/kg |
| **Fuel** | Liters × 2.68 | 2.68 kg CO₂e/liter |

**Food Type Multipliers:**
- Vegetarian: 0.5
- Mixed: 1.0
- Non-vegetarian: 1.5

### Student Personal Emissions

| Category | Formula | Notes |
|----------|---------|-------|
| **Transport** | Mode Factor × km × trips/week × 52 | Annual emissions |
| **Electricity** | Usage Level Factor | Low: 300, Medium: 600, High: 1200 kg/year |
| **Heating/Cooling** | Usage Level Factor | None: 0, Minimal: 200, Moderate: 500, Extensive: 1000 kg/year |
| **Diet** | Base Diet × (1 - Local Food %) | Vegan: 1500, Vegetarian: 1700, Pescatarian: 1900, Meat: 2500 kg/year |
| **Waste** | Plastic Factor × Recycling Multiplier | Plastic: 50-300 kg/year |

**Transport Factors (kg CO₂e per km):**
- Walking: 0
- Bicycle: 0
- Motorcycle: 0.1
- Car: 0.192
- Bus: 0.089
- Train: 0.041
- Flight: 0.255

**Recycling Multipliers:**
- Never: 1.0 (no reduction)
- Rarely: 0.9 (10% reduction)
- Sometimes: 0.75 (25% reduction)
- Often: 0.5 (50% reduction)
- Always: 0.25 (75% reduction)

---

## 🔐 Authentication Flow

### 1. User Signup
```
User Form → Supabase Auth → Create User → Trigger → Create Profile → Update Role
```

**Code:**
```typescript
await signUp(email, password, fullName, 'admin' or 'student');
```

### 2. User Login
```
User Credentials → Supabase Auth → Verify → Return JWT Token → Fetch Role → Store Session
```

**Code:**
```typescript
await signIn(email, password);
```

### 3. Session Check
```
App Load → Check Session → Get User → Fetch Role from profiles → Set Auth State
```

**Code:**
```typescript
const { user, userRole } = useAuth();
```

### 4. Protected Actions
```
User Action → Check if Logged In → Check Role → Execute or Deny
```

**Code:**
```typescript
if (!user) return error("Login required");
if (userRole !== 'admin') return error("Admin only");
// Proceed with action
```

### 5. Logout
```
User Clicks Logout → Clear Session → Clear Local State → Redirect to Login
```

**Code:**
```typescript
await signOut();
```

---

## 🗄️ Database Security (RLS)

### Row Level Security Policies

**Profiles:**
- ✅ Users can view/update their own profile
- ✅ Users can't see other profiles

**Admin Facility Data:**
- ✅ Admins can insert their own data
- ✅ Admins can view their own data
- ❌ Students can't access facility data

**Student Surveys:**
- ✅ Students can view/insert their own surveys
- ✅ Admins can view all surveys
- ❌ Students can't see other student surveys

**Carbon History:**
- ✅ Users can view their own history
- ✅ Users can insert their own records
- ✅ Admins can view all history

---

## 📱 Page Access Control

| Page | Public | Student | Admin |
|------|--------|---------|-------|
| `/` Dashboard | ✅ | ✅ | ✅ |
| `/auth` Login/Signup | ✅ | - | - |
| `/admin` Facility Input | ❌ | ❌ | ✅ |
| `/survey` Survey Info | ✅ | ✅ | ✅ |
| `/survey/form` Take Survey | ❌ | ✅ | ✅ |
| `/history` View History | ❌ | ✅ | ✅ |

---

## 🔢 Example Calculations

### Example 1: Small Campus (Admin)
**Inputs:**
- 20 classrooms, 5 buildings, 2 hostels, 1 canteen (vegetarian)
- 8000 kWh electricity, 20000L water, 800kg waste, 200L fuel

**Calculation:**
```
Classrooms:   20 × 500     = 10,000 kg
Buildings:    5 × 2000     = 10,000 kg
Hostels:      2 × 3000     = 6,000 kg
Food:         (1 × 1500) × 0.5 = 750 kg
Electricity:  8000 × 0.82  = 6,560 kg
Water:        (20000÷1000) × 0.298 = 5.96 kg
Waste:        800 × 0.5    = 400 kg
Fuel:         200 × 2.68   = 536 kg

Total: 34,251.96 kg = 34.25 tons CO₂e
```

### Example 2: Eco-Conscious Student
**Inputs:**
- Bicycle, 5 km, 5 days/week
- Low electricity, No heating/cooling
- Vegan diet, 80% local food
- Always recycles, Minimal plastic

**Calculation:**
```
Transport:  0 × 5 × 5 × 52           = 0 kg
Energy:     300 + 0                  = 300 kg
Food:       1500 × (1 - 0.12)       = 1,320 kg
Waste:      50 × 0.25                = 12.5 kg

Total: 1,632.5 kg = 1.63 tons CO₂e/year
```

### Example 3: High-Impact Student
**Inputs:**
- Car, 15 km, 5 days/week
- High electricity, Extensive heating/cooling
- Meat-eater diet, 10% local food
- Rarely recycles, High plastic

**Calculation:**
```
Transport:  0.192 × 15 × 5 × 52     = 748.8 kg
Energy:     1200 + 1000              = 2,200 kg
Food:       2500 × (1 - 0.015)      = 2,462.5 kg
Waste:      300 × 0.9                = 270 kg

Total: 5,681.3 kg = 5.68 tons CO₂e/year
```

---

## 🎯 Quick Code Snippets

### Check if User is Admin
```typescript
const { user, userRole } = useAuth();
const isAdmin = userRole === 'admin';
```

### Save Facility Data
```typescript
const result = await saveAdminFacilityData({
  classrooms: 50,
  buildings: 10,
  // ... other fields
  total_carbon_kg: calculatedTotal,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
});
```

### Calculate Transport Emissions
```typescript
const annualEmissions = transportFactor * distance * frequency * 52;
```

### Format Carbon Output
```typescript
const tons = (carbonKg / 1000).toFixed(2);
console.log(`${tons} tons CO₂e`);
```

---

## 📊 Conversion Reference

```
1 kg CO₂e = 0.001 tons CO₂e
1 ton CO₂e = 1,000 kg CO₂e

To convert annual to monthly: Annual ÷ 12
To convert weekly to annual: Weekly × 52
To convert daily to annual: Daily × 365
```

---

## 🔗 File Locations

- **Formulas**: [FORMULAS_AND_AUTH.md](FORMULAS_AND_AUTH.md) (detailed)
- **Admin Calculations**: [src/pages/AdminInput.tsx](src/pages/AdminInput.tsx)
- **Student Calculations**: [src/pages/StudentSurveyForm.tsx](src/pages/StudentSurveyForm.tsx)
- **Auth Context**: [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- **API Functions**: [src/lib/api.ts](src/lib/api.ts)
- **Database Schema**: [supabase-schema.sql](supabase-schema.sql)

---

**Need more details?** See [FORMULAS_AND_AUTH.md](FORMULAS_AND_AUTH.md) for complete documentation.
