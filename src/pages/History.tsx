import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, History as HistoryIcon, AlertCircle, Leaf } from "lucide-react";
import { useCarbonSubmissions, useCurrentUser } from "@/hooks/useSupabase";

const History = () => {
  const { data: user } = useCurrentUser();
  const { data: submissions, isLoading } = useCarbonSubmissions(user?.id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Leaf className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading your submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Submission History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your carbon emission submissions
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No submissions yet. Start tracking your carbon footprint by submitting data in the Admin Input or Student Survey pages.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getScoreBadgeVariant = (score: string) => {
    switch (score) {
      case 'Green': return 'default';
      case 'Moderate': return 'secondary';
      case 'High': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Submission History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your carbon emission submissions
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {submissions.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Carbon Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {(submissions.reduce((sum, s) => sum + (s.total_carbon || 0), 0) / 1000).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">tons CO₂e</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average per Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {(submissions.reduce((sum, s) => sum + (s.total_carbon || 0), 0) / submissions.length).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">kg CO₂e</p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-blue-600" />
            All Submissions
          </CardTitle>
          <CardDescription>
            Detailed history of your carbon footprint submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Electricity (kWh)</TableHead>
                  <TableHead className="text-right">Fuel (L)</TableHead>
                  <TableHead className="text-right">Travel (km)</TableHead>
                  <TableHead className="text-right">Total CO₂e (kg)</TableHead>
                  <TableHead className="text-right">Trees</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(submission.submission_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {submission.department?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">{submission.electricity_kwh || 0}</TableCell>
                    <TableCell className="text-right">
                      {((submission.diesel_liters || 0) + (submission.petrol_liters || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{submission.travel_km || 0}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {submission.total_carbon_kg?.toFixed(2) || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {submission.trees_to_offset || 0} 🌳
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getScoreBadgeVariant(submission.carbon_score || '')}>
                        {submission.carbon_score || 'N/A'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cards View for Mobile */}
      <div className="mt-6 space-y-4 md:hidden">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(submission.submission_date).toLocaleDateString()}
                </CardTitle>
                <Badge variant={getScoreBadgeVariant(submission.carbon_score || '')}>
                  {submission.carbon_score}
                </Badge>
              </div>
              <CardDescription>{submission.department?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Carbon:</span>
                <span className="font-semibold">{submission.total_carbon?.toFixed(2)} kg CO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Electricity:</span>
                <span>{submission.electricity_kwh} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fuel:</span>
                <span>{((submission.diesel_liters || 0) + (submission.petrol_liters || 0)).toFixed(2)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Travel:</span>
                <span>{submission.travel_km} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trees to Offset:</span>
                <span>{submission.tree_equivalent} 🌳</span>
              </div>
              {submission.suggestions && submission.suggestions.length > 0 && (
                <Alert className="mt-2">
                  <AlertDescription className="text-xs">
                    {submission.suggestions.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default History;

