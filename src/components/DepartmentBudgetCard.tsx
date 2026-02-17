import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useDepartmentBudget } from '@/hooks/useDepartmentBudget';

interface DepartmentBudgetCardProps {
  departmentId: string;
  year: number;
}

export function DepartmentBudgetCard({ departmentId, year }: DepartmentBudgetCardProps) {
  const { data: budget, isLoading, error } = useDepartmentBudget(departmentId, year);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !budget) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load budget data</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    Green: 'bg-green-500',
    Yellow: 'bg-yellow-500',
    Exceeded: 'bg-red-500',
    'Not Set': 'bg-gray-400',
  };

  const statusVariants = {
    Green: 'default' as const,
    Yellow: 'secondary' as const,
    Exceeded: 'destructive' as const,
    'Not Set': 'outline' as const,
  };

  const isOverBudget = budget.status === 'Exceeded';
  const isNearLimit = budget.status === 'Yellow';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Carbon Budget</CardTitle>
            <CardDescription>{budget.department_name}</CardDescription>
          </div>
          <Badge variant={statusVariants[budget.status]}>{budget.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget Utilization</span>
            <span className="font-medium">
              {budget.budget_utilized_percent.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={Math.min(budget.budget_utilized_percent, 100)}
            className="h-3"
          />
          {isOverBudget && (
            <div className="text-xs text-destructive">
              Over budget by {(budget.budget_utilized_percent - 100).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Allowed Budget</div>
            <div className="text-lg font-bold">
              {budget.allowed_budget.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Current Emissions</div>
            <div
              className={`text-lg font-bold ${
                isOverBudget ? 'text-destructive' : 'text-primary'
              }`}
            >
              {budget.current_emissions.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Remaining Budget</div>
            <div className="flex items-center gap-2">
              <div
                className={`text-lg font-bold ${
                  budget.remaining_budget < 0 ? 'text-destructive' : 'text-green-600'
                }`}
              >
                {Math.abs(budget.remaining_budget).toLocaleString()}
              </div>
              {budget.remaining_budget < 0 ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {budget.remaining_budget < 0 ? 'over' : 'remaining'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Per Capita</div>
            <div className="text-lg font-bold">
              {budget.per_capita_emissions.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">kg CO₂/student</div>
          </div>
        </div>

        {/* Department Info */}
        <div className="rounded-lg bg-muted p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Student Count:</span>
            <span className="font-medium">{budget.student_count.toLocaleString()}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-muted-foreground">Budget Formula:</span>
            <span className="font-medium">300 kg CO₂ per student/year</span>
          </div>
        </div>

        {/* Alert Messages */}
        {isOverBudget && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This department has exceeded its carbon budget. Immediate action required to
              reduce emissions.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Approaching carbon budget limit. Consider implementing reduction strategies.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
