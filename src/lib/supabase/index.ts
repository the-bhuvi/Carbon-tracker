export { supabase } from './client';
export { auth } from './auth';
export {
  carbonSubmissionsApi,
  usersApi,
  analyticsApi,
  emissionFactorsApi,
  surveysApi,
  surveyQuestionsApi,
  surveyResponsesApi,
  // New institutional APIs
  enrolledStudentsApi,
  monthlyAuditApi,
  monthlyEmissionApi,
  academicYearEmissionApi,
  carbonOffsetsApi,
  carbonReductionsApi,
  neutralityApi,
  factorBreakdownApi,
  // Analytical features APIs
  topContributorApi,
  factorPercentagesApi,
  emissionIntensityApi,
  reductionSimulatorApi,
  scopeBreakdownApi,
  netZeroProjectionApi
} from './api';
