import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carbonSubmissionsApi, departmentsApi, usersApi, analyticsApi, emissionFactorsApi, supabase } from '@/lib/supabase';
import type { CarbonSubmissionInput } from '@/types/database';

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

// Departments Hooks
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll()
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentsApi.getById(id),
    enabled: !!id
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; building_area?: number; student_count?: number }) =>
      departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    }
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ name: string; building_area: number; student_count: number }> }) =>
      departmentsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    }
  });
};

// Users Hooks
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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ name: string; email: string; department_id: string }> }) =>
      usersApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    }
  });
};

// Analytics Hooks
export const useDepartmentSummary = () => {
  return useQuery({
    queryKey: ['analytics', 'department-summary'],
    queryFn: () => analyticsApi.getDepartmentSummary()
  });
};

export const useMonthlyTrends = (departmentId?: string) => {
  return useQuery({
    queryKey: ['analytics', 'monthly-trends', departmentId],
    queryFn: () => analyticsApi.getMonthlyTrends(departmentId)
  });
};

export const usePerCapitaEmissions = () => {
  return useQuery({
    queryKey: ['analytics', 'per-capita'],
    queryFn: () => analyticsApi.getPerCapitaEmissions()
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
      png_factor: number;
      travel_factor: number;
      water_factor: number;
      ewaste_factor: number;
    }>) => emissionFactorsApi.update(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emission-factors'] });
    }
  });
};
