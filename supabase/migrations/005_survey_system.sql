-- Survey Management System for Carbon Tracker

-- 1. Surveys Table (Admin creates surveys)
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('student', 'faculty', 'both')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Survey Questions Table
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'number', 'select', 'radio', 'checkbox')),
  options JSONB, -- For select/radio/checkbox options
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL,
  emission_category TEXT, -- Maps to: electricity, fuel, water, waste, travel, etc.
  conversion_factor DECIMAL(10, 4), -- For auto-calculation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  department_id UUID REFERENCES departments(id),
  responses JSONB NOT NULL, -- Stores all answers as key-value pairs
  calculated_emissions JSONB, -- Calculated carbon metrics per category
  total_carbon DECIMAL(12, 4),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(survey_id, user_id) -- One response per user per survey
);

-- 4. Create indexes
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_target_audience ON surveys(target_audience);
CREATE INDEX idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_user_id ON survey_responses(user_id);

-- 5. Function to calculate emissions from survey responses
CREATE OR REPLACE FUNCTION calculate_survey_emissions()
RETURNS TRIGGER AS $$
DECLARE
  question RECORD;
  answer NUMERIC;
  category TEXT;
  factor DECIMAL;
  emissions JSONB := '{}'::JSONB;
  total DECIMAL := 0;
BEGIN
  -- Loop through all questions for this survey
  FOR question IN 
    SELECT * FROM survey_questions 
    WHERE survey_id = NEW.survey_id 
    AND emission_category IS NOT NULL
  LOOP
    -- Get the answer for this question
    answer := (NEW.responses->>question.id::TEXT)::NUMERIC;
    
    IF answer IS NOT NULL AND question.conversion_factor IS NOT NULL THEN
      -- Calculate emission for this category
      category := question.emission_category;
      factor := question.conversion_factor;
      
      -- Add to category emissions
      emissions := jsonb_set(
        emissions,
        ARRAY[category],
        to_jsonb(COALESCE((emissions->>category)::DECIMAL, 0) + (answer * factor))
      );
      
      -- Add to total
      total := total + (answer * factor);
    END IF;
  END LOOP;
  
  NEW.calculated_emissions := emissions;
  NEW.total_carbon := total;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger for automatic emission calculation
CREATE TRIGGER calculate_survey_emissions_trigger
BEFORE INSERT OR UPDATE ON survey_responses
FOR EACH ROW EXECUTE FUNCTION calculate_survey_emissions();

-- 7. Updated at trigger for surveys
CREATE TRIGGER surveys_updated_at
BEFORE UPDATE ON surveys
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. Row Level Security Policies

-- Surveys
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage surveys"
ON surveys FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Everyone can view active surveys"
ON surveys FOR SELECT
TO authenticated
USING (status = 'active');

-- Survey Questions
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage questions"
ON survey_questions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Everyone can view questions of active surveys"
ON survey_questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM surveys 
    WHERE surveys.id = survey_questions.survey_id 
    AND surveys.status = 'active'
  )
);

-- Survey Responses
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses"
ON survey_responses FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own responses"
ON survey_responses FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all responses"
ON survey_responses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 9. Sample survey templates

-- Student Survey Template
INSERT INTO surveys (title, description, target_audience, status, start_date) VALUES
('Student Carbon Footprint Survey 2026', 'Help us understand student contribution to campus carbon emissions', 'student', 'active', CURRENT_DATE);

-- Get the survey ID for student survey
DO $$
DECLARE
  student_survey_id UUID;
BEGIN
  SELECT id INTO student_survey_id FROM surveys WHERE title = 'Student Carbon Footprint Survey 2026';
  
  -- Student Survey Questions
  INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) VALUES
  (student_survey_id, 'How do you commute to campus daily?', 'select', 
   '["Walking", "Bicycle", "Public Bus", "Motorcycle", "Personal Car", "Living in Hostel"]'::jsonb, 
   NULL, NULL, 1, true),
  
  (student_survey_id, 'What is your daily round-trip distance to campus (in km)?', 'number', 
   NULL, 'travel', 0.12, 2, true),
  
  (student_survey_id, 'How many hours per day do you use electronic devices (laptop, phone, etc.)?', 'number', 
   NULL, 'electricity', 0.082, 3, true),
  
  (student_survey_id, 'Estimated daily water usage (in liters)?', 'number', 
   NULL, 'water', 0.0003, 4, true),
  
  (student_survey_id, 'How much waste do you generate per week (in kg)?', 'number', 
   NULL, 'waste', 0.5, 5, true),
  
  (student_survey_id, 'Do you use AC in your room/hostel?', 'select', 
   '["Never", "Occasionally (1-2 hours/day)", "Regularly (3-5 hours/day)", "Frequently (6+ hours/day)"]'::jsonb, 
   NULL, NULL, 6, true),
  
  (student_survey_id, 'How many meals do you have in the campus canteen per day?', 'number', 
   NULL, NULL, NULL, 7, false),
  
  (student_survey_id, 'Your dietary preference?', 'select', 
   '["Vegetarian", "Non-Vegetarian", "Vegan", "Mixed"]'::jsonb, 
   NULL, NULL, 8, false);
END $$;

-- Faculty Survey Template
INSERT INTO surveys (title, description, target_audience, status, start_date) VALUES
('Faculty Carbon Footprint Survey 2026', 'Track faculty contribution to campus emissions', 'faculty', 'active', CURRENT_DATE);

DO $$
DECLARE
  faculty_survey_id UUID;
BEGIN
  SELECT id INTO faculty_survey_id FROM surveys WHERE title = 'Faculty Carbon Footprint Survey 2026';
  
  -- Faculty Survey Questions
  INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) VALUES
  (faculty_survey_id, 'Primary mode of commute to campus?', 'select', 
   '["Two-Wheeler", "Four-Wheeler (Personal)", "Four-Wheeler (Carpool)", "Public Transport", "University Shuttle"]'::jsonb, 
   NULL, NULL, 1, true),
  
  (faculty_survey_id, 'Daily commute distance (round-trip in km)?', 'number', 
   NULL, 'travel', 0.12, 2, true),
  
  (faculty_survey_id, 'Hours of computer/equipment usage per day in office?', 'number', 
   NULL, 'electricity', 0.15, 3, true),
  
  (faculty_survey_id, 'Do you use AC in your office/cabin?', 'select', 
   '["No AC", "Occasionally", "Daily (4-6 hours)", "Full day"]'::jsonb, 
   NULL, NULL, 4, true),
  
  (faculty_survey_id, 'Paper usage per month (approximate number of pages)?', 'number', 
   NULL, 'paper', 0.005, 5, true),
  
  (faculty_survey_id, 'How often do you use campus canteen/cafeteria?', 'select', 
   '["Never", "1-2 times/week", "3-4 times/week", "Daily"]'::jsonb, 
   NULL, NULL, 6, false);
END $$;

COMMENT ON TABLE surveys IS 'Admin-created surveys for carbon footprint data collection';
COMMENT ON TABLE survey_questions IS 'Questions for each survey with emission calculation metadata';
COMMENT ON TABLE survey_responses IS 'User responses to surveys with calculated emissions';
