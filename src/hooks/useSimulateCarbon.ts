import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CarbonSimulation } from '@/types/database';

interface SimulationParams {
  year: number;
  treeCount?: number;
  electricityReduction?: number;
  travelReduction?: number;
  dieselReduction?: number;
}

/**
 * Debounce simulation params to avoid excessive API calls
 */
function useDebouncedParams(params: SimulationParams, delay = 400): SimulationParams {
  const [debouncedParams, setDebouncedParams] = useState(params);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedParams(params), delay);
    return () => clearTimeout(timer);
  }, [params.year, params.treeCount, params.electricityReduction, params.travelReduction, params.dieselReduction, delay]);

  return debouncedParams;
}

/**
 * Hook to simulate carbon reduction scenarios
 */
export function useSimulateCarbon(params: SimulationParams) {
  const {
    year,
    treeCount = 1000,
    electricityReduction = 0,
    travelReduction = 0,
    dieselReduction = 0,
  } = useDebouncedParams(params);

  return useQuery({
    queryKey: [
      'carbon-simulation',
      year,
      treeCount,
      electricityReduction,
      travelReduction,
      dieselReduction,
    ],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('simulate_carbon_reduction', {
        target_year: year,
        tree_count: treeCount,
        electricity_reduction: electricityReduction,
        travel_reduction: travelReduction,
        diesel_reduction: dieselReduction,
      });

      if (error) throw error;
      
      // The function returns a table, so we get the first row
      return (data as CarbonSimulation[])[0];
    },
    staleTime: 30_000, // Cache results for 30 seconds
    placeholderData: keepPreviousData, // Keep showing old data while fetching
    enabled: year > 0,
  });
}

/**
 * Hook to compare multiple simulation scenarios
 */
export function useCompareSimulations(scenarios: SimulationParams[]) {
  return useQuery({
    queryKey: ['carbon-simulation-compare', scenarios],
    queryFn: async () => {
      const promises = scenarios.map(async (scenario) => {
        const { data, error } = await supabase.rpc('simulate_carbon_reduction', {
          target_year: scenario.year,
          tree_count: scenario.treeCount || 1000,
          electricity_reduction: scenario.electricityReduction || 0,
          travel_reduction: scenario.travelReduction || 0,
          diesel_reduction: scenario.dieselReduction || 0,
        });

        if (error) throw error;
        return (data as CarbonSimulation[])[0];
      });

      return await Promise.all(promises);
    },
    staleTime: 0,
    enabled: scenarios.length > 0,
  });
}
