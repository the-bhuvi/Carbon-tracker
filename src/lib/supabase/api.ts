import { supabase } from './client';
import type { 
  CarbonSubmission, 
  CarbonSubmissionInput,
  DepartmentSummary,
  MonthlyTrend,
  PerCapitaEmission 
} from '@/types/database';

// Carbon Submissions API
export const carbonSubmissionsApi = {
  // Create a new carbon submission
  async create(data: CarbonSubmissionInput): Promise<CarbonSubmission> {
    const { data: submission, error } = await supabase
      .from('carbon_submissions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return submission;
  },

  // Get all submissions for the current user
  async getByUserId(userId: string): Promise<CarbonSubmission[]> {
    const { data, error } = await supabase
      .from('carbon_submissions')
      .select(`
        *,
        department:departments(name)
      `)
      .eq('user_id', userId)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all submissions for a department
  async getByDepartmentId(departmentId: string): Promise<CarbonSubmission[]> {
    const { data, error } = await supabase
      .from('carbon_submissions')
      .select('*')
      .eq('department_id', departmentId)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single submission by ID
  async getById(id: string): Promise<CarbonSubmission> {
    const { data, error } = await supabase
      .from('carbon_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update a submission
  async update(id: string, updates: Partial<CarbonSubmissionInput>): Promise<CarbonSubmission> {
    const { data, error } = await supabase
      .from('carbon_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a submission
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('carbon_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get recent submissions with limit
  async getRecent(limit = 10): Promise<CarbonSubmission[]> {
    const { data, error } = await supabase
      .from('carbon_submissions')
      .select('*')
      .order('submission_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get submissions by date range
  async getByDateRange(startDate: string, endDate: string): Promise<CarbonSubmission[]> {
    const { data, error } = await supabase
      .from('carbon_submissions')
      .select('*')
      .gte('submission_date', startDate)
      .lte('submission_date', endDate)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Departments API
export const departmentsApi = {
  // Get all departments
  async getAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get a single department
  async getById(id: string) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a department (admin only)
  async create(department: { name: string; building_area?: number; student_count?: number }) {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a department (admin only)
  async update(id: string, updates: Partial<{ name: string; building_area: number; student_count: number }>) {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Users API
export const usersApi = {
  // Get current user profile
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get user by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users (admin only)
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Update user profile
  async update(id: string, updates: Partial<{ name: string; email: string; department_id: string }>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Analytics API
export const analyticsApi = {
  // Get department summary
  async getDepartmentSummary(): Promise<DepartmentSummary[]> {
    const { data, error } = await supabase
      .rpc('get_department_summary');

    if (error) throw error;
    return data || [];
  },

  // Get monthly trends
  async getMonthlyTrends(departmentId?: string): Promise<MonthlyTrend[]> {
    const { data, error } = await supabase
      .rpc('get_monthly_trends', { dept_id: departmentId || null });

    if (error) throw error;
    return data || [];
  },

  // Get per capita emissions
  async getPerCapitaEmissions(): Promise<PerCapitaEmission[]> {
    const { data, error } = await supabase
      .rpc('get_per_capita_emissions');

    if (error) throw error;
    return data || [];
  }
};

// Emission Factors API
export const emissionFactorsApi = {
  // Get current emission factors
  async getCurrent() {
    const { data, error } = await supabase
      .from('emission_factors')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  // Update emission factors (admin only)
  async update(updates: Partial<{
    electricity_factor: number;
    diesel_factor: number;
    petrol_factor: number;
    lpg_factor: number;
    png_factor: number;
    travel_factor: number;
    water_factor: number;
    ewaste_factor: number;
  }>) {
    const current = await this.getCurrent();
    const { data, error } = await supabase
      .from('emission_factors')
      .update(updates)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Survey System API
export const surveysApi = {
  // Get all surveys (filtered by role and status)
  async getAll(status?: 'draft' | 'active' | 'closed') {
    let query = supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get surveys for a specific audience
  async getByAudience(audience: 'student' | 'faculty') {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('status', 'active')
      .or(`target_audience.eq.${audience},target_audience.eq.both`)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  },

  // Create a new survey (admin only)
  async create(survey: any) {
    const { data, error } = await supabase
      .from('surveys')
      .insert(survey)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update survey
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete survey
  async delete(id: string) {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const surveyQuestionsApi = {
  // Get questions for a survey
  async getBySurveyId(surveyId: string) {
    const { data, error } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  // Create question
  async create(question: any) {
    const { data, error} = await supabase
      .from('survey_questions')
      .insert(question)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Bulk create questions
  async createMany(questions: any[]) {
    const { data, error } = await supabase
      .from('survey_questions')
      .insert(questions)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Delete question
  async delete(id: string) {
    const { error } = await supabase
      .from('survey_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const surveyResponsesApi = {
  // Submit survey response
  async submit(response: any) {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert(response)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's response to a specific survey
  async getUserResponse(surveyId: string, userId: string) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No response found
      throw error;
    }
    return data;
  },

  // Get all responses for a survey (admin only)
  async getBySurveyId(surveyId: string) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        user:users(name, email),
        department:departments(name)
      `)
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get survey analytics
  async getAnalytics(surveyId: string) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('total_carbon, calculated_emissions, department_id')
      .eq('survey_id', surveyId);

    if (error) throw error;
    
    // Calculate summary statistics
    const totalResponses = data?.length || 0;
    const totalCarbon = data?.reduce((sum, r) => sum + (r.total_carbon || 0), 0) || 0;
    const avgCarbon = totalResponses > 0 ? totalCarbon / totalResponses : 0;

    return {
      totalResponses,
      totalCarbon,
      avgCarbon,
      responses: data || []
    };
  }
};
