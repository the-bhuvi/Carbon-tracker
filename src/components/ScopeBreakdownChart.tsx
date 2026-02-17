import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CampusCarbonSummary } from '@/types/database';

interface ScopeBreakdownChartProps {
  summary: CampusCarbonSummary;
}

export function ScopeBreakdownChart({ summary }: ScopeBreakdownChartProps) {
  const data = [
    {
      name: 'Scope 1',
      emissions: Number(summary.total_scope1),
      description: 'Direct emissions (diesel, LPG, PNG)',
    },
    {
      name: 'Scope 2',
      emissions: Number(summary.total_scope2),
      description: 'Indirect emissions (electricity)',
    },
    {
      name: 'Scope 3',
      emissions: Number(summary.total_scope3),
      description: 'Other indirect (travel, water, waste)',
    },
  ];

  const total = summary.total_emissions;
  const percentages = data.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.emissions / total) * 100).toFixed(1) : '0.0',
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emission Breakdown by Scope</CardTitle>
        <CardDescription>
          Distribution of emissions across Scope 1, 2, and 3 categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={percentages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ value: 'Emissions (kg CO₂)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.description}</p>
                      <p className="mt-1 font-medium">
                        {Number(data.emissions).toLocaleString()} kg CO₂
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {data.percentage}% of total
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar 
              dataKey="emissions" 
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
          {percentages.map((item) => (
            <div key={item.name} className="text-center">
              <div className="text-sm font-medium text-muted-foreground">{item.name}</div>
              <div className="mt-1 text-lg font-bold">{item.percentage}%</div>
              <div className="text-xs text-muted-foreground">
                {Number(item.emissions).toLocaleString()} kg
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
