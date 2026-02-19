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
  EnrolledStudentsConfig,
  TopContributor,
  FactorPercentage,
  EmissionIntensityMetrics,
  ScopeBreakdownMetric,
  ReductionSimulation,
  NetZeroProjection
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
  },

  // Get all distinct years that have audit data (from both tables)
  async getAvailableYears(): Promise<number[]> {
    const [auditResult, submissionsResult] = await Promise.all([
      supabase.from('monthly_audit_data').select('year'),
      supabase.from('carbon_submissions').select('submission_date')
    ]);

    const auditYears = (auditResult.data || []).map(r => r.year as number);
    const submissionYears = (submissionsResult.data || []).map(r =>
      parseInt((r.submission_date as string).split('-')[0])
    );
    const allYears = [...new Set([...auditYears, ...submissionYears])];
    return allYears.sort((a, b) => b - a);
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

    if (error && error.code !== 'PGRST116') throw error;
    if (data) return data;

    // Fallback: aggregate directly from monthly_audit_data
    const { data: auditData, error: auditError } = await supabase
      .from('monthly_audit_data')
      .select('year, month, factor_name, calculated_co2e_kg')
      .eq('year', year)
      .eq('month', month);

    if (auditError) throw auditError;
    if (!auditData || auditData.length === 0) return null;

    const total = auditData.reduce((sum, r) => sum + parseFloat(r.calculated_co2e_kg), 0);
    return {
      year, month,
      total_emission_kg: total,
      student_count: 1000,
      factor_count: auditData.length,
      per_capita_kg: parseFloat((total / 1000).toFixed(4)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Get all monthly summaries for a year
  async getByYear(year: number): Promise<MonthlyEmissionSummary[]> {
    const { data, error } = await supabase
      .from('monthly_summary')
      .select('*')
      .eq('year', year)
      .order('month');

    if (error) throw error;
    if (data && data.length > 0) return data;

    // Fallback 1: aggregate directly from monthly_audit_data
    const { data: auditData } = await supabase
      .from('monthly_audit_data')
      .select('year, month, factor_name, calculated_co2e_kg')
      .eq('year', year);

    if (auditData && auditData.length > 0) {
      const byMonth: Record<number, MonthlyEmissionSummary> = {};
      for (const row of auditData) {
        if (!byMonth[row.month]) {
          byMonth[row.month] = {
            year: row.year, month: row.month,
            total_emission_kg: 0, per_capita_kg: 0,
            student_count: 1000, factor_count: 0,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          };
        }
        byMonth[row.month].total_emission_kg += parseFloat(row.calculated_co2e_kg);
        byMonth[row.month].factor_count += 1;
      }
      for (const m of Object.values(byMonth)) {
        m.per_capita_kg = parseFloat((m.total_emission_kg / m.student_count).toFixed(4));
      }
      return Object.values(byMonth).sort((a, b) => a.month - b.month);
    }

    // Fallback 2: aggregate from legacy carbon_submissions table
    const { data: submissions } = await supabase
      .from('carbon_submissions')
      .select('submission_date, electricity_kwh, diesel_liters, petrol_liters, lpg_kg, travel_km, water_liters, paper_kg, plastic_kg, ewaste_kg, organic_waste_kg')
      .gte('submission_date', `${year}-01-01`)
      .lte('submission_date', `${year}-12-31`);

    if (!submissions || submissions.length === 0) return [];

    const byMonth: Record<number, MonthlyEmissionSummary> = {};
    for (const row of submissions) {
      const month = parseInt(row.submission_date.split('-')[1]);
      const total =
        parseFloat(row.electricity_kwh || 0) * 0.73 +
        parseFloat(row.diesel_liters || 0) * 2.68 +
        parseFloat(row.petrol_liters || 0) * 2.31 +
        parseFloat(row.lpg_kg || 0) * 1.50 +
        parseFloat(row.travel_km || 0) * 0.12 +
        parseFloat(row.water_liters || 0) * 0.00035 +
        parseFloat(row.paper_kg || 0) * 1.70 +
        parseFloat(row.plastic_kg || 0) * 2.00 +
        parseFloat(row.ewaste_kg || 0) * 3.50 +
        parseFloat(row.organic_waste_kg || 0) * 0.50;
      if (!byMonth[month]) {
        byMonth[month] = {
          year, month, total_emission_kg: 0, per_capita_kg: 0,
          student_count: 1000, factor_count: 6,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        };
      }
      byMonth[month].total_emission_kg += total;
    }
    for (const m of Object.values(byMonth)) {
      m.per_capita_kg = parseFloat((m.total_emission_kg / m.student_count).toFixed(4));
    }
    return Object.values(byMonth).sort((a, b) => a.month - b.month);
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
  },

  // Refresh all months for a year that have audit data
  async refreshYear(year: number): Promise<void> {
    const { data, error } = await supabase
      .from('monthly_audit_data')
      .select('month')
      .eq('year', year);

    if (error) throw error;

    const months = [...new Set((data || []).map(r => r.month))];
    for (const month of months) {
      const { error: rpcError } = await supabase
        .rpc('refresh_monthly_summary', { p_year: year, p_month: month });
      if (rpcError) throw rpcError;
    }
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
      .maybeSingle();

    if (error) return null; // table empty or missing — fall through
    if (data) return data;

    // Fallback: compute from carbon_submissions
    const [startYear, endYear] = academicYear.split('-').map(Number);
    const { data: submissions } = await supabase
      .from('carbon_submissions')
      .select('submission_date, electricity_kwh, diesel_liters, petrol_liters, lpg_kg, travel_km, water_liters, paper_kg, plastic_kg, ewaste_kg, organic_waste_kg')
      .or(`and(submission_date.gte.${startYear}-07-01,submission_date.lte.${startYear}-12-31),and(submission_date.gte.${endYear}-01-01,submission_date.lte.${endYear}-06-30)`);

    if (!submissions || submissions.length === 0) {
      // Fallback 2: compute from monthly_audit_data
      const { data: auditData } = await supabase
        .from('monthly_audit_data')
        .select('year, month, calculated_co2e_kg')
        .or(`and(year.eq.${startYear},month.gte.7),and(year.eq.${endYear},month.lte.6)`);

      if (!auditData || auditData.length === 0) return null;
      const total = auditData.reduce((s, r) => s + parseFloat(r.calculated_co2e_kg), 0);
      return {
        academic_year: academicYear,
        total_emission_kg: total,
        per_capita_kg: parseFloat((total / 1000).toFixed(4)),
        avg_students: 1000,
        highest_factor_name: null,
        highest_factor_emission_kg: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const total = submissions.reduce((s, row) => {
      return s +
        parseFloat(row.electricity_kwh || 0) * 0.73 +
        parseFloat(row.diesel_liters || 0) * 2.68 +
        parseFloat(row.petrol_liters || 0) * 2.31 +
        parseFloat(row.lpg_kg || 0) * 1.50 +
        parseFloat(row.travel_km || 0) * 0.12 +
        parseFloat(row.water_liters || 0) * 0.00035 +
        parseFloat(row.paper_kg || 0) * 1.70 +
        parseFloat(row.plastic_kg || 0) * 2.00 +
        parseFloat(row.ewaste_kg || 0) * 3.50 +
        parseFloat(row.organic_waste_kg || 0) * 0.50;
    }, 0);

    return {
      academic_year: academicYear,
      total_emission_kg: total,
      per_capita_kg: parseFloat((total / 1000).toFixed(4)),
      avg_students: 1000,
      highest_factor_name: null,
      highest_factor_emission_kg: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Get all academic year summaries
  async getAll(): Promise<AcademicYearEmissionSummary[]> {
    const { data, error } = await supabase
      .from('academic_year_summary')
      .select('*')
      .order('academic_year', { ascending: false });

    if (error) return [];
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

    if (error) return 0; // RPC may not exist yet; default to 0
    return data || 0;
  },

  // Calculate academic year neutrality percentage
  async getAcademicYearNeutrality(academicYear: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_academic_year_neutrality', {
        p_academic_year: academicYear
      });

    if (error) return 0; // RPC may not exist yet; default to 0
    return data || 0;
  }
};

// Helper: convert carbon_submissions rows into FactorBreakdown[]
function submissionsToFactorBreakdown(subs: any[]): FactorBreakdown[] {
  const FACTORS: Record<string, number> = {
    'Electricity': 0.73, 'Diesel': 2.68, 'Petrol': 2.31,
    'LPG': 1.50, 'Travel (km)': 0.12, 'Water': 0.00035,
    'Paper': 1.70, 'Plastic': 2.00, 'E-Waste': 3.50
  };
  const COLS: Record<string, string> = {
    'Electricity': 'electricity_kwh', 'Diesel': 'diesel_liters',
    'Petrol': 'petrol_liters', 'LPG': 'lpg_kg',
    'Travel (km)': 'travel_km', 'Water': 'water_liters',
    'Paper': 'paper_kg', 'Plastic': 'plastic_kg', 'E-Waste': 'ewaste_kg'
  };
  const byFactor: Record<string, number> = {};
  for (const row of subs) {
    for (const [factor, ef] of Object.entries(FACTORS)) {
      const col = COLS[factor];
      const val = parseFloat(row[col] || 0);
      if (val > 0) byFactor[factor] = (byFactor[factor] || 0) + val * ef;
    }
  }
  const total = Object.values(byFactor).reduce((s, v) => s + v, 0);
  return Object.entries(byFactor)
    .filter(([, v]) => v > 0)
    .map(([factor_name, total_co2e_kg]) => ({
      factor_name,
      total_co2e_kg,
      percentage: total > 0 ? parseFloat(((total_co2e_kg / total) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.total_co2e_kg - a.total_co2e_kg);
}

// Factor Breakdown API
export const factorBreakdownApi = {
  // Get factor breakdown for a month (with fallback to direct query)
  async getByMonth(year: number, month: number): Promise<FactorBreakdown[]> {
    const { data, error } = await supabase
      .rpc('get_factor_breakdown', {
        p_year: year,
        p_month: month
      });

    if (!error && data && data.length > 0) return data;

    // Fallback: compute from monthly_audit_data directly
    const { data: auditData } = await supabase
      .from('monthly_audit_data')
      .select('factor_name, calculated_co2e_kg')
      .eq('year', year)
      .eq('month', month);

    if (auditData && auditData.length > 0) {
      const total = auditData.reduce((s, r) => s + parseFloat(r.calculated_co2e_kg), 0);
      return auditData.map(r => ({
        factor_name: r.factor_name,
        total_co2e_kg: parseFloat(r.calculated_co2e_kg),
        percentage: total > 0 ? parseFloat(((parseFloat(r.calculated_co2e_kg) / total) * 100).toFixed(2)) : 0
      })).sort((a, b) => b.total_co2e_kg - a.total_co2e_kg);
    }

    // Fallback 2: compute from legacy carbon_submissions
    const mm = String(month).padStart(2, '0');
    const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2,'0')}-01`;
    const { data: subs } = await supabase
      .from('carbon_submissions')
      .select('electricity_kwh, diesel_liters, petrol_liters, lpg_kg, travel_km, water_liters, paper_kg, plastic_kg, ewaste_kg, organic_waste_kg')
      .gte('submission_date', `${year}-${mm}-01`)
      .lt('submission_date', nextMonth);

    if (!subs || subs.length === 0) return [];
    return submissionsToFactorBreakdown(subs);
  },

  // Get factor breakdown for a year (with fallback to direct query)
  async getByYear(year: number): Promise<FactorBreakdown[]> {
    const { data, error } = await supabase
      .rpc('get_factor_breakdown', {
        p_year: year,
        p_month: null
      });

    if (!error && data && data.length > 0) return data;

    // Fallback: aggregate from monthly_audit_data directly
    const { data: auditData } = await supabase
      .from('monthly_audit_data')
      .select('factor_name, calculated_co2e_kg')
      .eq('year', year);

    if (auditData && auditData.length > 0) {
      const byFactor: Record<string, number> = {};
      for (const r of auditData) {
        byFactor[r.factor_name] = (byFactor[r.factor_name] || 0) + parseFloat(r.calculated_co2e_kg);
      }
      const total = Object.values(byFactor).reduce((s, v) => s + v, 0);
      return Object.entries(byFactor).map(([factor_name, total_co2e_kg]) => ({
        factor_name,
        total_co2e_kg,
        percentage: total > 0 ? parseFloat(((total_co2e_kg / total) * 100).toFixed(2)) : 0
      })).sort((a, b) => b.total_co2e_kg - a.total_co2e_kg);
    }

    // Fallback 2: compute from legacy carbon_submissions
    const { data: subs } = await supabase
      .from('carbon_submissions')
      .select('electricity_kwh, diesel_liters, petrol_liters, lpg_kg, travel_km, water_liters, paper_kg, plastic_kg, ewaste_kg, organic_waste_kg')
      .gte('submission_date', `${year}-01-01`)
      .lte('submission_date', `${year}-12-31`);

    if (!subs || subs.length === 0) return [];
    return submissionsToFactorBreakdown(subs);
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

// ============================================
// ANALYTICAL FEATURES APIs
// ============================================

// Top Contributor API
export const topContributorApi = {
  async getForMonth(year: number, month: number): Promise<TopContributor | null> {
    const { data, error } = await supabase
      .rpc('get_top_contributor', {
        p_year: year,
        p_month: month
      });

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  }
};

// Factor Percentages API
export const factorPercentagesApi = {
  async getForMonth(year: number, month: number): Promise<FactorPercentage[]> {
    const { data, error } = await supabase
      .rpc('get_factor_percentages', {
        p_year: year,
        p_month: month
      });

    if (error) throw error;
    return data || [];
  },

  async getForYear(year: number): Promise<FactorPercentage[]> {
    const { data, error } = await supabase
      .rpc('get_factor_percentages', {
        p_year: year,
        p_month: null
      });

    if (error) throw error;
    return data || [];
  }
};

// Emission Intensity API
export const emissionIntensityApi = {
  async getForMonth(year: number, month: number): Promise<EmissionIntensityMetrics | null> {
    const { data, error } = await supabase
      .rpc('get_emission_intensity', {
        p_year: year,
        p_month: month
      });

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  },

  async getForYear(year: number): Promise<EmissionIntensityMetrics | null> {
    const { data, error } = await supabase
      .rpc('get_emission_intensity', {
        p_year: year,
        p_month: null
      });

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  }
};

// Reduction Simulator API
export const reductionSimulatorApi = {
  async simulate(
    year: number,
    month: number,
    reductionJson: Record<string, number>
  ): Promise<ReductionSimulation | null> {
    const { data, error } = await supabase
      .rpc('simulate_emission_reduction', {
        p_year: year,
        p_month: month,
        p_reduction_json: reductionJson
      });

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  }
};

// Scope Breakdown API
export const scopeBreakdownApi = {
  async getForMonth(year: number, month: number): Promise<ScopeBreakdownMetric[]> {
    const { data, error } = await supabase
      .rpc('get_scope_breakdown', {
        p_year: year,
        p_month: month
      });

    if (error) throw error;
    return data || [];
  },

  async getForYear(year: number): Promise<ScopeBreakdownMetric[]> {
    const { data, error } = await supabase
      .rpc('get_scope_breakdown', {
        p_year: year,
        p_month: null
      });

    if (error) throw error;
    return data || [];
  }
};

// Net Zero Projection API
export const netZeroProjectionApi = {
  async calculate(
    baselineYear: number,
    annualReductionPercentage: number = 5
  ): Promise<NetZeroProjection | null> {
    const { data, error } = await supabase
      .rpc('calculate_net_zero_year', {
        p_baseline_year: baselineYear,
        p_annual_reduction_percentage: annualReductionPercentage
      });

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  }
};
