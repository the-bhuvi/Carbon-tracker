import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Zap, Car, Fuel, Trees } from 'lucide-react';
import { useSimulateCarbon } from '@/hooks/useSimulateCarbon';

interface CarbonSimulatorProps {
  year: number;
  defaultTreeCount?: number;
}

export function CarbonSimulator({ year, defaultTreeCount = 1000 }: CarbonSimulatorProps) {
  const [electricityReduction, setElectricityReduction] = useState(0);
  const [travelReduction, setTravelReduction] = useState(0);
  const [dieselReduction, setDieselReduction] = useState(0);
  const [treeCount, setTreeCount] = useState(defaultTreeCount);

  const { data: simulation, isLoading } = useSimulateCarbon({
    year,
    treeCount,
    electricityReduction,
    travelReduction,
    dieselReduction,
  });

  const handleReset = () => {
    setElectricityReduction(0);
    setTravelReduction(0);
    setDieselReduction(0);
    setTreeCount(defaultTreeCount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!simulation) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No data available for {year}
        </CardContent>
      </Card>
    );
  }

  const reductionAchieved = Number(simulation.total_reduction_kg);
  const isImprovement = reductionAchieved > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carbon Reduction Simulator</CardTitle>
        <CardDescription>
          Adjust reduction strategies to see projected impact on emissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Electricity Reduction */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Electricity Reduction
              </Label>
              <Badge variant="outline">{electricityReduction}%</Badge>
            </div>
            <Slider
              value={[electricityReduction]}
              onValueChange={([value]) => setElectricityReduction(value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              e.g., Solar panels, LED lights, energy-efficient appliances
            </p>
          </div>

          {/* Travel Reduction */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Car className="h-4 w-4 text-blue-500" />
                Travel/Transport Shift
              </Label>
              <Badge variant="outline">{travelReduction}%</Badge>
            </div>
            <Slider
              value={[travelReduction]}
              onValueChange={([value]) => setTravelReduction(value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              e.g., Electric shuttles, carpooling, remote work
            </p>
          </div>

          {/* Diesel Reduction */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-red-500" />
                Diesel/Generator Reduction
              </Label>
              <Badge variant="outline">{dieselReduction}%</Badge>
            </div>
            <Slider
              value={[dieselReduction]}
              onValueChange={([value]) => setDieselReduction(value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              e.g., Battery storage, cleaner alternatives
            </p>
          </div>

          {/* Tree Count */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Trees className="h-4 w-4 text-green-600" />
              Tree Count
            </Label>
            <Input
              type="number"
              value={treeCount}
              onChange={(e) => setTreeCount(Number(e.target.value))}
              min={0}
              step={100}
            />
            <p className="text-xs text-muted-foreground">
              Number of trees on campus (each absorbs ~21 kg CO₂/year)
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
          <h4 className="font-semibold">Projected Results</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Current Emissions</div>
              <div className="text-xl font-bold">
                {Number(simulation.baseline_total).toLocaleString()} kg
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Projected Emissions</div>
              <div className="text-xl font-bold text-primary">
                {Number(simulation.projected_total).toLocaleString()} kg
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Reduction Achieved</div>
              <div className={`text-xl font-bold ${isImprovement ? 'text-green-600' : ''}`}>
                {reductionAchieved.toLocaleString()} kg
              </div>
              <div className="text-xs text-muted-foreground">
                ({Number(simulation.reduction_percentage).toFixed(1)}% reduction)
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Net Carbon</div>
              <div
                className={`text-xl font-bold ${
                  Number(simulation.projected_net_carbon) <= 0
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}
              >
                {Math.abs(Number(simulation.projected_net_carbon)).toLocaleString()} kg
              </div>
              <div className="text-xs text-muted-foreground">
                after tree absorption
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Carbon Neutrality:</span>
              <Badge
                variant={
                  Number(simulation.projected_neutrality_percent) >= 100
                    ? 'default'
                    : 'secondary'
                }
              >
                {Number(simulation.projected_neutrality_percent).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button variant="outline" onClick={handleReset} className="w-full">
          Reset to Current Values
        </Button>
      </CardContent>
    </Card>
  );
}
