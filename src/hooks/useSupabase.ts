import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  carbonSubmissionsApi, 
  usersApi, 
  analyticsApi, 
  emissionFactorsApi, 
  enrolledStudentsApi,
  monthlyAuditApi,
  monthlyEmissionApi,
  academicYearEmissionApi,
  carbonOffsetsApi,
  carbonReductionsApi,
  neutralityApi,
  factorBreakdownApi,
  topContributorApi,
  factorPercentagesApi,
  emissionIntensityApi,
  reductionSimulatorApi,
  scopeBreakdownApi,
  netZeroProjectionApi,
  supabase 
} from '@/lib/supabase';
import type { CarbonSubmissionInput, MonthlyAuditData, DashboardViewMode } from '@/types/database';

// Carbon Submissions Hooks
export const useCarbonSubmissions = (userId?: string) => {
  return useQuery({
    queryKey: ['carbon-submissions', userId],
    queryFn: () => userId ? carbonSubmissionsApi.getByUserId(userId) : carbonSubmissionsApi.getRecent(),
    enabled: !!userId
  });
};

export const useCarbonSubmission = (id: string) => {
  return useQuery({
    queryKey: ['carbon-submission', id],
    queryFn: () => carbonSubmissionsApi.getById(id),
    enabled: !!id
  });
};

export const useCreateCarbonSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CarbonSubmissionInput) => carbonSubmissionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbon-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};

export const useUpdateCarbonSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CarbonSubmissionInput> }) =>
      carbonSubmissionsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbon-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};

export const useDeleteCarbonSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carbonSubmissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbon-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};

export const useCarbonSubmissionsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['carbon-submissions', 'date-range', startDate, endDate],
    queryFn: () => carbonSubmissionsApi.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate
  });
};

// Departments Hooks - REMOVED, use institutional-level hooks instead

// Users Hooks (updated)
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return usersApi.getCurrentUser();
    },
    retry: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll()
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ name: string; email: string }> }) =>
      usersApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    }
  });
};

// Analytics Hooks - REMOVED (legacy department-based)

// Institutional Monthly Audit Hooks

// Enrolled Students Hooks
export const useEnrolledStudents = (academicYear: string) => {
  return useQuery({
    queryKey: ['enrolled-students', academicYear],
    queryFn: () => enrolledStudentsApi.getByAcademicYear(academicYear),
    enabled: !!academicYear
  });
};

export const useAllEnrolledStudents = () => {
  return useQuery({
    queryKey: ['enrolled-students', 'all'],
    queryFn: () => enrolledStudentsApi.getAll()
  });
};

export const useUpsertEnrolledStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ academicYear, totalStudents, notes }: { academicYear: string; totalStudents: number; notes?: string }) =>
      enrolledStudentsApi.upsert(academicYear, totalStudents, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-students'] });
    }
  });
};

// Monthly Audit Data Hooks
export const useMonthlyAuditData = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['monthly-audit', year, month],
    queryFn: () => month && year ? monthlyAuditApi.getByMonth(year, month) : Promise.resolve([]),
    enabled: !!(year && month)
  });
};

export const useMonthlyAuditByYear = (year: number) => {
  return useQuery({
    queryKey: ['monthly-audit', year],
    queryFn: () => monthlyAuditApi.getByYear(year),
    enabled: !!year
  });
};

export const useUpsertMonthlyAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MonthlyAuditData, 'id' | 'created_at' | 'updated_at' | 'calculated_co2e_kg'>) =>
      monthlyAuditApi.upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-audit'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
      queryClient.invalidateQueries({ queryKey: ['academic-year-summary'] });
    }
  });
};

// Monthly Emission Summary Hooks
export const useMonthlyEmissionSummary = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['monthly-summary', year, month],
    queryFn: () => year && month ? monthlyEmissionApi.getByMonth(year, month) : Promise.resolve(null),
    enabled: !!(year && month)
  });
};

export const useMonthlyEmissionByYear = (year: number) => {
  return useQuery({
    queryKey: ['monthly-summary', year],
    queryFn: () => monthlyEmissionApi.getByYear(year),
    enabled: !!year
  });
};

export const useRefreshMonthlyEmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      monthlyEmissionApi.refresh(year, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
    }
  });
};

// Academic Year Emission Summary Hooks
export const useAcademicYearEmissionSummary = (academicYear: string) => {
  return useQuery({
    queryKey: ['academic-year-summary', academicYear],
    queryFn: () => academicYearEmissionApi.getByAcademicYear(academicYear),
    enabled: !!academicYear
  });
};

export const useAllAcademicYearSummaries = () => {
  return useQuery({
    queryKey: ['academic-year-summary', 'all'],
    queryFn: () => academicYearEmissionApi.getAll()
  });
};

export const useRefreshAcademicYearEmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (academicYear: string) =>
      academicYearEmissionApi.refresh(academicYear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-year-summary'] });
    }
  });
};

// Factor Breakdown Hooks
export const useFactorBreakdown = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['factor-breakdown', year, month],
    queryFn: () => {
      if (year && month) {
        return factorBreakdownApi.getByMonth(year, month);
      } else if (year) {
        return factorBreakdownApi.getByYear(year);
      }
      return Promise.resolve([]);
    },
    enabled: !!year
  });
};

// Neutrality Hooks
export const useMonthlyNeutrality = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['neutrality', 'monthly', year, month],
    queryFn: () => year && month ? neutralityApi.getMonthlyNeutrality(year, month) : Promise.resolve(0),
    enabled: !!(year && month)
  });
};

export const useAcademicYearNeutrality = (academicYear: string) => {
  return useQuery({
    queryKey: ['neutrality', 'academic-year', academicYear],
    queryFn: () => academicYear ? neutralityApi.getAcademicYearNeutrality(academicYear) : Promise.resolve(0),
    enabled: !!academicYear
  });
};

// Carbon Offsets Hooks
export const useCarbonOffsetsMonth = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['carbon-offsets', year, month],
    queryFn: () => year && month ? carbonOffsetsApi.getByMonth(year, month) : Promise.resolve([]),
    enabled: !!(year && month)
  });
};

export const useCarbonOffsetsYear = (academicYear: string) => {
  return useQuery({
    queryKey: ['carbon-offsets', academicYear],
    queryFn: () => academicYear ? carbonOffsetsApi.getByAcademicYear(academicYear) : Promise.resolve([]),
    enabled: !!academicYear
  });
};

export const useCreateCarbonOffset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => carbonOffsetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbon-offsets'] });
      queryClient.invalidateQueries({ queryKey: ['neutrality'] });
    }
  });
};

// Carbon Reductions Hooks
export const useCarbonReductionsMonth = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['carbon-reductions', year, month],
    queryFn: () => year && month ? carbonReductionsApi.getByMonth(year, month) : Promise.resolve([]),
    enabled: !!(year && month)
  });
};

export const useCarbonReductionsYear = (academicYear: string) => {
  return useQuery({
    queryKey: ['carbon-reductions', academicYear],
    queryFn: () => academicYear ? carbonReductionsApi.getByAcademicYear(academicYear) : Promise.resolve([]),
    enabled: !!academicYear
  });
};

export const useCreateCarbonReduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => carbonReductionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbon-reductions'] });
      queryClient.invalidateQueries({ queryKey: ['neutrality'] });
    }
  });
};

// Emission Factors Hooks
export const useEmissionFactors = () => {
  return useQuery({
    queryKey: ['emission-factors'],
    queryFn: () => emissionFactorsApi.getCurrent()
  });
};

export const useUpdateEmissionFactors = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<{
      electricity_factor: number;
      diesel_factor: number;
      petrol_factor: number;
      lpg_factor: number;
      travel_factor: number;
      water_factor: number;
      ewaste_factor: number;
    }>) => emissionFactorsApi.update(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emission-factors'] });
    }
  });
};

// ============================================
// ANALYTICAL FEATURES HOOKS
// ============================================

// Top Contributor Hook
export const useTopContributor = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['top-contributor', year, month],
    queryFn: () => year && month ? topContributorApi.getForMonth(year, month) : Promise.resolve(null),
    enabled: !!(year && month)
  });
};

// Factor Percentages Hook
export const useFactorPercentages = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['factor-percentages', year, month],
    queryFn: () => {
      if (year && month) {
        return factorPercentagesApi.getForMonth(year, month);
      } else if (year) {
        return factorPercentagesApi.getForYear(year);
      }
      return Promise.resolve([]);
    },
    enabled: !!year
  });
};

// Emission Intensity Hook
export const useEmissionIntensity = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['emission-intensity', year, month],
    queryFn: () => {
      if (year && month) {
        return emissionIntensityApi.getForMonth(year, month);
      } else if (year) {
        return emissionIntensityApi.getForYear(year);
      }
      return Promise.resolve(null);
    },
    enabled: !!year
  });
};

// Reduction Simulator Hook (Mutation)
export const useSimulateReduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      year,
      month,
      reductions
    }: {
      year: number;
      month: number;
      reductions: Record<string, number>;
    }) => reductionSimulatorApi.simulate(year, month, reductions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emission-simulations'] });
    }
  });
};

// Scope Breakdown Hook
export const useScopeBreakdown = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['scope-breakdown', year, month],
    queryFn: () => {
      if (year && month) {
        return scopeBreakdownApi.getForMonth(year, month);
      } else if (year) {
        return scopeBreakdownApi.getForYear(year);
      }
      return Promise.resolve([]);
    },
    enabled: !!year
  });
};

// Net Zero Projection Hook
export const useNetZeroProjection = (baselineYear?: number, annualReduction: number = 5) => {
  return useQuery({
    queryKey: ['net-zero-projection', baselineYear, annualReduction],
    queryFn: () =>
      baselineYear
        ? netZeroProjectionApi.calculate(baselineYear, annualReduction)
        : Promise.resolve(null),
    enabled: !!baselineYear
  });
};
