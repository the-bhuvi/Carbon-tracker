import { useState } from 'react';
import { Plus, Eye, Trash2, FileBarChart, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import {
  useSurveys,
  useCreateSurvey,
  useUpdateSurvey,
  useDeleteSurvey,
  useCreateManyQuestions,
  useSurveyResponses,
  useSurveyAnalytics,
  useSurveyQuestions
} from '@/hooks/useSurveys';
import type { Survey, SurveyQuestion, SurveyQuestionInput } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

const EMISSION_CATEGORIES = [
  'electricity',
  'diesel',
  'petrol',
  'lpg',
  'travel',
  'water',
  'paper',
  'ewaste',
  'organic_waste',
  'other'
];

const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' }
];

interface QuestionBuilder {
  question_text: string;
  question_type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  options: string;
  is_required: boolean;
  emission_category: string;
  conversion_factor: string;
}

export default function AdminSurveyManagement() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<'active' | 'draft' | 'closed'>('active');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'responses' | 'analytics'>('list');

  // Queries
  const { data: activeSurveys, isLoading: loadingActive } = useSurveys('active');
  const { data: draftSurveys, isLoading: loadingDraft } = useSurveys('draft');
  const { data: closedSurveys, isLoading: loadingClosed } = useSurveys('closed');

  // Mutations
  const createSurvey = useCreateSurvey();
  const updateSurvey = useUpdateSurvey();
  const deleteSurvey = useDeleteSurvey();
  const createQuestions = useCreateManyQuestions();

  // Survey Form State
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    target_audience: 'student' as 'student' | 'faculty' | 'both',
    status: 'draft' as 'draft' | 'active' | 'closed',
    start_date: '',
    end_date: ''
  });

  // Question Builder State
  const [questions, setQuestions] = useState<QuestionBuilder[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionBuilder>({
    question_text: '',
    question_type: 'text',
    options: '',
    is_required: false,
    emission_category: '',
    conversion_factor: ''
  });

  const addQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      toast({
        title: 'Error',
        description: 'Question text is required',
        variant: 'destructive'
      });
      return;
    }

    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      question_text: '',
      question_type: 'text',
      options: '',
      is_required: false,
      emission_category: '',
      conversion_factor: ''
    });

    toast({
      title: 'Question Added',
      description: 'Question added to survey'
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addDefaultQuestions = () => {
    const defaultQuestions: QuestionBuilder[] = [
      // Energy & Electricity
      {
        question_text: 'How many hours per day do you use air conditioning or room heater?',
        question_type: 'number',
        is_required: true,
        emission_category: 'electricity',
        conversion_factor: '2.5',
        options: ''
      },
      {
        question_text: 'How many hours per day do you use fans?',
        question_type: 'number',
        is_required: true,
        emission_category: 'electricity',
        conversion_factor: '0.25',
        options: ''
      },
      {
        question_text: 'How many lights/bulbs do you typically keep on at night in your room/home?',
        question_type: 'number',
        is_required: true,
        emission_category: 'electricity',
        conversion_factor: '0.08',
        options: ''
      },
      {
        question_text: 'How many hours per day do you charge your phone, laptop, and other devices (total)?',
        question_type: 'number',
        is_required: true,
        emission_category: 'electricity',
        conversion_factor: '0.15',
        options: ''
      },
      {
        question_text: 'Do you use a geyser/water heater for bathing?',
        question_type: 'radio',
        is_required: true,
        emission_category: 'electricity',
        conversion_factor: '2.0',
        options: 'Yes daily,Yes occasionally,No'
      },
      
      // Transportation
      {
        question_text: 'What is your primary mode of transportation to college/work?',
        question_type: 'select',
        is_required: true,
        emission_category: 'travel',
        conversion_factor: '0',
        options: 'Walking,Bicycle,College Bus,City Bus,Metro/Train,Two-wheeler (petrol),Car,Auto-rickshaw'
      },
      {
        question_text: 'How many kilometers do you travel per day (one-way distance to college/work)?',
        question_type: 'number',
        is_required: true,
        emission_category: 'travel',
        conversion_factor: '0.24',
        options: ''
      },
      {
        question_text: 'Do you use elevator/lift instead of stairs?',
        question_type: 'radio',
        is_required: true,
        emission_category: 'electricity',
        conversion_factor: '0.1',
        options: 'Always,Sometimes,Rarely,Never'
      },
      
      // Water Usage
      {
        question_text: 'How many minutes do you spend in the shower daily?',
        question_type: 'number',
        is_required: true,
        emission_category: 'water',
        conversion_factor: '0.015',
        options: ''
      },
      {
        question_text: 'How many bottles (1 liter) of water do you drink per day?',
        question_type: 'number',
        is_required: true,
        emission_category: 'water',
        conversion_factor: '0.0003',
        options: ''
      },
      
      // Waste & Consumption
      {
        question_text: 'How many plastic bottles/packets do you use per day?',
        question_type: 'number',
        is_required: true,
        emission_category: 'plastic_waste',
        conversion_factor: '1.2',
        options: ''
      },
      {
        question_text: 'How many printed pages/sheets of paper do you use per day?',
        question_type: 'number',
        is_required: false,
        emission_category: 'paper',
        conversion_factor: '0.005',
        options: ''
      },
      {
        question_text: 'Do you waste food during meals?',
        question_type: 'radio',
        is_required: true,
        emission_category: 'organic_waste',
        conversion_factor: '0.3',
        options: 'Never,Rarely,Sometimes,Often'
      },
      {
        question_text: 'How many meals do you cook at home per day (using gas/electricity)?',
        question_type: 'number',
        is_required: true,
        emission_category: 'lpg',
        conversion_factor: '0.8',
        options: ''
      },
      {
        question_text: 'Do you carry a reusable bag while shopping or use plastic bags?',
        question_type: 'radio',
        is_required: true,
        emission_category: 'plastic_waste',
        conversion_factor: '0',
        options: 'Always reusable bag,Sometimes reusable,Usually plastic bags'
      }
    ];
    
    setQuestions(defaultQuestions);
    toast({
      title: 'Default Questions Added',
      description: `${defaultQuestions.length} daily carbon footprint questions have been added to your survey`
    });
  };

  const handleCreateSurvey = async () => {
    if (!surveyForm.title.trim()) {
      toast({
        title: 'Error',
        description: 'Survey title is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create survey
      const survey = await createSurvey.mutateAsync(surveyForm);

      // Create questions if any
      if (questions.length > 0) {
        const questionsData: SurveyQuestionInput[] = questions.map((q, index) => ({
          survey_id: survey.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options ? q.options.split(',').map(o => o.trim()) : undefined,
          is_required: q.is_required,
          order_index: index,
          emission_category: q.emission_category || undefined,
          conversion_factor: q.conversion_factor ? parseFloat(q.conversion_factor) : undefined
        }));

        await createQuestions.mutateAsync(questionsData);
      }

      toast({
        title: 'Survey Created',
        description: `Survey "${survey.title}" has been created successfully`
      });

      // Reset form
      setSurveyForm({
        title: '',
        description: '',
        target_audience: 'student',
        status: 'draft',
        start_date: '',
        end_date: ''
      });
      setQuestions([]);
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create survey',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (surveyId: string, status: 'draft' | 'active' | 'closed') => {
    try {
      await updateSurvey.mutateAsync({ id: surveyId, updates: { status } });
      toast({
        title: 'Survey Updated',
        description: `Survey status changed to ${status}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update survey',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSurvey = async (surveyId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteSurvey.mutateAsync(surveyId);
      toast({
        title: 'Survey Deleted',
        description: `Survey "${title}" has been deleted`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete survey',
        variant: 'destructive'
      });
    }
  };

  const getSurveysForTab = () => {
    switch (selectedTab) {
      case 'active':
        return activeSurveys || [];
      case 'draft':
        return draftSurveys || [];
      case 'closed':
        return closedSurveys || [];
      default:
        return [];
    }
  };

  const isLoading = loadingActive || loadingDraft || loadingClosed;

  if (viewMode === 'responses' && selectedSurvey) {
    return <SurveyResponses survey={selectedSurvey} onBack={() => setViewMode('list')} />;
  }

  if (viewMode === 'analytics' && selectedSurvey) {
    return <SurveyAnalytics survey={selectedSurvey} onBack={() => setViewMode('list')} />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Survey Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage carbon tracking surveys</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Survey</DialogTitle>
              <DialogDescription>
                Create a new carbon tracking survey for students or faculty
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Survey Title*</Label>
                    <Input
                      id="title"
                      value={surveyForm.title}
                      onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                      placeholder="e.g., Monthly Carbon Footprint Survey"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={surveyForm.description}
                      onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                      placeholder="Brief description of the survey purpose"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target_audience">Target Audience</Label>
                      <Select
                        value={surveyForm.target_audience}
                        onValueChange={(value: any) => setSurveyForm({ ...surveyForm, target_audience: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Students</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={surveyForm.status}
                        onValueChange={(value: any) => setSurveyForm({ ...surveyForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={surveyForm.start_date}
                        onChange={(e) => setSurveyForm({ ...surveyForm, start_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={surveyForm.end_date}
                        onChange={(e) => setSurveyForm({ ...surveyForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Question Builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDefaultQuestions}
                    disabled={questions.length > 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Default Carbon Tracking Questions
                  </Button>
                </div>

                {questions.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      Click "Add Default Carbon Tracking Questions" to include pre-configured questions with proper conversion factors for calculating carbon emissions.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Added Questions List */}
                {questions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {questions.length} questions added with pre-configured emission factors
                    </p>
                    <ScrollArea className="h-[300px] border rounded-md p-4">
                      {questions.map((q, index) => (
                        <Card key={index} className="mb-2">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">Q{index + 1}.</span>
                                  <span>{q.question_text}</span>
                                  {q.is_required && <Badge variant="outline">Required</Badge>}
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Type: {q.question_type}</p>
                                  {q.options && <p>Options: {q.options}</p>}
                                  {q.emission_category && <p>Category: {q.emission_category}</p>}
                                  {q.conversion_factor && <p>Conversion Factor: {q.conversion_factor} kg CO₂</p>}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </ScrollArea>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestions([])}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Questions
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSurvey} disabled={createSurvey.isPending}>
                  {createSurvey.isPending ? 'Creating...' : 'Create Survey'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Surveys Tabs */}
      <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading surveys...</p>
            </div>
          ) : getSurveysForTab().length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No {selectedTab} surveys found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getSurveysForTab().map((survey) => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onViewResponses={(s) => {
                    setSelectedSurvey(s);
                    setViewMode('responses');
                  }}
                  onViewAnalytics={(s) => {
                    setSelectedSurvey(s);
                    setViewMode('analytics');
                  }}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteSurvey}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Survey Card Component
function SurveyCard({
  survey,
  onViewResponses,
  onViewAnalytics,
  onUpdateStatus,
  onDelete
}: {
  survey: Survey;
  onViewResponses: (survey: Survey) => void;
  onViewAnalytics: (survey: Survey) => void;
  onUpdateStatus: (id: string, status: 'draft' | 'active' | 'closed') => void;
  onDelete: (id: string, title: string) => void;
}) {
  const { data: responses } = useSurveyResponses(survey.id);
  const responseCount = responses?.length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle>{survey.title}</CardTitle>
            <CardDescription className="mt-1">{survey.description}</CardDescription>
          </div>
          <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
            {survey.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Survey Info */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Target:</span>
              <span className="font-medium capitalize">{survey.target_audience}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Responses:</span>
              <span className="font-medium">{responseCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{format(new Date(survey.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Dates */}
          {(survey.start_date || survey.end_date) && (
            <div className="text-sm text-muted-foreground">
              {survey.start_date && `From: ${format(new Date(survey.start_date), 'MMM d, yyyy')}`}
              {survey.start_date && survey.end_date && ' · '}
              {survey.end_date && `To: ${format(new Date(survey.end_date), 'MMM d, yyyy')}`}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewResponses(survey)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Responses
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewAnalytics(survey)}
            >
              <FileBarChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>

            {/* Status Change Buttons */}
            {survey.status !== 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(survey.id, 'active')}
              >
                Activate
              </Button>
            )}
            {survey.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(survey.id, 'closed')}
              >
                Close
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(survey.id, survey.title)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Survey Responses Component
function SurveyResponses({ survey, onBack }: { survey: Survey; onBack: () => void }) {
  const { data: responses, isLoading } = useSurveyResponses(survey.id);
  const { data: questions } = useSurveyQuestions(survey.id);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Back to Surveys
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{survey.title} - Responses</CardTitle>
          <CardDescription>View all survey responses</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading responses...</p>
          ) : !responses || responses.length === 0 ? (
            <Alert>
              <AlertDescription>No responses yet for this survey.</AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Total Carbon (kg CO₂)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response: any) => (
                    <TableRow key={response.id}>
                      <TableCell>{response.user?.name || 'Unknown'}</TableCell>
                      <TableCell>{response.department?.name || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(response.submitted_at), 'MMM d, yyyy HH:mm')}</TableCell>
                      <TableCell className="font-medium">
                        {response.total_carbon ? response.total_carbon.toFixed(2) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Response Details</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[500px]">
                              <div className="space-y-4">
                                {Object.entries(response.responses || {}).map(([questionId, answer]) => {
                                  const question = questions?.find(q => q.id === questionId);
                                  return (
                                    <div key={questionId} className="border-b pb-3">
                                      <p className="font-medium mb-1">{question?.question_text || questionId}</p>
                                      <p className="text-muted-foreground">{String(answer)}</p>
                                    </div>
                                  );
                                })}
                                {response.calculated_emissions && (
                                  <div className="pt-4">
                                    <h4 className="font-semibold mb-2">Calculated Emissions</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      {Object.entries(response.calculated_emissions).map(([cat, value]) => (
                                        <div key={cat}>
                                          <span className="text-muted-foreground">{cat}:</span>{' '}
                                          <span className="font-medium">{(value as number).toFixed(2)} kg CO₂</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Survey Analytics Component
function SurveyAnalytics({ survey, onBack }: { survey: Survey; onBack: () => void }) {
  const { data: analytics, isLoading } = useSurveyAnalytics(survey.id);
  const { data: questions } = useSurveyQuestions(survey.id);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Back to Surveys
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{survey.title} - Analytics</CardTitle>
            <CardDescription>Survey statistics and carbon impact</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading analytics...</p>
            ) : !analytics ? (
              <Alert>
                <AlertDescription>No analytics data available.</AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics.totalResponses}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Carbon Emissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics.totalCarbon.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">kg CO₂</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average per Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics.avgCarbon.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">kg CO₂</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Questions</CardTitle>
            <CardDescription>Questions in this survey</CardDescription>
          </CardHeader>
          <CardContent>
            {!questions || questions.length === 0 ? (
              <p className="text-muted-foreground">No questions found.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((q: SurveyQuestion, index: number) => (
                  <Card key={q.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">Q{index + 1}.</span>
                          <div className="flex-1">
                            <p className="font-medium">{q.question_text}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="outline">{q.question_type}</Badge>
                              {q.is_required && <Badge>Required</Badge>}
                              {q.emission_category && (
                                <Badge variant="secondary">{q.emission_category}</Badge>
                              )}
                              {q.conversion_factor && (
                                <Badge variant="outline">Factor: {q.conversion_factor}</Badge>
                              )}
                            </div>
                            {q.options && q.options.length > 0 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Options: {q.options.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}