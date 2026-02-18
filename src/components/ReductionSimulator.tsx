import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface ReductionSimulatorProps {
  factors: { name: string; value: number }[];
  onSimulate: (reductions: Record<string, number>) => Promise<void>;
  isLoading: boolean;
  result?: {
    baseline_total_kg: number;
    simulated_total_kg: number;
    total_reduction_kg: number;
    reduction_percentage: number;
  } | null;
}

export const ReductionSimulator = ({ factors, onSimulate, isLoading, result }: ReductionSimulatorProps) => {
  const [reductions, setReductions] = useState<Record<string, number>>({});

  const handleFactorChange = (factorName: string, percentage: number) => {
    setReductions(prev => ({
      ...prev,
      [factorName]: Math.max(0, Math.min(100, percentage))
    }));
  };

  const handleSimulate = async () => {
    if (Object.values(reductions).every(r => r === 0 || r === undefined)) {
      return;
    }
    await onSimulate(reductions);
  };

  const hasReductions = Object.values(reductions).some(r => r > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-600" />
          Reduction Simulator
        </CardTitle>
        <CardDescription>
          Model emission reductions by adjusting factor percentages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Factor Reduction Inputs */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Reduction Percentages (%)</Label>
          {factors.map(factor => (
            <div key={factor.name} className="flex items-center gap-4">
              <div className="flex-1 min-w-[150px]">
                <Label className="text-sm text-gray-600">{factor.name}</Label>
                <p className="text-xs text-gray-500">{factor.value.toFixed(2)} kg CO₂e</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0"
                  value={reductions[factor.name] || 0}
                  onChange={e => handleFactorChange(factor.name, parseFloat(e.target.value) || 0)}
                  className="w-20"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Simulate Button */}
        <Button
          onClick={handleSimulate}
          disabled={isLoading || !hasReductions}
          className="w-full"
        >
          {isLoading ? 'Simulating...' : 'Simulate Reduction'}
        </Button>

        {/* Results */}
        {result && (
          <Alert className="border-green-200 bg-green-50">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-green-900">
                  Total Reduction: {result.total_reduction_kg.toFixed(2)} kg CO₂ ({result.reduction_percentage.toFixed(1)}%)
                </p>
                <p className="text-sm text-green-800">
                  Baseline: {result.baseline_total_kg.toFixed(2)} kg
                </p>
                <p className="text-sm text-green-800">
                  Projected: {result.simulated_total_kg.toFixed(2)} kg
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {hasReductions && !result && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Click "Simulate Reduction" to calculate the impact
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
