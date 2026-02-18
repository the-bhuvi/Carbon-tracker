import type { CarbonSubmission } from '@/types/database';

/**
 * Format carbon amount with unit
 */
export const formatCarbon = (amount: number): string => {
  return `${amount.toFixed(2)} kg CO₂`;
};

/**
 * Get carbon score color
 */
export const getCarbonScoreColor = (score: string | null): string => {
  switch (score) {
    case 'Green':
      return 'text-green-600 bg-green-100';
    case 'Moderate':
      return 'text-yellow-600 bg-yellow-100';
    case 'High':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

/**
 * Get submission summary
 */
export const getSubmissionSummary = (submission: CarbonSubmission) => {
  const totalSources = [
    submission.electricity_kwh,
    submission.diesel_liters,
    submission.petrol_liters,
    submission.lpg_kg,
    submission.png_m3,
    submission.travel_km,
    submission.water_liters,
    submission.paper_kg,
    submission.ewaste_kg,
    submission.organic_waste_kg
  ].filter(val => val > 0).length;

  return {
    totalCarbon: submission.total_carbon || 0,
    score: submission.carbon_score || 'Unknown',
    trees: submission.tree_equivalent || 0,
    activeSources: totalSources,
    suggestions: submission.suggestions || []
  };
};

/**
 * Group submissions by date
 */
export const groupSubmissionsByDate = (submissions: CarbonSubmission[]) => {
  return submissions.reduce((groups, submission) => {
    const date = submission.submission_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(submission);
    return groups;
  }, {} as Record<string, CarbonSubmission[]>);
};

/**
 * Calculate total emissions from multiple submissions
 */
export const calculateTotalEmissions = (submissions: CarbonSubmission[]): number => {
  return submissions.reduce((total, sub) => total + (sub.total_carbon || 0), 0);
};

/**
 * Get average emissions
 */
export const getAverageEmissions = (submissions: CarbonSubmission[]): number => {
  if (submissions.length === 0) return 0;
  return calculateTotalEmissions(submissions) / submissions.length;
};

/**
 * Validate submission data
 */
export const validateSubmissionData = (data: Record<string, any>): string[] => {
  const errors: string[] = [];

  if (!data.user_id) {
    errors.push('User ID is required');
  }

  if (!data.department_id) {
    errors.push('Department ID is required');
  }

  // Check if at least one emission value is provided
  const hasEmissionData = [
    'electricity_kwh',
    'diesel_liters',
    'petrol_liters',
    'lpg_kg',
    'png_m3',
    'travel_km',
    'water_liters',
    'paper_kg',
    'ewaste_kg',
    'organic_waste_kg'
  ].some(field => data[field] && data[field] > 0);

  if (!hasEmissionData) {
    errors.push('At least one emission value must be greater than 0');
  }

  return errors;
};

/**
 * Format tree equivalent message
 */
export const formatTreeMessage = (trees: number): string => {
  if (trees < 1) {
    return `Less than 1 tree needed to offset`;
  } else if (trees === 1) {
    return `1 tree needed to offset annually`;
  } else {
    return `${Math.ceil(trees)} trees needed to offset annually`;
  }
};

/**
 * Get emission breakdown
 */
export const getEmissionBreakdown = (submission: CarbonSubmission, factors: any) => {
  return [
    {
      category: 'Electricity',
      value: submission.electricity_kwh,
      unit: 'kWh',
      carbon: (submission.electricity_kwh || 0) * factors.electricity_factor
    },
    {
      category: 'Diesel',
      value: submission.diesel_liters,
      unit: 'L',
      carbon: (submission.diesel_liters || 0) * factors.diesel_factor
    },
    {
      category: 'Petrol',
      value: submission.petrol_liters,
      unit: 'L',
      carbon: (submission.petrol_liters || 0) * factors.petrol_factor
    },
    {
      category: 'LPG',
      value: submission.lpg_kg,
      unit: 'kg',
      carbon: (submission.lpg_kg || 0) * factors.lpg_factor
    },
    {
      category: 'Travel',
      value: submission.travel_km,
      unit: 'km',
      carbon: (submission.travel_km || 0) * factors.travel_factor
    },
    {
      category: 'Water',
      value: submission.water_liters,
      unit: 'L',
      carbon: (submission.water_liters || 0) * factors.water_factor
    },
    {
      category: 'E-Waste',
      value: submission.ewaste_kg,
      unit: 'kg',
      carbon: (submission.ewaste_kg || 0) * factors.ewaste_factor
    }
  ].filter(item => item.value > 0);
};
