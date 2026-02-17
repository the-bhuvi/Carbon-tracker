import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CampusCarbonSummary } from '@/types/database';

interface NeutralityProgressProps {
  summary: CampusCarbonSummary;
}

export function NeutralityProgress({ summary }: NeutralityProgressProps) {
  const neutralityPercent = Math.min(summary.carbon_neutrality_percentage, 100);
  const isNeutral = neutralityPercent >= 100;

  const pieData = [
    {
      name: 'Offset',
      value: Number(summary.tree_absorption_kg),
      color: 'hsl(142, 76%, 36%)', // green
    },
    {
      name: 'Remaining',
      value: Math.max(0, Number(summary.net_carbon_kg)),
      color: 'hsl(24, 95%, 53%)', // orange
    },
  ];

  const getStatusColor = () => {
    if (neutralityPercent >= 100) return 'text-green-600';
    if (neutralityPercent >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getStatusBadge = () => {
    if (neutralityPercent >= 100) return { variant: 'default' as const, text: 'Carbon Neutral' };
    if (neutralityPercent >= 70) return { variant: 'secondary' as const, text: 'On Track' };
    return { variant: 'destructive' as const, text: 'Needs Improvement' };
  };

  const status = getStatusBadge();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Carbon Neutrality Progress</CardTitle>
            <CardDescription>
              Goal: Offset all emissions with tree absorption
            </CardDescription>
          </div>
          <Badge variant={status.variant}>{status.text}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Circular Progress */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <p className="font-semibold">{data.name}</p>
                          <p className="font-medium">
                            {Number(data.value).toLocaleString()} kg CO₂
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Percentage Display */}
          <div className="text-center">
            <div className={`text-5xl font-bold ${getStatusColor()}`}>
              {neutralityPercent.toFixed(1)}%
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Carbon Neutrality Achieved</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={neutralityPercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Total Emissions</div>
              <div className="mt-1 text-xl font-bold">
                {summary.total_emissions.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">kg CO₂</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Tree Absorption</div>
              <div className="mt-1 text-xl font-bold text-green-600">
                {summary.tree_absorption_kg.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">kg CO₂</div>
            </div>
          </div>

          {/* Action Item */}
          {!isNeutral && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">To achieve carbon neutrality:</p>
              <p className="mt-1 text-lg font-bold text-primary">
                Plant {summary.trees_needed_for_offset.toLocaleString()} more trees
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or reduce emissions by {Math.abs(summary.net_carbon_kg).toLocaleString()} kg CO₂
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
