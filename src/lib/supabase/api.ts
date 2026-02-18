import { supabase } from './client';
import type { 
  CarbonSubmission, 
  CarbonSubmissionInput,
  MonthlyAuditData,
  MonthlyEmissionSummary,
  AcademicYearEmissionSummary,
  FactorBreakdown,
  CarbonOffset,
  CarbonReduction,
  EnrolledStudentsConfig
} from '@/types/database';

// Carbon Submissions API (Legacy - kept for backward compatibility)
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
      .select('*')
      .eq('user_id', userId)
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
  async update(id: string, updates: Partial<{ name: string; email: string }>) {
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

// Analytics API (Legacy - kept for backward compatibility)
export const analyticsApi = {
  // Legacy function - no longer used
  async getDepartmentSummary() {
    return [];
  },

  // Legacy function - no longer used
  async getMonthlyTrends() {
    return [];
  },

  // Legacy function - no longer used
  async getPerCapitaEmissions() {
    return [];
  }
};

// Enrolled Students Configuration API
export const enrolledStudentsApi = {
  // Get configuration for an academic year
  async getByAcademicYear(academicYear: string): Promise<EnrolledStudentsConfig | null> {
    const { data, error } = await supabase
      .from('enrolled_students_config')
      .select('*')
      .eq('academic_year', academicYear)
      .single();

    if (error && error.code === 'PGRST116') return null; // Not found
    if (error) throw error;
    return data;
  },

  // Get all configurations
  async getAll(): Promise<EnrolledStudentsConfig[]> {
    const { data, error } = await supabase
      .from('enrolled_students_config')
      .select('*')
      .order('academic_year', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create or update enrollment configuration
  async upsert(academicYear: string, totalStudents: number, notes?: string): Promise<EnrolledStudentsConfig> {
    const { data, error } = await supabase
      .from('enrolled_students_config')
      .upsert(
        {
          academic_year: academicYear,
          total_students: totalStudents,
          notes: notes || null
        },
        { onConflict: 'academic_year' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Monthly Audit Data API
export const monthlyAuditApi = {
  // Create or update monthly audit entry
  async upsert(data: Omit<MonthlyAuditData, 'id' | 'created_at' | 'updated_at' | 'calculated_co2e_kg'>): Promise<MonthlyAuditData> {
    const { data: result, error } = await supabase
      .from('monthly_audit_data')
      .upsert(data, { onConflict: 'year,month,factor_name' })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Get audit data for a specific month
  async getByMonth(year: number, month: number): Promise<MonthlyAuditData[]> {
    const { data, error } = await supabase
      .from('monthly_audit_data')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('factor_name');

    if (error) throw error;
    return data || [];
  },

  // Get audit data for a specific factor
  async getByFactor(factorName: string, year?: number): Promise<MonthlyAuditData[]> {
    let query = supabase
      .from('monthly_audit_data')
      .select('*')
      .eq('factor_name', factorName)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (year) {
      query = query.eq('year', year);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get all audit data for a year
  async getByYear(year: number): Promise<MonthlyAuditData[]> {
    const { data, error } = await supabase
      .from('monthly_audit_data')
      .select('*')
      .eq('year', year)
      .order('month')
      .order('factor_name');

    if (error) throw error;
    return data || [];
  },

  // Delete an audit entry
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('monthly_audit_data')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Monthly Emission Summary API
export const monthlyEmissionApi = {
  // Get summary for a specific month
  async getByMonth(year: number, month: number): Promise<MonthlyEmissionSummary | null> {
    const { data, error } = await supabase
      .from('monthly_summary')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  // Get all monthly summaries for a year
  async getByYear(year: number): Promise<MonthlyEmissionSummary[]> {
    const { data, error } = await supabase
      .from('monthly_summary')
      .select('*')
      .eq('year', year)
      .order('month');

    if (error) throw error;
    return data || [];
  },

  // Get monthly trend data
  async getTrendData(year: number): Promise<MonthlyEmissionSummary[]> {
    const { data, error } = await supabase
      .from('monthly_summary')
      .select('*')
      .eq('year', year)
      .order('month');

    if (error) throw error;
    return data || [];
  },

  // Refresh monthly summary (call database function)
  async refresh(year: number, month: number): Promise<void> {
    const { error } = await supabase
      .rpc('refresh_monthly_summary', {
        p_year: year,
        p_month: month
      });

    if (error) throw error;
  }
};

// Academic Year Emission Summary API
export const academicYearEmissionApi = {
  // Get summary for an academic year
  async getByAcademicYear(academicYear: string): Promise<AcademicYearEmissionSummary | null> {
    const { data, error } = await supabase
      .from('academic_year_summary')
      .select('*')
      .eq('academic_year', academicYear)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  // Get all academic year summaries
  async getAll(): Promise<AcademicYearEmissionSummary[]> {
    const { data, error } = await supabase
      .from('academic_year_summary')
      .select('*')
      .order('academic_year', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Refresh academic year summary (call database function)
  async refresh(academicYear: string): Promise<void> {
    const { error } = await supabase
      .rpc('refresh_academic_year_summary', {
        p_academic_year: academicYear
      });

    if (error) throw error;
  }
};

// Carbon Offsets API
export const carbonOffsetsApi = {
  // Create offset entry
  async create(data: Omit<CarbonOffset, 'id' | 'created_at' | 'updated_at'>): Promise<CarbonOffset> {
    const { data: result, error } = await supabase
      .from('carbon_offsets')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Get offsets for a month
  async getByMonth(year: number, month: number): Promise<CarbonOffset[]> {
    const { data, error } = await supabase
      .from('carbon_offsets')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get offsets for an academic year
  async getByAcademicYear(academicYear: string): Promise<CarbonOffset[]> {
    const year = parseInt(academicYear.split('-')[0]);
    const nextYear = year + 1;

    const { data, error } = await supabase
      .from('carbon_offsets')
      .select('*')
      .or(`and(year.eq.${year},month.gte.7),and(year.eq.${nextYear},month.lte.6)`)
      .order('year')
      .order('month');

    if (error) throw error;
    return data || [];
  },

  // Delete offset
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('carbon_offsets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Carbon Reductions API
export const carbonReductionsApi = {
  // Create reduction entry
  async create(data: Omit<CarbonReduction, 'id' | 'created_at' | 'updated_at' | 'reduction_co2e_kg'>): Promise<CarbonReduction> {
    const { data: result, error } = await supabase
      .from('carbon_reductions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Get reductions for a month
  async getByMonth(year: number, month: number): Promise<CarbonReduction[]> {
    const { data, error } = await supabase
      .from('carbon_reductions')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get reductions for an academic year
  async getByAcademicYear(academicYear: string): Promise<CarbonReduction[]> {
    const year = parseInt(academicYear.split('-')[0]);
    const nextYear = year + 1;

    const { data, error } = await supabase
      .from('carbon_reductions')
      .select('*')
      .or(`and(year.eq.${year},month.gte.7),and(year.eq.${nextYear},month.lte.6)`)
      .order('year')
      .order('month');

    if (error) throw error;
    return data || [];
  },

  // Delete reduction
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('carbon_reductions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Neutrality API
export const neutralityApi = {
  // Calculate monthly neutrality percentage
  async getMonthlyNeutrality(year: number, month: number): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_monthly_neutrality', {
        p_year: year,
        p_month: month
      });

    if (error) throw error;
    return data || 0;
  },

  // Calculate academic year neutrality percentage
  async getAcademicYearNeutrality(academicYear: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_academic_year_neutrality', {
        p_academic_year: academicYear
      });

    if (error) throw error;
    return data || 0;
  }
};

// Factor Breakdown API
export const factorBreakdownApi = {
  // Get factor breakdown for a month
  async getByMonth(year: number, month: number): Promise<FactorBreakdown[]> {
    const { data, error } = await supabase
      .rpc('get_factor_breakdown', {
        p_year: year,
        p_month: month
      });

    if (error) throw error;
    return data || [];
  },

  // Get factor breakdown for a year
  async getByYear(year: number): Promise<FactorBreakdown[]> {
    const { data, error } = await supabase
      .rpc('get_factor_breakdown', {
        p_year: year,
        p_month: null
      });

    if (error) throw error;
    return data || [];
  }
};
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
        user:users(name, email)
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
