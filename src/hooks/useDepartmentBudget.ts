import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DepartmentBudget } from '@/types/database';

/**
 * Hook to fetch budget status for a specific department
 */
export function useDepartmentBudget(departmentId: string, year: number) {
  return useQuery({
    queryKey: ['department-budget', departmentId, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('check_department_budget', {
          dept_id: departmentId,
          target_year: year,
        });
      
      if (error) throw error;
      return (data as DepartmentBudget[])[0];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!departmentId && year > 0,
  });
}

/**
 * Hook to fetch all department budgets for comparison
 */
export function useAllDepartmentBudgets(year: number) {
  return useQuery({
    queryKey: ['all-department-budgets', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_all_department_budgets', { target_year: year });
      
      if (error) throw error;
      return data as DepartmentBudget[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: year > 0,
  });
}

/**
 * Hook to get departments exceeding their budget
 */
export function useDepartmentsOverBudget(year: number) {
  const { data, ...rest } = useAllDepartmentBudgets(year);

  return {
    data: data?.filter((dept) => dept.status === 'Exceeded') || [],
    ...rest,
  };
}

/**
 * Hook to get department budget summary stats
 */
export function useDepartmentBudgetStats(year: number) {
  const { data, ...rest } = useAllDepartmentBudgets(year);

  const stats = data
    ? {
        total: data.length,
        green: data.filter((d) => d.status === 'Green').length,
        yellow: data.filter((d) => d.status === 'Yellow').length,
        exceeded: data.filter((d) => d.status === 'Exceeded').length,
        totalEmissions: data.reduce((sum, d) => sum + d.current_emissions, 0),
        totalBudget: data.reduce((sum, d) => sum + d.allowed_budget, 0),
        averageUtilization:
          data.reduce((sum, d) => sum + d.budget_utilized_percent, 0) / data.length,
      }
    : null;

  return {
    data: stats,
    ...rest,
  };
}
