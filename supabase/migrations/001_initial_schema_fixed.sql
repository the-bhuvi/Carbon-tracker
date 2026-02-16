-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1️⃣ Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  building_area DECIMAL(10, 2),
  student_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2️⃣ Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student', 'faculty')),
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3️⃣ Create Emission Factors Table (FIXED - only one row allowed)
CREATE TABLE IF NOT EXISTS emission_factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  electricity_factor DECIMAL(10, 4) DEFAULT 0.82,
  diesel_factor DECIMAL(10, 4) DEFAULT 2.68,
  petrol_factor DECIMAL(10, 4) DEFAULT 2.31,
  lpg_factor DECIMAL(10, 4) DEFAULT 2.98,
  png_factor DECIMAL(10, 4) DEFAULT 2.75,
  travel_factor DECIMAL(10, 4) DEFAULT 0.12,
  water_factor DECIMAL(10, 4) DEFAULT 0.0003,
  ewaste_factor DECIMAL(10, 4) DEFAULT 1.5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint to ensure only one row (corrected)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'single_row_emission_factors'
  ) THEN
    ALTER TABLE emission_factors ADD CONSTRAINT single_row_emission_factors CHECK ((SELECT COUNT(*) FROM emission_factors) <= 1);
  END IF;
END $$;

-- 4️⃣ Create Carbon Submissions Table
CREATE TABLE IF NOT EXISTS carbon_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Energy Metrics
  electricity_kwh DECIMAL(10, 2) DEFAULT 0,
  diesel_liters DECIMAL(10, 2) DEFAULT 0,
  petrol_liters DECIMAL(10, 2) DEFAULT 0,
  lpg_kg DECIMAL(10, 2) DEFAULT 0,
  png_cubic_meters DECIMAL(10, 2) DEFAULT 0,
  
  -- Transportation Metrics
  travel_km DECIMAL(10, 2) DEFAULT 0,
  
  -- Resource Metrics
  water_liters DECIMAL(10, 2) DEFAULT 0,
  ewaste_kg DECIMAL(10, 2) DEFAULT 0,
  paper_kg DECIMAL(10, 2) DEFAULT 0,
  plastic_kg DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculated Fields
  total_carbon_kg DECIMAL(10, 2) DEFAULT 0,
  carbon_score TEXT CHECK (carbon_score IN ('Green', 'Moderate', 'High')),
  
  -- Suggestions
  suggestions TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5️⃣ Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_carbon_submissions_user_id ON carbon_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_submissions_department_id ON carbon_submissions(department_id);
CREATE INDEX IF NOT EXISTS idx_carbon_submissions_date ON carbon_submissions(submission_date);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 6️⃣ Create Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS departments_updated_at ON departments;
CREATE TRIGGER departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS carbon_submissions_updated_at ON carbon_submissions;
CREATE TRIGGER carbon_submissions_updated_at
BEFORE UPDATE ON carbon_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7️⃣ Insert Default Emission Factors (only if table is empty)
INSERT INTO emission_factors (
  electricity_factor,
  diesel_factor,
  petrol_factor,
  lpg_factor,
  png_factor,
  travel_factor,
  water_factor,
  ewaste_factor
)
SELECT 0.82, 2.68, 2.31, 2.98, 2.75, 0.12, 0.0003, 1.5
WHERE NOT EXISTS (SELECT 1 FROM emission_factors);
