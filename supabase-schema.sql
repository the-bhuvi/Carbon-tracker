-- ============================================
-- CARBON TRACKER DATABASE SCHEMA
-- ============================================
-- Copy and paste this SQL into your Supabase SQL Editor
-- Location: https://app.supabase.com/project/_/sql

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  institution_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. ADMIN FACILITY DATA TABLE
-- ============================================
CREATE TABLE admin_facility_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Section A: Indirect inputs
  classrooms INTEGER NOT NULL,
  buildings INTEGER NOT NULL,
  hostels INTEGER NOT NULL,
  canteens INTEGER NOT NULL,
  food_type TEXT CHECK (food_type IN ('vegetarian', 'non-vegetarian', 'mixed')),
  
  -- Section B: Direct inputs (monthly values)
  electricity_kwh DECIMAL(10, 2) NOT NULL,
  water_liters DECIMAL(10, 2) NOT NULL,
  waste_kg DECIMAL(10, 2) NOT NULL,
  fuel_liters DECIMAL(10, 2) NOT NULL,
  fuel_type TEXT,
  
  -- Calculated carbon footprint
  total_carbon_kg DECIMAL(10, 2),
  
  -- Metadata
  month INTEGER CHECK (month >= 1 AND month <= 12),
  year INTEGER CHECK (year >= 2020 AND year <= 2100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE admin_facility_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view own facility data" ON admin_facility_data
  FOR SELECT USING (auth.uid() = admin_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert facility data" ON admin_facility_data
  FOR INSERT WITH CHECK (
    auth.uid() = admin_id AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update own facility data" ON admin_facility_data
  FOR UPDATE USING (auth.uid() = admin_id);

-- ============================================
-- 3. STUDENT SURVEY RESPONSES TABLE
-- ============================================
CREATE TABLE student_survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Transportation
  transport_mode TEXT CHECK (transport_mode IN ('walking', 'bicycle', 'motorcycle', 'car', 'bus', 'train', 'flight')),
  distance_km DECIMAL(10, 2),
  frequency_per_week INTEGER,
  
  -- Energy consumption
  electricity_usage TEXT CHECK (electricity_usage IN ('low', 'medium', 'high')),
  heating_cooling TEXT CHECK (heating_cooling IN ('none', 'minimal', 'moderate', 'extensive')),
  
  -- Diet
  diet_type TEXT CHECK (diet_type IN ('vegan', 'vegetarian', 'pescatarian', 'meat-eater')),
  local_food_percentage INTEGER CHECK (local_food_percentage >= 0 AND local_food_percentage <= 100),
  
  -- Waste
  recycling_frequency TEXT CHECK (recycling_frequency IN ('never', 'rarely', 'sometimes', 'often', 'always')),
  plastic_usage TEXT CHECK (plastic_usage IN ('minimal', 'moderate', 'high')),
  
  -- Calculated carbon footprint
  total_carbon_kg DECIMAL(10, 2),
  
  -- Metadata
  survey_month INTEGER CHECK (survey_month >= 1 AND survey_month <= 12),
  survey_year INTEGER CHECK (survey_year >= 2020 AND survey_year <= 2100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE student_survey_responses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can view own surveys" ON student_survey_responses
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert surveys" ON student_survey_responses
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own surveys" ON student_survey_responses
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all surveys" ON student_survey_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 4. CARBON FOOTPRINT HISTORY TABLE
-- ============================================
CREATE TABLE carbon_footprint_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Data source
  data_type TEXT CHECK (data_type IN ('facility', 'student_survey')) NOT NULL,
  reference_id UUID, -- Links to admin_facility_data or student_survey_responses
  
  -- Carbon breakdown
  transport_carbon_kg DECIMAL(10, 2),
  energy_carbon_kg DECIMAL(10, 2),
  waste_carbon_kg DECIMAL(10, 2),
  food_carbon_kg DECIMAL(10, 2),
  total_carbon_kg DECIMAL(10, 2) NOT NULL,
  
  -- Time period
  period_month INTEGER CHECK (period_month >= 1 AND period_month <= 12),
  period_year INTEGER CHECK (period_year >= 2020 AND period_year <= 2100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE carbon_footprint_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own history" ON carbon_footprint_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert history" ON carbon_footprint_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all history" ON carbon_footprint_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 5. CARBON REDUCTION GOALS TABLE
-- ============================================
CREATE TABLE carbon_reduction_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  target_reduction_percentage DECIMAL(5, 2) NOT NULL,
  baseline_carbon_kg DECIMAL(10, 2) NOT NULL,
  target_carbon_kg DECIMAL(10, 2) NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  status TEXT CHECK (status IN ('active', 'completed', 'failed')) DEFAULT 'active',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE carbon_reduction_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own goals" ON carbon_reduction_goals
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_admin_facility_data_admin_id ON admin_facility_data(admin_id);
CREATE INDEX idx_admin_facility_data_month_year ON admin_facility_data(year, month);

CREATE INDEX idx_student_survey_student_id ON student_survey_responses(student_id);
CREATE INDEX idx_student_survey_month_year ON student_survey_responses(survey_year, survey_month);

CREATE INDEX idx_carbon_history_user_id ON carbon_footprint_history(user_id);
CREATE INDEX idx_carbon_history_period ON carbon_footprint_history(period_year, period_month);
CREATE INDEX idx_carbon_history_data_type ON carbon_footprint_history(data_type);

CREATE INDEX idx_goals_user_id ON carbon_reduction_goals(user_id);
CREATE INDEX idx_goals_status ON carbon_reduction_goals(status);

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_facility_data_updated_at BEFORE UPDATE ON admin_facility_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_survey_updated_at BEFORE UPDATE ON student_survey_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON carbon_reduction_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. SAMPLE DATA (OPTIONAL - for testing)
-- ============================================

-- Uncomment to insert sample data
/*
-- Insert a test admin profile (after creating an auth user)
INSERT INTO profiles (id, email, full_name, role, institution_name)
VALUES 
  ('your-auth-user-id-here', 'admin@example.com', 'Admin User', 'admin', 'Test University');

-- Insert sample facility data
INSERT INTO admin_facility_data (
  admin_id, classrooms, buildings, hostels, canteens, food_type,
  electricity_kwh, water_liters, waste_kg, fuel_liters, fuel_type,
  total_carbon_kg, month, year
) VALUES (
  'your-auth-user-id-here', 50, 10, 5, 2, 'mixed',
  15000.00, 50000.00, 1500.00, 500.00, 'diesel',
  8500.00, 1, 2026
);
*/

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Update your .env file with:
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_ANON_KEY
-- 3. Enable Email Auth in Supabase Dashboard:
--    Authentication > Providers > Email
-- 4. (Optional) Configure email templates
-- ============================================
