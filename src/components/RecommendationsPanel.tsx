import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Lightbulb,
  TrendingDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import type { Recommendation } from '@/types/database';

interface RecommendationsPanelProps {
  year: number;
}

const priorityColors = {
  High: 'destructive' as const,
  Medium: 'secondary' as const,
  Low: 'outline' as const,
  Info: 'default' as const,
};

const priorityIcons = {
  High: AlertCircle,
  Medium: Lightbulb,
  Low: TrendingDown,
  Info: CheckCircle2,
};

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const Icon = priorityIcons[recommendation.priority];

  return (
    <Alert className="relative">
      <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold">{recommendation.category}</h4>
              <Badge variant={priorityColors[recommendation.priority]} className="mt-1">
                {recommendation.priority} Priority
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              {recommendation.scope}
            </Badge>
          </div>
          <AlertDescription className="text-sm">
            {recommendation.action}
          </AlertDescription>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-green-600">
              💡 {recommendation.impact_estimate}
            </span>
            {recommendation.percentage_of_total > 0 && (
              <span className="text-muted-foreground">
                ({recommendation.percentage_of_total.toFixed(1)}% of total)
              </span>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

export function RecommendationsPanel({ year }: RecommendationsPanelProps) {
  const { data: recommendations, isLoading, error } = useRecommendations(year);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load recommendations. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>
            AI-powered suggestions to reduce carbon emissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              No recommendations at this time. Your campus is performing well!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Group recommendations by priority
  const highPriority = recommendations.filter((r) => r.priority === 'High');
  const mediumPriority = recommendations.filter((r) => r.priority === 'Medium');
  const lowPriority = recommendations.filter((r) => r.priority === 'Low');
  const info = recommendations.filter((r) => r.priority === 'Info');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Smart Recommendations</CardTitle>
            <CardDescription>
              Actionable strategies to reduce your carbon footprint
            </CardDescription>
          </div>
          <Badge variant="outline">
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* High Priority */}
        {highPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-destructive">
              High Priority Actions
            </h3>
            {highPriority.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-orange-600">
              Medium Priority Actions
            </h3>
            {mediumPriority.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        )}

        {/* Low Priority */}
        {lowPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Low Priority Actions
            </h3>
            {lowPriority.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        )}

        {/* Info */}
        {info.length > 0 && (
          <div className="space-y-3">
            {info.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
