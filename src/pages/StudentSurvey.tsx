import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Leaf, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useSurveysByAudience, useSurveyQuestions, useUserSurveyResponse, useSubmitSurveyResponse } from "@/hooks/useSurveys";

const StudentSurvey = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, any>>({});

  // Fetch surveys for students
  const { data: surveys, isLoading: surveysLoading, error: surveysError } = useSurveysByAudience('student');
  
  // Fetch questions for selected survey
  const { data: questions, isLoading: questionsLoading } = useSurveyQuestions(selectedSurveyId);
  
  // Check if user already submitted this survey
  const { data: existingResponse, isLoading: responseLoading } = useUserSurveyResponse(selectedSurveyId, user?.id || '');
  
  // Submit mutation
  const { mutate: submitResponse, isPending: isSubmitting } = useSubmitSurveyResponse();

  const handleResponseChange = (questionId: string, value: any) => {
    // Convert empty strings to null for optional numeric fields
    const processedValue = value === '' ? null : value;
    setResponses(prev => ({ ...prev, [questionId]: processedValue }));
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setResponses(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter((v: string) => v !== option) };
      }
    });
  };

  const handleSubmit = () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to submit your response.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSurveyId) {
      toast({
        title: "No Survey Selected",
        description: "Please select a survey to submit.",
        variant: "destructive"
      });
      return;
    }

    // Validate required questions
    const requiredQuestions = questions?.filter(q => q.is_required) || [];
    const missingRequired = requiredQuestions.find(q => {
      const response = responses[q.id];
      return response === undefined || response === null || (Array.isArray(response) && response.length === 0) || response === '';
    });

    if (missingRequired) {
      toast({
        title: "Missing Required Fields",
        description: `Please answer: ${missingRequired.question_text}`,
        variant: "destructive"
      });
      return;
    }

    // Prepare submission
    const submissionData = {
      survey_id: selectedSurveyId,
      user_id: user.id,
      responses
    };

    submitResponse(submissionData, {
      onSuccess: (data) => {
        const carbonValue = data.total_carbon_kg 
          ? `${(data.total_carbon_kg / 1000).toFixed(2)} tons CO₂e` 
          : 'calculated';
        
        toast({
          title: "Survey Submitted Successfully!",
          description: `Thank you for your response. Your carbon footprint: ${carbonValue}`,
        });
        
        // Reset responses for this survey
        setResponses({});
      },
      onError: (error: any) => {
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit your response",
          variant: "destructive"
        });
      }
    });
  };

  const renderQuestion = (question: any) => {
    const questionId = question.id;
    const value = responses[questionId] || '';

    switch (question.question_type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(questionId, e.target.value)}
            placeholder="Enter your answer"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(questionId, e.target.value)}
            placeholder="Enter your answer"
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            step="0.01"
            min="0"
            value={value || ''}
            onChange={(e) => handleResponseChange(questionId, e.target.value)}
            placeholder={question.is_required ? "Enter a number" : "Enter a number (or leave blank if not applicable)"}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleResponseChange(questionId, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleResponseChange(questionId, val)}>
            {question.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${questionId}-${option}`} />
                <Label htmlFor={`${questionId}-${option}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const checkboxValues = value || [];
        return (
          <div className="space-y-2">
            {question.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${questionId}-${option}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(questionId, option, checked as boolean)}
                />
                <Label htmlFor={`${questionId}-${option}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(questionId, e.target.value)}
            placeholder="Enter your answer"
          />
        );
    }
  };

  if (surveysLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (surveysError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load surveys: {surveysError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!surveys || surveys.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            Student Surveys
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Participate in campus sustainability surveys
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No active surveys available at the moment. Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Leaf className="h-8 w-8 text-green-600" />
          Student Surveys
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Participate in campus sustainability surveys
        </p>
      </div>

      <div className="space-y-6">
        {/* Survey Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Available Surveys</CardTitle>
            <CardDescription>Select a survey to complete</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSurveyId === survey.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
                  }`}
                  onClick={() => setSelectedSurveyId(survey.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{survey.title}</h3>
                      {survey.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {survey.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                      {survey.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Show existing response if already submitted */}
        {selectedSurveyId && existingResponse && !responseLoading && (
          <Alert className="border-green-500">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">You have already submitted this survey!</p>
                {existingResponse.total_carbon_kg && (
                  <p className="text-sm">
                    Your carbon footprint: <strong>{(existingResponse.total_carbon_kg / 1000).toFixed(2)} tons CO₂e</strong>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Submitted on: {new Date(existingResponse.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Questions */}
        {selectedSurveyId && !existingResponse && (
          <>
            {questionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : questions && questions.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Survey Questions</CardTitle>
                    <CardDescription>Please answer all required questions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {questions.map((question, index) => (
                      <div key={question.id} className="space-y-2 pb-4 border-b last:border-b-0">
                        <Label className="text-base">
                          {index + 1}. {question.question_text}
                          {question.is_required && <span className="text-red-500 ml-1">*</span>}
                          {!question.is_required && <span className="text-gray-400 ml-1 text-xs">(Optional)</span>}
                        </Label>
                        {question.help_text && (
                          <p className="text-sm text-muted-foreground">{question.help_text}</p>
                        )}
                        {!question.is_required && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            💡 Leave blank if this question does not apply to you
                          </p>
                        )}
                        <div className="pt-2">
                          {renderQuestion(question)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Leaf className="mr-2 h-5 w-5" />
                      Submit Survey
                    </>
                  )}
                </Button>

                {/* Privacy Note */}
                <Alert>
                  <AlertDescription className="text-xs">
                    🔒 <strong>Privacy:</strong> Your responses are stored securely and used only for 
                    campus sustainability analysis. Individual responses are not shared publicly.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No questions found for this survey.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentSurvey;

