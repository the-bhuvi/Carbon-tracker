// Department type removed - now using institutional-level tracking

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface EmissionFactors {
  id: string;
  electricity_factor: number;
  diesel_factor: number;
  petrol_factor: number;
  lpg_factor: number;
  travel_factor: number;
  water_factor: number;
  ewaste_factor: number;
  paper_factor: number;
  plastic_factor: number;
  organic_waste_factor: number;
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
  
  // Transportation
  travel_km: number;
  
  // Resources
  water_liters: number;
  paper_kg: number;
  plastic_kg: number;
  ewaste_kg: number;
  organic_waste_kg: number;
  
  // Scope-based emissions
  scope1_emissions_kg: number | null;
  scope2_emissions_kg: number | null;
  scope3_emissions_kg: number | null;
  
  // Calculated fields
  total_carbon_kg: number | null;
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
  plastic_kg?: number;
  ewaste_kg?: number;
  organic_waste_kg?: number;
}

// Institutional Monthly Audit Types

export interface EnrolledStudentsConfig {
  id: string;
  academic_year: string;
  total_students: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyAuditData {
  id: string;
  month: number;
  year: number;
  factor_name: string;
  activity_data: number;
  emission_factor: number;
  calculated_co2e_kg: number;
  unit: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FactorBreakdown {
  factor_name: string;
  total_co2e_kg: number;
  percentage: number;
}

export interface MonthlyEmissionSummary {
  month: number;
  year: number;
  total_emission_kg: number;
  per_capita_kg: number;
  student_count: number;
  factor_count: number;
  created_at: string;
  updated_at: string;
}

export interface AcademicYearEmissionSummary {
  academic_year: string;
  total_emission_kg: number;
  per_capita_kg: number;
  avg_students: number;
  highest_factor_name: string | null;
  highest_factor_emission_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface CarbonOffset {
  id: string;
  month: number;
  year: number;
  offset_type: string;
  quantity: number;
  unit: string | null;
  co2e_offset_kg: number;
  source_description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarbonReduction {
  id: string;
  month: number;
  year: number;
  reduction_type: string;
  baseline_co2e_kg: number;
  actual_co2e_kg: number;
  reduction_co2e_kg: number;
  initiative_description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type DashboardViewMode = 'monthly' | 'academic_year';

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

// New types for advanced features
export interface CampusCarbonSummary {
  id: string;
  year: number;
  total_scope1: number;
  total_scope2: number;
  total_scope3: number;
  total_emissions: number;
  total_tree_count: number;
  tree_absorption_kg: number;
  net_carbon_kg: number;
  carbon_neutrality_percentage: number;
  trees_needed_for_offset: number;
  created_at: string;
  updated_at: string;
}

export interface CarbonSimulation {
  baseline_scope1: number;
  baseline_scope2: number;
  baseline_scope3: number;
  baseline_total: number;
  projected_scope1: number;
  projected_scope2: number;
  projected_scope3: number;
  projected_total: number;
  tree_absorption: number;
  projected_net_carbon: number;
  projected_neutrality_percent: number;
  total_reduction_kg: number;
  reduction_percentage: number;
}

export interface Recommendation {
  category: string;
  priority: 'High' | 'Medium' | 'Low' | 'Info';
  action: string;
  impact_estimate: string;
  scope: string;
  current_value: number;
  percentage_of_total: number;
}

export interface DepartmentBudget {
  department_id: string;
  department_name: string;
  student_count: number;
  allowed_budget: number;
  current_emissions: number;
  remaining_budget: number;
  budget_utilized_percent: number;
  status: 'Green' | 'Yellow' | 'Exceeded' | 'Not Set';
  per_capita_emissions: number;
}

// GHG Protocol Inventory Types
export interface EmissionCategory {
  id: string;
  scope: 'Scope1' | 'Scope2' | 'Scope3';
  category_name: string;
  description: string | null;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmissionFactorConfig {
  id: string;
  category_id: string;
  emission_factor: number;
  factor_source: string | null;
  valid_from: string;
  valid_to: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmissionRecord {
  id: string;
  month: number;
  year: number;
  category_id: string;
  scope: 'Scope1' | 'Scope2' | 'Scope3';
  category_name: string;
  activity_value: number;
  emission_factor: number;
  calculated_emission_kg: number;
  calculated_emission_tonnes: number;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BaselineYear {
  id: string;
  baseline_year: number;
  total_scope1_tonnes: number | null;
  total_scope2_tonnes: number | null;
  total_scope3_tonnes: number | null;
  total_emissions_tonnes: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TotalCampusEmissions {
  total_scope1_tonnes: number;
  total_scope2_tonnes: number;
  total_scope3_tonnes: number;
  total_emissions_tonnes: number;
  record_count: number;
}

export interface ScopeBreakdown {
  scope: 'Scope1' | 'Scope2' | 'Scope3';
  total_tonnes: number;
  percentage: number;
  category_count: number;
}

export interface CategoryBreakdown {
  category_name: string;
  total_tonnes: number;
  percentage_of_scope: number;
  total_activity: number;
  unit: string;
}

export interface DominantScope {
  dominant_scope: 'Scope1' | 'Scope2' | 'Scope3';
  emission_tonnes: number;
  percentage: number;
}

export interface MonthlyTrendData {
  year: number;
  month: number;
  month_name: string;
  scope1_tonnes: number;
  scope2_tonnes: number;
  scope3_tonnes: number;
  total_tonnes: number;
}

export interface BaselineComparison {
  baseline_year: number;
  baseline_total_tonnes: number;
  current_total_tonnes: number;
  change_tonnes: number;
  change_percentage: number;
  status: 'Reduced' | 'Increased' | 'Stable';
}

export interface EmissionIntensity {
  total_emissions_tonnes: number;
  total_students: number;
  emissions_per_student_kg: number;
}

export interface CarbonHotspot {
  rank: number;
  scope: 'Scope1' | 'Scope2' | 'Scope3';
  category_name: string;
  total_tonnes: number;
  percentage_of_total: number;
  recommendation: string;
}

export interface EmissionRecordInput {
  month: number;
  year: number;
  category_id: string;
  activity_value: number;
  notes?: string;
}

export interface Database {
  public: {
    Tables: {
      enrolled_students_config: {
        Row: EnrolledStudentsConfig;
        Insert: Omit<EnrolledStudentsConfig, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EnrolledStudentsConfig, 'id' | 'created_at' | 'updated_at'>>;
      };
      monthly_audit_data: {
        Row: MonthlyAuditData;
        Insert: Omit<MonthlyAuditData, 'id' | 'created_at' | 'updated_at' | 'calculated_co2e_kg'>;
        Update: Partial<Omit<MonthlyAuditData, 'id' | 'created_at' | 'updated_at' | 'calculated_co2e_kg'>>;
      };
      monthly_summary: {
        Row: MonthlyEmissionSummary;
        Insert: Omit<MonthlyEmissionSummary, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MonthlyEmissionSummary, 'created_at' | 'updated_at'>>;
      };
      academic_year_summary: {
        Row: AcademicYearEmissionSummary;
        Insert: Omit<AcademicYearEmissionSummary, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AcademicYearEmissionSummary, 'created_at' | 'updated_at'>>;
      };
      carbon_offsets: {
        Row: CarbonOffset;
        Insert: Omit<CarbonOffset, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CarbonOffset, 'id' | 'created_at' | 'updated_at'>>;
      };
      carbon_reductions: {
        Row: CarbonReduction;
        Insert: Omit<CarbonReduction, 'id' | 'created_at' | 'updated_at' | 'reduction_co2e_kg'>;
        Update: Partial<Omit<CarbonReduction, 'id' | 'created_at' | 'updated_at' | 'reduction_co2e_kg'>>;
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
      campus_carbon_summary: {
        Row: CampusCarbonSummary;
        Insert: Omit<CampusCarbonSummary, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CampusCarbonSummary, 'id' | 'created_at' | 'updated_at'>>;
      };
      emission_categories: {
        Row: EmissionCategory;
        Insert: Omit<EmissionCategory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmissionCategory, 'id' | 'created_at' | 'updated_at'>>;
      };
      emission_factors_config: {
        Row: EmissionFactorConfig;
        Insert: Omit<EmissionFactorConfig, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmissionFactorConfig, 'id' | 'created_at' | 'updated_at'>>;
      };
      emission_records: {
        Row: EmissionRecord;
        Insert: EmissionRecordInput;
        Update: Partial<EmissionRecordInput>;
      };
      baseline_years: {
        Row: BaselineYear;
        Insert: Omit<BaselineYear, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BaselineYear, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      get_academic_year: {
        Args: { from_date?: string };
        Returns: string;
      };
      refresh_monthly_summary: {
        Args: { p_year: number; p_month: number };
        Returns: void;
      };
      refresh_academic_year_summary: {
        Args: { p_academic_year: string };
        Returns: void;
      };
      calculate_monthly_neutrality: {
        Args: { p_year: number; p_month: number };
        Returns: number;
      };
      calculate_academic_year_neutrality: {
        Args: { p_academic_year: string };
        Returns: number;
      };
      get_factor_breakdown: {
        Args: { p_year: number; p_month?: number };
        Returns: FactorBreakdown[];
      };
      get_campus_carbon_summary: {
        Args: { target_year: number };
        Returns: CampusCarbonSummary;
      };
      refresh_campus_carbon_summary: {
        Args: { target_year: number; tree_count?: number };
        Returns: CampusCarbonSummary;
      };
      simulate_carbon_reduction: {
        Args: {
          target_year: number;
          tree_count?: number;
          electricity_reduction?: number;
          travel_reduction?: number;
          diesel_reduction?: number;
        };
        Returns: CarbonSimulation[];
      };
      generate_recommendations: {
        Args: { target_year: number };
        Returns: Recommendation[];
      };
      check_department_budget: {
        Args: { dept_id: string; target_year: number };
        Returns: DepartmentBudget[];
      };
      get_all_department_budgets: {
        Args: { target_year: number };
        Returns: DepartmentBudget[];
      };
      get_total_campus_emissions: {
        Args: { 
          p_start_month: number; 
          p_start_year: number; 
          p_end_month: number; 
          p_end_year: number;
        };
        Returns: TotalCampusEmissions[];
      };
      get_scope_breakdown: {
        Args: { 
          p_start_month: number; 
          p_start_year: number; 
          p_end_month: number; 
          p_end_year: number;
        };
        Returns: ScopeBreakdown[];
      };
      get_category_breakdown: {
        Args: { 
          p_scope: 'Scope1' | 'Scope2' | 'Scope3';
          p_start_month: number; 
          p_start_year: number; 
          p_end_month: number; 
          p_end_year: number;
        };
        Returns: CategoryBreakdown[];
      };
      get_dominant_scope: {
        Args: { 
          p_start_month: number; 
          p_start_year: number; 
          p_end_month: number; 
          p_end_year: number;
        };
        Returns: DominantScope[];
      };
      get_monthly_trend: {
        Args: { 
          p_start_month: number; 
          p_start_year: number; 
          p_end_month: number; 
          p_end_year: number;
        };
        Returns: MonthlyTrendData[];
      };
      compare_to_baseline: {
        Args: { p_current_month: number; p_current_year: number };
        Returns: BaselineComparison[];
      };
      get_emission_intensity_per_student: {
        Args: { 
          p_start_month: number; 
          p_start_year: number; 
          p_end_month: number; 
          p_end_year: number;
        };
        Returns: EmissionIntensity[];
      };
      detect_carbon_hotspots: {
        Args: { 
          p_start_month: number; 
          p_start_year: number; 
          p_end_month: number; 
          p_end_year: number;
          p_top_n?: number;
        };
        Returns: CarbonHotspot[];
      };
      insert_emission_record: {
        Args: {
          p_month: number;
          p_year: number;
          p_category_id: string;
          p_activity_value: number;
          p_user_id: string;
          p_notes?: string;
        };
        Returns: EmissionRecord;
      };
    };
  };
}
