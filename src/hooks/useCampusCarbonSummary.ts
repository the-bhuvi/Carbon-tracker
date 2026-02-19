import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CampusCarbonSummary } from '@/types/database';

// Emission factors (kg CO2e per unit)
const EF = {
  electricity: 0.73,   // kWh - Scope 2
  diesel: 2.68,        // liters - Scope 1
  petrol: 2.31,        // liters - Scope 1
  lpg: 1.50,           // kg - Scope 1
  organic_waste: 0.50, // kg - Scope 1
  travel: 0.12,        // km - Scope 3
  water: 0.00035,      // liters - Scope 3
  paper: 1.70,         // kg - Scope 3
  plastic: 2.00,       // kg - Scope 3
  ewaste: 3.50,        // kg - Scope 3
};
const TREE_ABSORPTION_KG_PER_YEAR = 21.77;
const DEFAULT_TREE_COUNT = 1000;

function buildSummaryFromRows(
  rows: any[],
  yearOrLabel: number | string,
  treeCount = DEFAULT_TREE_COUNT
): CampusCarbonSummary {
  let scope1 = 0, scope2 = 0, scope3 = 0;
  for (const r of rows) {
    scope1 +=
      parseFloat(r.diesel_liters || 0) * EF.diesel +
      parseFloat(r.petrol_liters || 0) * EF.petrol +
      parseFloat(r.lpg_kg || 0) * EF.lpg +
      parseFloat(r.organic_waste_kg || 0) * EF.organic_waste;
    scope2 += parseFloat(r.electricity_kwh || 0) * EF.electricity;
    scope3 +=
      parseFloat(r.travel_km || 0) * EF.travel +
      parseFloat(r.water_liters || 0) * EF.water +
      parseFloat(r.paper_kg || 0) * EF.paper +
      parseFloat(r.plastic_kg || 0) * EF.plastic +
      parseFloat(r.ewaste_kg || 0) * EF.ewaste;
  }
  const total = scope1 + scope2 + scope3;
  const absorption = treeCount * TREE_ABSORPTION_KG_PER_YEAR;
  const net = total - absorption;
  const neutralityPct = total > 0 ? parseFloat(((absorption / total) * 100).toFixed(2)) : 0;
  const treesNeeded = absorption >= total ? 0 : Math.ceil((total - absorption) / TREE_ABSORPTION_KG_PER_YEAR);
  return {
    id: String(yearOrLabel),
    year: typeof yearOrLabel === 'number' ? yearOrLabel : parseInt(String(yearOrLabel).split('-')[0]),
    total_scope1: parseFloat(scope1.toFixed(2)),
    total_scope2: parseFloat(scope2.toFixed(2)),
    total_scope3: parseFloat(scope3.toFixed(2)),
    total_emissions: parseFloat(total.toFixed(2)),
    total_tree_count: treeCount,
    tree_absorption_kg: parseFloat(absorption.toFixed(2)),
    net_carbon_kg: parseFloat(net.toFixed(2)),
    carbon_neutrality_percentage: neutralityPct,
    trees_needed_for_offset: treesNeeded,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function fetchSubmissionsForYear(year: number) {
  const { data } = await supabase
    .from('carbon_submissions')
    .select('electricity_kwh,diesel_liters,petrol_liters,lpg_kg,travel_km,water_liters,paper_kg,plastic_kg,ewaste_kg,organic_waste_kg')
    .gte('submission_date', `${year}-01-01`)
    .lte('submission_date', `${year}-12-31`);
  return data || [];
}

async function fetchSubmissionsForAcademicYear(academicYear: string) {
  const [startYear, endYear] = academicYear.split('-').map(Number);
  // Academic year: Jul startYear - Jun endYear
  const { data } = await supabase
    .from('carbon_submissions')
    .select('electricity_kwh,diesel_liters,petrol_liters,lpg_kg,travel_km,water_liters,paper_kg,plastic_kg,ewaste_kg,organic_waste_kg')
    .gte('submission_date', `${startYear}-07-01`)
    .lte('submission_date', `${endYear}-06-30`);
  return data || [];
}

function buildSummaryFromAuditRows(
  auditRows: any[],
  yearOrLabel: number | string,
  treeCount = DEFAULT_TREE_COUNT
): CampusCarbonSummary {
  const SCOPE1_FACTORS = ['Diesel', 'Petrol', 'LPG', 'Natural Gas', 'Organic Waste'];
  const SCOPE2_FACTORS = ['Electricity'];
  let scope1 = 0, scope2 = 0, scope3 = 0;
  for (const r of auditRows) {
    const co2e = parseFloat(r.calculated_co2e_kg || 0);
    if (SCOPE1_FACTORS.some(f => r.factor_name?.includes(f))) scope1 += co2e;
    else if (SCOPE2_FACTORS.some(f => r.factor_name?.includes(f))) scope2 += co2e;
    else scope3 += co2e;
  }
  const total = scope1 + scope2 + scope3;
  const absorption = treeCount * TREE_ABSORPTION_KG_PER_YEAR;
  const net = total - absorption;
  const neutralityPct = total > 0 ? parseFloat(((absorption / total) * 100).toFixed(2)) : 0;
  const treesNeeded = absorption >= total ? 0 : Math.ceil((total - absorption) / TREE_ABSORPTION_KG_PER_YEAR);
  return {
    id: String(yearOrLabel),
    year: typeof yearOrLabel === 'number' ? yearOrLabel : parseInt(String(yearOrLabel).split('-')[0]),
    total_scope1: parseFloat(scope1.toFixed(2)),
    total_scope2: parseFloat(scope2.toFixed(2)),
    total_scope3: parseFloat(scope3.toFixed(2)),
    total_emissions: parseFloat(total.toFixed(2)),
    total_tree_count: treeCount,
    tree_absorption_kg: parseFloat(absorption.toFixed(2)),
    net_carbon_kg: parseFloat(net.toFixed(2)),
    carbon_neutrality_percentage: neutralityPct,
    trees_needed_for_offset: treesNeeded,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Hook to fetch campus carbon summary for a specific calendar year.
 * Falls back to monthly_audit_data, then carbon_submissions if RPC fails.
 */
export function useCampusCarbonSummary(year: number) {
  return useQuery({
    queryKey: ['campus-carbon-summary', year],
    queryFn: async (): Promise<CampusCarbonSummary | null> => {
      // Try RPC first
      try {
        const { data, error } = await supabase
          .rpc('get_campus_carbon_summary', { target_year: year });
        if (!error && data) return data as CampusCarbonSummary;
      } catch (_) { /* fall through */ }

      // Fallback 1: monthly_audit_data
      const { data: auditRows } = await supabase
        .from('monthly_audit_data')
        .select('factor_name,calculated_co2e_kg')
        .eq('year', year);
      if (auditRows && auditRows.length > 0) {
        return buildSummaryFromAuditRows(auditRows, year);
      }

      // Fallback 2: carbon_submissions
      const rows = await fetchSubmissionsForYear(year);
      if (rows.length === 0) return null;
      return buildSummaryFromRows(rows, year);
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch campus carbon summary for an academic year (Jul startYear – Jun endYear).
 * e.g. "2024-2025" covers Jul 2024 – Jun 2025
 */
export function useCampusCarbonSummaryByAcademicYear(academicYear: string) {
  return useQuery({
    queryKey: ['campus-carbon-summary-academic', academicYear],
    queryFn: async (): Promise<CampusCarbonSummary | null> => {
      const [startYear, endYear] = academicYear.split('-').map(Number);

      // Try carbon_submissions with academic year date range
      const rows = await fetchSubmissionsForAcademicYear(academicYear);
      if (rows.length > 0) {
        return buildSummaryFromRows(rows, academicYear);
      }

      // Fallback: monthly_audit_data for Jul-Dec of startYear and Jan-Jun of endYear
      const { data: auditRows } = await supabase
        .from('monthly_audit_data')
        .select('factor_name,calculated_co2e_kg,year,month')
        .or(`and(year.eq.${startYear},month.gte.7),and(year.eq.${endYear},month.lte.6)`);
      if (auditRows && auditRows.length > 0) {
        return buildSummaryFromAuditRows(auditRows, academicYear);
      }

      return null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!academicYear,
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
      queryClient.invalidateQueries({ queryKey: ['campus-carbon-summary', variables.year] });
    },
  });
}

/**
 * Hook to get campus carbon summaries for multiple years (trend view)
 */
export function useCampusCarbonTrend(years: number[]) {
  return useQuery({
    queryKey: ['campus-carbon-trend', years],
    queryFn: async () => {
      const results = await Promise.all(
        years.map(async (year) => {
          try {
            const { data, error } = await supabase
              .rpc('get_campus_carbon_summary', { target_year: year });
            if (!error && data) return data as CampusCarbonSummary;
          } catch (_) { /* fall through */ }
          const rows = await fetchSubmissionsForYear(year);
          return rows.length > 0 ? buildSummaryFromRows(rows, year) : null;
        })
      );
      return results.filter(Boolean) as CampusCarbonSummary[];
    },
    staleTime: 1000 * 60 * 5,
    enabled: years.length > 0,
  });
}
