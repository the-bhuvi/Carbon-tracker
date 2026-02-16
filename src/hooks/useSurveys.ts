import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveysApi, surveyQuestionsApi, surveyResponsesApi } from '@/lib/supabase';

// Surveys Hooks
export const useSurveys = (status?: 'draft' | 'active' | 'closed') => {
  return useQuery({
    queryKey: ['surveys', status],
    queryFn: () => surveysApi.getAll(status)
  });
};

export const useSurveysByAudience = (audience: 'student' | 'faculty') => {
  return useQuery({
    queryKey: ['surveys', 'audience', audience],
    queryFn: () => surveysApi.getByAudience(audience)
  });
};

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => surveysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });
};

export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      surveysApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });
};

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => surveysApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });
};

// Survey Questions Hooks
export const useSurveyQuestions = (surveyId: string) => {
  return useQuery({
    queryKey: ['survey-questions', surveyId],
    queryFn: () => surveyQuestionsApi.getBySurveyId(surveyId),
    enabled: !!surveyId
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => surveyQuestionsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['survey-questions', variables.survey_id] });
    }
  });
};

export const useCreateManyQuestions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any[]) => surveyQuestionsApi.createMany(data),
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['survey-questions', variables[0].survey_id] });
      }
    }
  });
};

// Survey Responses Hooks
export const useSurveyResponses = (surveyId: string) => {
  return useQuery({
    queryKey: ['survey-responses', surveyId],
    queryFn: () => surveyResponsesApi.getBySurveyId(surveyId),
    enabled: !!surveyId
  });
};

export const useUserSurveyResponse = (surveyId: string, userId: string) => {
  return useQuery({
    queryKey: ['survey-response', surveyId, userId],
    queryFn: () => surveyResponsesApi.getUserResponse(surveyId, userId),
    enabled: !!surveyId && !!userId
  });
};

export const useSubmitSurveyResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => surveyResponsesApi.submit(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['survey-responses', variables.survey_id] });
      queryClient.invalidateQueries({ queryKey: ['survey-response', variables.survey_id, variables.user_id] });
    }
  });
};

export const useSurveyAnalytics = (surveyId: string) => {
  return useQuery({
    queryKey: ['survey-analytics', surveyId],
    queryFn: () => surveyResponsesApi.getAnalytics(surveyId),
    enabled: !!surveyId
  });
};
