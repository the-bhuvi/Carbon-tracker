export interface Department {
  id: string;
  name: string;
  building_area: number | null;
  student_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  department_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmissionFactors {
  id: string;
  electricity_factor: number;
  diesel_factor: number;
  petrol_factor: number;
  lpg_factor: number;
  png_factor: number;
  travel_factor: number;
  water_factor: number;
  ewaste_factor: number;
  updated_at: string;
}

export interface CarbonSubmission {
  id: string;
  user_id: string;
  department_id: string;
  submission_date: string;
  
  // Energy consumption
  electricity_kwh: number;
  diesel_liters: number;
  petrol_liters: number;
  lpg_kg: number;
  png_m3: number;
  
  // Transportation
  travel_km: number;
  
  // Resources
  water_liters: number;
  paper_kg: number;
  ewaste_kg: number;
  organic_waste_kg: number;
  
  // Calculated fields
  total_carbon: number | null;
  carbon_score: 'Green' | 'Moderate' | 'High' | null;
  tree_equivalent: number | null;
  suggestions: string[] | null;
  
  created_at: string;
  updated_at: string;
}

export interface CarbonSubmissionInput {
  user_id: string;
  department_id: string;
  submission_date?: string;
  electricity_kwh?: number;
  diesel_liters?: number;
  petrol_liters?: number;
  lpg_kg?: number;
  png_m3?: number;
  travel_km?: number;
  water_liters?: number;
  paper_kg?: number;
  ewaste_kg?: number;
  organic_waste_kg?: number;
}

export interface DepartmentSummary {
  department_id: string;
  department_name: string;
  total_submissions: number;
  avg_carbon: number;
  total_carbon: number;
  carbon_trend: 'Excellent' | 'Good' | 'Needs Improvement';
}

export interface MonthlyTrend {
  month_year: string;
  submission_count: number;
  avg_carbon: number;
  total_carbon: number;
}

export interface PerCapitaEmission {
  department_id: string;
  department_name: string;
  total_carbon: number;
  student_count: number;
  per_capita_carbon: number;
}

// Survey System Types
export interface Survey {
  id: string;
  title: string;
  description: string | null;
  target_audience: 'student' | 'faculty' | 'both';
  status: 'draft' | 'active' | 'closed';
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  options: string[] | null;
  is_required: boolean;
  order_index: number;
  emission_category: string | null;
  conversion_factor: number | null;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id: string;
  department_id: string | null;
  responses: Record<string, any>;
  calculated_emissions: Record<string, number> | null;
  total_carbon: number | null;
  submitted_at: string;
}

export interface SurveyInput {
  title: string;
  description?: string;
  target_audience: 'student' | 'faculty' | 'both';
  status?: 'draft' | 'active' | 'closed';
  start_date?: string;
  end_date?: string;
}

export interface SurveyQuestionInput {
  survey_id: string;
  question_text: string;
  question_type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  is_required?: boolean;
  order_index: number;
  emission_category?: string;
  conversion_factor?: number;
}

export interface SurveyResponseInput {
  survey_id: string;
  user_id: string;
  department_id?: string;
  responses: Record<string, any>;
}

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: Department;
        Insert: Omit<Department, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      carbon_submissions: {
        Row: CarbonSubmission;
        Insert: CarbonSubmissionInput;
        Update: Partial<CarbonSubmissionInput>;
      };
      emission_factors: {
        Row: EmissionFactors;
        Insert: Partial<Omit<EmissionFactors, 'id' | 'updated_at'>>;
        Update: Partial<Omit<EmissionFactors, 'id' | 'updated_at'>>;
      };
    };
    Functions: {
      get_department_summary: {
        Args: Record<string, never>;
        Returns: DepartmentSummary[];
      };
      get_monthly_trends: {
        Args: { dept_id?: string };
        Returns: MonthlyTrend[];
      };
      get_per_capita_emissions: {
        Args: Record<string, never>;
        Returns: PerCapitaEmission[];
      };
    };
  };
}
