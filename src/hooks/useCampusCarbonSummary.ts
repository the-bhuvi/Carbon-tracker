import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CampusCarbonSummary } from '@/types/database';

/**
 * Hook to fetch campus carbon summary for a specific year
 */
export function useCampusCarbonSummary(year: number) {
  return useQuery({
    queryKey: ['campus-carbon-summary', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_campus_carbon_summary', { target_year: year });
      
      if (error) throw error;
      return data as CampusCarbonSummary;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to refresh campus carbon summary with updated tree count
 */
export function useRefreshCampusSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year, treeCount }: { year: number; treeCount?: number }) => {
      const { data, error } = await supabase
        .rpc('refresh_campus_carbon_summary', {
          target_year: year,
          tree_count: treeCount || 1000,
        });
      
      if (error) throw error;
      return data as CampusCarbonSummary;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch the summary for this year
      queryClient.invalidateQueries({ queryKey: ['campus-carbon-summary', variables.year] });
    },
  });
}

/**
 * Hook to get campus carbon summaries for multiple years
 */
export function useCampusCarbonTrend(years: number[]) {
  return useQuery({
    queryKey: ['campus-carbon-trend', years],
    queryFn: async () => {
      const promises = years.map(async (year) => {
        const { data, error } = await supabase
          .rpc('get_campus_carbon_summary', { target_year: year });
        
        if (error) throw error;
        return data as CampusCarbonSummary;
      });

      return await Promise.all(promises);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: years.length > 0,
  });
}
