# Carbon Calculation Formulas & Authentication Guide

## 🧮 Carbon Emission Calculation Formulas

### Admin Facility Calculations

#### Emission Factors (kg CO₂e)

```javascript
const emissionFactors = {
  // Infrastructure (per unit per year)
  classroom: 500,           // kg CO₂e per classroom per year
  building: 2000,           // kg CO₂e per building per year
  hostel: 3000,             // kg CO₂e per hostel per year
  canteen: 1500,            // kg CO₂e per canteen per year
  
  // Food type multipliers
  foodVeg: 0.5,            // 50% of base canteen emissions
  foodMixed: 1.0,          // 100% of base canteen emissions
  foodNonVeg: 1.5,         // 150% of base canteen emissions
  
  // Direct consumption (per unit)
  electricity: 0.82,        // kg CO₂e per kWh
  water: 0.298,            // kg CO₂e per 1000 liters
  waste: 0.5,              // kg CO₂e per kg of waste
  fuel: 2.68               // kg CO₂e per liter (diesel)
};
```

#### Calculation Steps

**1. Infrastructure Emissions (Indirect)**
```
Classroom Emissions = Number of Classrooms × 500
Building Emissions  = Number of Buildings × 2000
Hostel Emissions    = Number of Hostels × 3000
Canteen Emissions   = Number of Canteens × 1500
```

**2. Food Emissions**
```
Food Multiplier = {
  Vegetarian: 0.5,
  Mixed: 1.0,
  Non-vegetarian: 1.5
}

Food Emissions = Canteen Emissions × Food Multiplier
```

**3. Direct Emissions**
```
Electricity Emissions = Electricity (kWh) × 0.82
Water Emissions      = (Water (liters) / 1000) × 0.298
Waste Emissions      = Waste (kg) × 0.5
Fuel Emissions       = Fuel (liters) × 2.68
```

**4. Total Campus Emissions**
```
Total = Classroom Emissions + Building Emissions + Hostel Emissions 
      + Food Emissions + Electricity Emissions + Water Emissions 
      + Waste Emissions + Fuel Emissions
```

#### Example Calculation

**Inputs:**
- Classrooms: 50
- Buildings: 10
- Hostels: 5
- Canteens: 2
- Food Type: Mixed
- Electricity: 15000 kWh
- Water: 50000 liters
- Waste: 1500 kg
- Fuel: 500 liters

**Calculations:**
```
Classrooms:   50 × 500    = 25,000 kg CO₂e
Buildings:    10 × 2000   = 20,000 kg CO₂e
Hostels:      5 × 3000    = 15,000 kg CO₂e
Canteens:     2 × 1500    = 3,000 kg CO₂e
Food:         3000 × 1.0  = 3,000 kg CO₂e (mixed)
Electricity:  15000 × 0.82 = 12,300 kg CO₂e
Water:        (50000/1000) × 0.298 = 14.9 kg CO₂e
Waste:        1500 × 0.5  = 750 kg CO₂e
Fuel:         500 × 2.68  = 1,340 kg CO₂e

Total:        80,404.9 kg CO₂e = 80.4 tons CO₂e
```

---

### Student Survey Calculations

#### Emission Factors (kg CO₂e per year)

```javascript
// Transportation (kg CO₂e per km)
const transportEmissions = {
  walking: 0,
  bicycle: 0,
  motorcycle: 0.1,
  car: 0.192,
  bus: 0.089,
  train: 0.041,
  flight: 0.255
};

// Electricity usage (kg CO₂e per year)
const electricityEmissions = {
  low: 300,
  medium: 600,
  high: 1200
};

// Heating/Cooling (kg CO₂e per year)
const heatingCoolingEmissions = {
  none: 0,
  minimal: 200,
  moderate: 500,
  extensive: 1000
};

// Diet type (kg CO₂e per year)
const dietEmissions = {
  vegan: 1500,
  vegetarian: 1700,
  pescatarian: 1900,
  'meat-eater': 2500
};

// Plastic usage (kg CO₂e per year)
const plasticEmissions = {
  minimal: 50,
  moderate: 150,
  high: 300
};

// Recycling frequency reduction multipliers
const recyclingReduction = {
  never: 1.0,      // No reduction
  rarely: 0.9,     // 10% reduction
  sometimes: 0.75, // 25% reduction
  often: 0.5,      // 50% reduction
  always: 0.25     // 75% reduction
};
```

#### Calculation Steps

**1. Transportation Emissions**
```
Annual Transport CO₂ = Transport Mode Factor (kg/km) 
                     × Distance (km) 
                     × Frequency (trips/week) 
                     × 52 weeks

Example:
Car: 0.192 × 10 km × 5 trips/week × 52 = 499.2 kg CO₂e/year
```

**2. Energy Emissions**
```
Energy CO₂ = Electricity Usage Factor + Heating/Cooling Factor

Example:
Medium electricity (600) + Moderate heating (500) = 1,100 kg CO₂e/year
```

**3. Food Emissions**
```
Local Food Reduction = (Local Food % / 100) × 0.15

Food CO₂ = Base Diet Emissions × (1 - Local Food Reduction)

Example:
Vegetarian diet (1700) with 50% local food:
Reduction = (50/100) × 0.15 = 0.075 (7.5%)
Food CO₂ = 1700 × (1 - 0.075) = 1,572.5 kg CO₂e/year
```

**4. Waste Emissions**
```
Waste CO₂ = Plastic Usage Factor × Recycling Multiplier

Example:
Moderate plastic (150) with "often" recycling (0.5):
Waste CO₂ = 150 × 0.5 = 75 kg CO₂e/year
```

**5. Total Personal Emissions**
```
Total = Transport CO₂ + Energy CO₂ + Food CO₂ + Waste CO₂
```

#### Complete Student Example

**Inputs:**
- Transport: Bus, 10 km, 5 days/week
- Electricity: Medium
- Heating/Cooling: Moderate
- Diet: Vegetarian
- Local Food: 50%
- Recycling: Often
- Plastic: Moderate

**Calculations:**
```
Transport:  0.089 × 10 × 5 × 52           = 231.4 kg CO₂e
Energy:     600 + 500                      = 1,100 kg CO₂e
Food:       1700 × (1 - 0.075)            = 1,572.5 kg CO₂e
Waste:      150 × 0.5                      = 75 kg CO₂e

Total:      2,978.9 kg CO₂e/year ≈ 3.0 tons CO₂e/year
```

---

## 🔐 Authentication Flow

### Supabase Authentication Setup

#### 1. User Signup Process

```typescript
// Function: signUp()
async signUp(email, password, fullName, role: 'admin' | 'student') {
  // Step 1: Create auth user in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  // Step 2: Update profile with role
  await supabase
    .from('profiles')
    .update({ role, full_name: fullName })
    .eq('id', data.user.id);
}
```

**Flow:**
1. User submits signup form with email, password, name, and role
2. Supabase creates user in `auth.users` table
3. Trigger automatically creates profile in `profiles` table
4. Role is updated in `profiles` table
5. Confirmation email sent (if enabled)

#### 2. User Login Process

```typescript
// Function: signIn()
async signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
}
```

**Flow:**
1. User enters email and password
2. Supabase verifies credentials
3. Returns session token (JWT)
4. AuthContext stores user and session
5. User role fetched from `profiles` table
6. User redirected to dashboard

#### 3. Session Management

```typescript
// On app load
useEffect(() => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    if (session?.user) {
      fetchUserRole(session.user.id);
    }
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**Flow:**
- Session stored in localStorage (automatic)
- Session refreshed automatically before expiry
- Auth state listeners update UI in real-time
- User role fetched and cached

#### 4. Logout Process

```typescript
// Function: signOut()
async signOut() {
  const { error } = await supabase.auth.signOut();
  setUserRole(null);
}
```

**Flow:**
1. User clicks logout
2. Supabase clears session
3. Local state cleared
4. User redirected to login

### Row Level Security (RLS) Policies

#### Profiles Table
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### Admin Facility Data
```sql
-- Admins can view their own facility data
CREATE POLICY "Admins can view own facility data" ON admin_facility_data
  FOR SELECT USING (
    auth.uid() = admin_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert facility data
CREATE POLICY "Admins can insert facility data" ON admin_facility_data
  FOR INSERT WITH CHECK (
    auth.uid() = admin_id AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### Student Survey Responses
```sql
-- Students can view their own surveys
CREATE POLICY "Students can view own surveys" ON student_survey_responses
  FOR SELECT USING (auth.uid() = student_id);

-- Admins can view all surveys
CREATE POLICY "Admins can view all surveys" ON student_survey_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### Protected Routes Implementation

```typescript
// In components that require auth
const { user, userRole } = useAuth();

// Check if user is logged in
if (!user) {
  toast({
    title: "Authentication Required",
    description: "Please log in to access this feature.",
    variant: "destructive"
  });
  return;
}

// Check if user has correct role
if (userRole !== 'admin') {
  toast({
    title: "Admin Access Required",
    description: "Only admins can access this feature.",
    variant: "destructive"
  });
  return;
}
```

---

## 📊 Data Storage Structure

### Admin Facility Data Record
```typescript
{
  id: "uuid",
  admin_id: "user-uuid",
  classrooms: 50,
  buildings: 10,
  hostels: 5,
  canteens: 2,
  food_type: "mixed",
  electricity_kwh: 15000.00,
  water_liters: 50000.00,
  waste_kg: 1500.00,
  fuel_liters: 500.00,
  fuel_type: "diesel",
  total_carbon_kg: 80404.90,
  month: 2,
  year: 2026,
  created_at: "2026-02-12T10:30:00Z",
  updated_at: "2026-02-12T10:30:00Z"
}
```

### Student Survey Response Record
```typescript
{
  id: "uuid",
  student_id: "user-uuid",
  transport_mode: "bus",
  distance_km: 10.00,
  frequency_per_week: 5,
  electricity_usage: "medium",
  heating_cooling: "moderate",
  diet_type: "vegetarian",
  local_food_percentage: 50,
  recycling_frequency: "often",
  plastic_usage: "moderate",
  total_carbon_kg: 2978.90,
  survey_month: 2,
  survey_year: 2026,
  created_at: "2026-02-12T10:30:00Z",
  updated_at: "2026-02-12T10:30:00Z"
}
```

### Carbon History Record
```typescript
{
  id: "uuid",
  user_id: "user-uuid",
  data_type: "student_survey", // or "facility"
  reference_id: "survey-uuid",
  transport_carbon_kg: 231.40,
  energy_carbon_kg: 1100.00,
  waste_carbon_kg: 75.00,
  food_carbon_kg: 1572.50,
  total_carbon_kg: 2978.90,
  period_month: 2,
  period_year: 2026,
  created_at: "2026-02-12T10:30:00Z"
}
```

---

## 🔍 API Functions Reference

### Authentication
```typescript
// Sign up new user
await signUp(email, password, fullName, role);

// Sign in existing user
await signIn(email, password);

// Sign out current user
await signOut();
```

### Data Operations
```typescript
// Save admin facility data
await saveAdminFacilityData({
  classrooms, buildings, hostels, canteens,
  food_type, electricity_kwh, water_liters,
  waste_kg, fuel_liters, total_carbon_kg,
  month, year
});

// Save student survey
await saveStudentSurvey({
  transport_mode, distance_km, frequency_per_week,
  electricity_usage, heating_cooling, diet_type,
  local_food_percentage, recycling_frequency,
  plastic_usage, total_carbon_kg, survey_month, survey_year
});

// Save to carbon history
await saveCarbonHistory(data_type, reference_id, {
  transport_carbon_kg, energy_carbon_kg,
  waste_carbon_kg, food_carbon_kg,
  total_carbon_kg, period_month, period_year
});

// Get carbon history
const history = await getCarbonHistory(limit);

// Get aggregated stats
const stats = await getAggregatedStats();
```

---

## 📖 Reference Sources

### Emission Factors Based On:
- **Electricity**: EPA (0.82 kg CO₂e per kWh) - US grid average
- **Transportation**: UK DEFRA conversion factors
- **Diet**: Oxford study on dietary carbon footprints
- **Water**: Water footprint network estimates
- **Waste**: EPA waste emission factors

### Standard Calculation Period
- **Admin Data**: Monthly or annual basis
- **Student Data**: Annual emissions calculated from weekly patterns
- **History**: Monthly aggregations for tracking

---

## 🎯 Converting to Metric Tons

```javascript
// Convert kg to metric tons
const tons = kilograms / 1000;

// Display formatting
const formatted = `${(kg / 1000).toFixed(2)} tons CO₂e`;
```

---

## 💡 Customization Tips

### Adjusting Emission Factors
Edit emission factors in:
- **Admin**: [src/pages/AdminInput.tsx](src/pages/AdminInput.tsx) line 60-75
- **Student**: [src/pages/StudentSurveyForm.tsx](src/pages/StudentSurveyForm.tsx) line 72-115

### Adding New Data Points
1. Update database schema in Supabase
2. Update TypeScript types in `database.types.ts`
3. Add form fields in respective pages
4. Include in calculation formulas
5. Update API functions

### Regional Customization
- Adjust electricity emission factor for your country's grid
- Update transportation factors based on local vehicle types
- Modify food emissions for regional diet patterns
