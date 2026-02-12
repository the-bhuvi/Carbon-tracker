// Database Types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'student';
          institution_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'student';
          institution_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'student';
          institution_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_facility_data: {
        Row: {
          id: string;
          admin_id: string | null;
          classrooms: number;
          buildings: number;
          hostels: number;
          canteens: number;
          food_type: 'vegetarian' | 'non-vegetarian' | 'mixed' | null;
          electricity_kwh: number;
          water_liters: number;
          waste_kg: number;
          fuel_liters: number;
          fuel_type: string | null;
          total_carbon_kg: number | null;
          month: number | null;
          year: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          classrooms: number;
          buildings: number;
          hostels: number;
          canteens: number;
          food_type?: 'vegetarian' | 'non-vegetarian' | 'mixed' | null;
          electricity_kwh: number;
          water_liters: number;
          waste_kg: number;
          fuel_liters: number;
          fuel_type?: string | null;
          total_carbon_kg?: number | null;
          month?: number | null;
          year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          classrooms?: number;
          buildings?: number;
          hostels?: number;
          canteens?: number;
          food_type?: 'vegetarian' | 'non-vegetarian' | 'mixed' | null;
          electricity_kwh?: number;
          water_liters?: number;
          waste_kg?: number;
          fuel_liters?: number;
          fuel_type?: string | null;
          total_carbon_kg?: number | null;
          month?: number | null;
          year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_survey_responses: {
        Row: {
          id: string;
          student_id: string | null;
          transport_mode: 'walking' | 'bicycle' | 'motorcycle' | 'car' | 'bus' | 'train' | 'flight' | null;
          distance_km: number | null;
          frequency_per_week: number | null;
          electricity_usage: 'low' | 'medium' | 'high' | null;
          heating_cooling: 'none' | 'minimal' | 'moderate' | 'extensive' | null;
          diet_type: 'vegan' | 'vegetarian' | 'pescatarian' | 'meat-eater' | null;
          local_food_percentage: number | null;
          recycling_frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'always' | null;
          plastic_usage: 'minimal' | 'moderate' | 'high' | null;
          total_carbon_kg: number | null;
          survey_month: number | null;
          survey_year: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          transport_mode?: 'walking' | 'bicycle' | 'motorcycle' | 'car' | 'bus' | 'train' | 'flight' | null;
          distance_km?: number | null;
          frequency_per_week?: number | null;
          electricity_usage?: 'low' | 'medium' | 'high' | null;
          heating_cooling?: 'none' | 'minimal' | 'moderate' | 'extensive' | null;
          diet_type?: 'vegan' | 'vegetarian' | 'pescatarian' | 'meat-eater' | null;
          local_food_percentage?: number | null;
          recycling_frequency?: 'never' | 'rarely' | 'sometimes' | 'often' | 'always' | null;
          plastic_usage?: 'minimal' | 'moderate' | 'high' | null;
          total_carbon_kg?: number | null;
          survey_month?: number | null;
          survey_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          transport_mode?: 'walking' | 'bicycle' | 'motorcycle' | 'car' | 'bus' | 'train' | 'flight' | null;
          distance_km?: number | null;
          frequency_per_week?: number | null;
          electricity_usage?: 'low' | 'medium' | 'high' | null;
          heating_cooling?: 'none' | 'minimal' | 'moderate' | 'extensive' | null;
          diet_type?: 'vegan' | 'vegetarian' | 'pescatarian' | 'meat-eater' | null;
          local_food_percentage?: number | null;
          recycling_frequency?: 'never' | 'rarely' | 'sometimes' | 'often' | 'always' | null;
          plastic_usage?: 'minimal' | 'moderate' | 'high' | null;
          total_carbon_kg?: number | null;
          survey_month?: number | null;
          survey_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      carbon_footprint_history: {
        Row: {
          id: string;
          user_id: string | null;
          data_type: 'facility' | 'student_survey';
          reference_id: string | null;
          transport_carbon_kg: number | null;
          energy_carbon_kg: number | null;
          waste_carbon_kg: number | null;
          food_carbon_kg: number | null;
          total_carbon_kg: number;
          period_month: number | null;
          period_year: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          data_type: 'facility' | 'student_survey';
          reference_id?: string | null;
          transport_carbon_kg?: number | null;
          energy_carbon_kg?: number | null;
          waste_carbon_kg?: number | null;
          food_carbon_kg?: number | null;
          total_carbon_kg: number;
          period_month?: number | null;
          period_year?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          data_type?: 'facility' | 'student_survey';
          reference_id?: string | null;
          transport_carbon_kg?: number | null;
          energy_carbon_kg?: number | null;
          waste_carbon_kg?: number | null;
          food_carbon_kg?: number | null;
          total_carbon_kg?: number;
          period_month?: number | null;
          period_year?: number | null;
          created_at?: string;
        };
      };
      carbon_reduction_goals: {
        Row: {
          id: string;
          user_id: string | null;
          target_reduction_percentage: number;
          baseline_carbon_kg: number;
          target_carbon_kg: number;
          start_date: string;
          end_date: string;
          status: 'active' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          target_reduction_percentage: number;
          baseline_carbon_kg: number;
          target_carbon_kg: number;
          start_date: string;
          end_date: string;
          status?: 'active' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          target_reduction_percentage?: number;
          baseline_carbon_kg?: number;
          target_carbon_kg?: number;
          start_date?: string;
          end_date?: string;
          status?: 'active' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
