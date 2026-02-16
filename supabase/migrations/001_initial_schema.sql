-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1️⃣ Create Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  building_area DECIMAL(10, 2),
  student_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2️⃣ Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3️⃣ Create Emission Factors Table
CREATE TABLE emission_factors (
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

-- 4️⃣ Create Carbon Submissions Table
CREATE TABLE carbon_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Energy consumption
  electricity_kwh DECIMAL(10, 2) DEFAULT 0,
  diesel_liters DECIMAL(10, 2) DEFAULT 0,
  petrol_liters DECIMAL(10, 2) DEFAULT 0,
  lpg_kg DECIMAL(10, 2) DEFAULT 0,
  png_m3 DECIMAL(10, 2) DEFAULT 0,
  
  -- Transportation
  travel_km DECIMAL(10, 2) DEFAULT 0,
  
  -- Resources
  water_liters DECIMAL(10, 2) DEFAULT 0,
  paper_kg DECIMAL(10, 2) DEFAULT 0,
  ewaste_kg DECIMAL(10, 2) DEFAULT 0,
  organic_waste_kg DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculated fields
  total_carbon DECIMAL(12, 4),
  carbon_score TEXT,
  tree_equivalent DECIMAL(10, 2),
  suggestions TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5️⃣ Create Indexes for Performance
CREATE INDEX idx_carbon_submissions_user_id ON carbon_submissions(user_id);
CREATE INDEX idx_carbon_submissions_department_id ON carbon_submissions(department_id);
CREATE INDEX idx_carbon_submissions_date ON carbon_submissions(submission_date);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_role ON users(role);

-- 6️⃣ Create Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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
WHERE NOT EXISTS (SELECT 1 FROM emission_factors LIMIT 1);
