-- Fix Survey Response Validation and Question Logic
-- This migration fixes the numeric conversion error and refines questions

-- 1. Drop the old trigger and function
DROP TRIGGER IF EXISTS calculate_survey_emissions_trigger ON survey_responses;
DROP FUNCTION IF EXISTS calculate_survey_emissions();

-- 2. Create improved emission calculation function
CREATE OR REPLACE FUNCTION calculate_survey_emissions()
RETURNS TRIGGER AS $$
DECLARE
  question RECORD;
  answer_text TEXT;
  answer_numeric NUMERIC;
  category TEXT;
  factor DECIMAL;
  emissions JSONB := '{}'::JSONB;
  total DECIMAL := 0;
BEGIN
  -- Loop through all questions for this survey that have emission calculations
  FOR question IN 
    SELECT * FROM survey_questions 
    WHERE survey_id = NEW.survey_id 
    AND emission_category IS NOT NULL
    AND conversion_factor IS NOT NULL
    AND question_type IN ('number') -- Only process numeric question types
  LOOP
    -- Get the answer for this question as text first
    answer_text := NEW.responses->>question.id::TEXT;
    
    -- Skip if answer is null or empty
    IF answer_text IS NULL OR answer_text = '' THEN
      CONTINUE;
    END IF;
    
    -- Try to convert to numeric, skip if conversion fails
    BEGIN
      answer_numeric := answer_text::NUMERIC;
    EXCEPTION WHEN OTHERS THEN
      -- If conversion fails, skip this question
      CONTINUE;
    END;
    
    -- Calculate emission for this category
    category := question.emission_category;
    factor := question.conversion_factor;
    
    -- Add to category emissions
    emissions := jsonb_set(
      emissions,
      ARRAY[category],
      to_jsonb(COALESCE((emissions->>category)::DECIMAL, 0) + (answer_numeric * factor))
    );
    
    -- Add to total
    total := total + (answer_numeric * factor);
  END LOOP;
  
  NEW.calculated_emissions := emissions;
  NEW.total_carbon := total;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recreate the trigger
CREATE TRIGGER calculate_survey_emissions_trigger
BEFORE INSERT OR UPDATE ON survey_responses
FOR EACH ROW EXECUTE FUNCTION calculate_survey_emissions();

-- 4. Update existing student survey questions to fix issues
DO $$
DECLARE
  student_survey_id UUID;
  commute_question_id UUID;
BEGIN
  -- Get the student survey ID
  SELECT id INTO student_survey_id FROM surveys WHERE title = 'Student Carbon Footprint Survey 2026';
  
  IF student_survey_id IS NOT NULL THEN
    -- Delete all existing questions for this survey
    DELETE FROM survey_questions WHERE survey_id = student_survey_id;
    
    -- Insert refined questions (campus-focused only)
    
    -- Q1: Accommodation type (determines which questions apply)
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'What is your accommodation type?', 'select', 
      '["Living in Hostel", "Day Scholar (Commuting)"]'::jsonb, 
      NULL, NULL, 1, true)
    RETURNING id INTO commute_question_id;
    
    -- Q2: Commute mode (only for day scholars)
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'How do you commute to campus? (For Day Scholars only, Hostellers can skip)', 'select', 
      '["Walking", "Bicycle", "Public Bus", "Motorcycle", "Personal Car", "Auto Rickshaw", "College Bus"]'::jsonb, 
      NULL, NULL, 2, false);
    
    -- Q3: Daily distance (only for day scholars who don't walk/cycle)
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'What is your daily round-trip distance to campus (in km)? (For Day Scholars only)', 'number', 
      NULL, 'travel', 0.12, 3, false);
    
    -- Q4: Electronic device usage on campus
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'How many hours per day do you use electronic devices on campus (laptop, phone charging, etc.)?', 'number', 
      NULL, 'electricity', 0.082, 4, true);
    
    -- Q5: Campus water usage
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'Estimated daily water usage on campus (in liters)?', 'number', 
      NULL, 'water', 0.0003, 5, true);
    
    -- Q6: Waste generation on campus
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'How much waste do you generate on campus per week (in kg)?', 'number', 
      NULL, 'waste', 0.5, 6, true);
    
    -- Q7: AC usage (text-based, no emission calculation here)
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'If you use AC in your room/hostel, how often?', 'select', 
      '["No AC / Not Applicable", "Occasionally (1-2 hours/day)", "Regularly (3-5 hours/day)", "Frequently (6+ hours/day)"]'::jsonb, 
      NULL, NULL, 7, false);
    
    -- Q8: AC hours (numeric for emission calculation)
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'If you use AC, approximately how many hours per day? (Enter 0 if not applicable)', 'number', 
      NULL, 'electricity', 0.5, 8, false);
    
    -- Q9: Campus canteen meals
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'How many meals do you have in the campus canteen per day?', 'number', 
      NULL, 'food', 1.2, 9, true);
    
    -- Q10: Dietary preference
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'Your dietary preference?', 'select', 
      '["Vegetarian", "Non-Vegetarian", "Vegan", "Mixed"]'::jsonb, 
      NULL, NULL, 10, false);
    
    -- Q11: Paper usage on campus
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'How many pages of paper do you use per week on campus (notes, printouts)?', 'number', 
      NULL, 'paper', 0.005, 11, true);
    
    -- Q12: Paper reuse
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'Do you reuse paper or use digital notes?', 'select', 
      '["Always use digital", "Mostly reuse paper", "Mix of both", "Mostly new paper"]'::jsonb, 
      NULL, NULL, 12, false);
    
    -- Q13: Lab equipment usage (for relevant students)
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'How many hours per week do you use lab equipment/computers on campus? (Enter 0 if not applicable)', 'number', 
      NULL, 'electricity', 0.15, 13, false);
    
    -- Q14: Plastic usage on campus
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'Do you use single-use plastic items on campus (bottles, bags, etc.)?', 'select', 
      '["Never", "Rarely (1-2 times/week)", "Sometimes (3-5 times/week)", "Frequently (Daily)"]'::jsonb, 
      NULL, NULL, 14, true);
    
    -- Q15: Campus library time
    INSERT INTO survey_questions (survey_id, question_text, question_type, options, emission_category, conversion_factor, order_index, is_required) 
    VALUES (student_survey_id, 'How many hours per week do you spend in the campus library using lights/AC?', 'number', 
      NULL, 'electricity', 0.05, 15, false);
      
  END IF;
END $$;

-- 5. Add comment explaining the fix
COMMENT ON FUNCTION calculate_survey_emissions IS 'Calculates carbon emissions from survey responses. Only processes numeric question types with emission_category and conversion_factor. Safely handles non-numeric and null values.';
