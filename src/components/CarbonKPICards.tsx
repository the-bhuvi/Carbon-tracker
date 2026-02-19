import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Leaf, TrendingDown, TrendingUp, Trees } from 'lucide-react';
import type { CampusCarbonSummary } from '@/types/database';
import { formatCO2 } from '@/lib/utils';

interface CarbonKPICardsProps {
  summary: CampusCarbonSummary;
}

export function CarbonKPICards({ summary }: CarbonKPICardsProps) {
  const isNeutral = summary.carbon_neutrality_percentage >= 100;

  const totalFmt = formatCO2(summary.total_emissions);
  const absorptionFmt = formatCO2(summary.tree_absorption_kg);
  const netFmt = formatCO2(Math.abs(summary.net_carbon_kg));
  const scope1Fmt = formatCO2(summary.total_scope1);
  const scope2Fmt = formatCO2(summary.total_scope2);
  const scope3Fmt = formatCO2(summary.total_scope3);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Emissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
          <TrendingUp className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalFmt.value}
          </div>
          <p className="text-xs text-muted-foreground">{totalFmt.unit} emitted in {summary.year}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Scope 1</span>
              <span className="font-medium">{scope1Fmt.value} {scope1Fmt.unit}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Scope 2</span>
              <span className="font-medium">{scope2Fmt.value} {scope2Fmt.unit}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Scope 3</span>
              <span className="font-medium">{scope3Fmt.value} {scope3Fmt.unit}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree Absorption */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tree Absorption</CardTitle>
          <Trees className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {absorptionFmt.value}
          </div>
          <p className="text-xs text-muted-foreground">
            {absorptionFmt.unit} absorbed by {summary.total_tree_count.toLocaleString()} trees
          </p>
          <div className="mt-2">
            <div className="text-xs text-muted-foreground">
              Each tree absorbs ~21 kg CO₂/year
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Carbon */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Carbon</CardTitle>
          {isNeutral ? (
            <TrendingDown className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingUp className="h-4 w-4 text-orange-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isNeutral ? 'text-green-600' : 'text-orange-600'
            }`}
          >
            {netFmt.value}
          </div>
          <p className="text-xs text-muted-foreground">
            {isNeutral ? `${netFmt.unit} surplus absorption` : `${netFmt.unit} net emissions`}
          </p>
          <div className="mt-2">
            <Badge variant={isNeutral ? 'default' : 'destructive'} className="text-xs">
              {isNeutral ? 'Carbon Positive' : 'Carbon Negative'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Trees Needed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isNeutral ? 'Neutrality Achieved' : 'Trees Needed'}
          </CardTitle>
          <Leaf className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isNeutral ? (
              <span className="text-green-600">✓</span>
            ) : (
              summary.trees_needed_for_offset.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isNeutral
              ? 'Campus is carbon neutral'
              : 'additional trees to offset emissions'}
          </p>
          {!isNeutral && (
            <div className="mt-2">
              <Progress
                value={summary.carbon_neutrality_percentage}
                className="h-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.carbon_neutrality_percentage.toFixed(1)}% neutralized
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
