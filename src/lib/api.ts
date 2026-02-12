import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type AdminFacilityData = Database['public']['Tables']['admin_facility_data']['Insert'];
type StudentSurveyResponse = Database['public']['Tables']['student_survey_responses']['Insert'];

// Admin Facility Data Functions
export const saveAdminFacilityData = async (data: Omit<AdminFacilityData, 'admin_id'>) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: result, error } = await supabase
    .from('admin_facility_data')
    .insert({
      ...data,
      admin_id: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const getAdminFacilityData = async (month?: number, year?: number) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('admin_facility_data')
    .select('*')
    .eq('admin_id', user.user.id)
    .order('created_at', { ascending: false });

  if (month !== undefined && year !== undefined) {
    query = query.eq('month', month).eq('year', year);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// Student Survey Functions
export const saveStudentSurvey = async (data: Omit<StudentSurveyResponse, 'student_id'>) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: result, error } = await supabase
    .from('student_survey_responses')
    .insert({
      ...data,
      student_id: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const getStudentSurveys = async () => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('student_survey_responses')
    .select('*')
    .eq('student_id', user.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Carbon Footprint History Functions
export const saveCarbonHistory = async (
  dataType: 'facility' | 'student_survey',
  referenceId: string,
  carbonData: {
    transport_carbon_kg?: number;
    energy_carbon_kg?: number;
    waste_carbon_kg?: number;
    food_carbon_kg?: number;
    total_carbon_kg: number;
    period_month?: number;
    period_year?: number;
  }
) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: result, error } = await supabase
    .from('carbon_footprint_history')
    .insert({
      user_id: user.user.id,
      data_type: dataType,
      reference_id: referenceId,
      ...carbonData,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const getCarbonHistory = async (limit?: number) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('carbon_footprint_history')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// Carbon Reduction Goals Functions
export const createCarbonGoal = async (goalData: {
  target_reduction_percentage: number;
  baseline_carbon_kg: number;
  target_carbon_kg: number;
  start_date: string;
  end_date: string;
}) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data: result, error } = await supabase
    .from('carbon_reduction_goals')
    .insert({
      user_id: user.user.id,
      ...goalData,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const getCarbonGoals = async () => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('carbon_reduction_goals')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateGoalStatus = async (
  goalId: string,
  status: 'active' | 'completed' | 'failed'
) => {
  const { data, error } = await supabase
    .from('carbon_reduction_goals')
    .update({ status })
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Admin-only: Get all survey responses
export const getAllSurveyResponses = async () => {
  const { data, error } = await supabase
    .from('student_survey_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get aggregated stats (for dashboard)
export const getAggregatedStats = async () => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('carbon_footprint_history')
    .select('total_carbon_kg, period_month, period_year')
    .eq('user_id', user.user.id)
    .order('period_year', { ascending: true })
    .order('period_month', { ascending: true });

  if (error) throw error;
  return data;
};
