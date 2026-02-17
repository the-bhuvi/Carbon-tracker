import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Recommendation } from '@/types/database';

/**
 * Hook to fetch carbon reduction recommendations for a specific year
 */
export function useRecommendations(year: number) {
  return useQuery({
    queryKey: ['carbon-recommendations', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('generate_recommendations', { target_year: year });
      
      if (error) throw error;
      return data as Recommendation[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: year > 0,
  });
}

/**
 * Hook to get high priority recommendations only
 */
export function useHighPriorityRecommendations(year: number) {
  const { data, ...rest } = useRecommendations(year);

  return {
    data: data?.filter((rec) => rec.priority === 'High') || [],
    ...rest,
  };
}

/**
 * Hook to get recommendations grouped by scope
 */
export function useRecommendationsByScope(year: number) {
  const { data, ...rest } = useRecommendations(year);

  const groupedData = data?.reduce((acc, rec) => {
    const scope = rec.scope;
    if (!acc[scope]) {
      acc[scope] = [];
    }
    acc[scope].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  return {
    data: groupedData,
    ...rest,
  };
}
