# Student Survey Page - Updated

## ✅ What Changed

The **Student Survey** page has been completely redesigned:

### ❌ OLD: Google Forms Integration
- Was a Google Forms link manager
- Didn't store data in database
- Required external Google Forms setup
- No direct data analysis

### ✅ NEW: Direct Student Data Collection
- **Direct database storage** - All data saved to Supabase
- **Lifestyle-based questions** - Student-friendly inputs
- **Automatic carbon calculation** - Real-time CO₂e estimation
- **Integrated analytics** - Data appears on Dashboard and History

## 📋 Survey Questions

Students now answer simple lifestyle questions:

### 🚗 Transportation
- **Travel Mode**: Walk, Bicycle, Bus, Motorcycle, Car, or Hostel
- **Distance**: Daily round-trip distance in km

### ⚡ Energy Usage
- **Device Hours**: Total hours using laptop, phone, lights, AC/fan

### 💧 Water & Waste
- **Water Usage**: Daily water consumption in liters
- **Waste**: Weekly waste generation in kg

### 📄 Paper (Optional)
- **Paper Usage**: Weekly paper consumption

## 🔄 How It Works

1. **Student fills form** with their daily habits
2. **System converts** lifestyle data to emission metrics:
   - Device hours → electricity kWh
   - Travel distance → carbon from transport
   - Water/waste → resource consumption
3. **Database calculates** total carbon using emission factors
4. **Results shown** on Dashboard (department level) and History (individual)

## 📊 Example Conversion

**Student Input:**
- Transport: Bicycle, 10 km/day
- Devices: 8 hours/day
- Water: 150 liters/day
- Waste: 2 kg/week

**Converted to:**
- `electricity_kwh`: 0.8 (8 hours × 0.1 kW)
- `travel_km`: 10
- `water_liters`: 150
- `ewaste_kg`: 2
- `paper_kg`: 0

**Database Calculates:**
- Total CO₂e using emission factors
- Carbon score (Green/Moderate/High)
- Trees needed to offset
- Personalized suggestions

## 🎯 Benefits

1. **Simpler for students** - No technical jargon
2. **More accurate** - Captures actual daily behavior
3. **Better analytics** - All data in one place
4. **Real-time insights** - Instant carbon calculation
5. **Privacy-focused** - Data stored securely

## 🚀 Usage

**For Students:**
1. Go to "Student Survey" tab
2. Select your department
3. Answer lifestyle questions
4. Submit to see your carbon footprint
5. Check "History" tab to track over time

**For Admins:**
1. Use "Data Entry" tab for official department data
2. View aggregated student data on Dashboard
3. Compare department performance

## 📈 Data Analysis

Student survey data is automatically:
- ✅ Added to department totals on Dashboard
- ✅ Visible in individual History page
- ✅ Included in monthly trends charts
- ✅ Used for per-capita calculations
- ✅ Categorized with carbon scores

---

**Next Steps:** Share the Student Survey page link with your students to start collecting data!
