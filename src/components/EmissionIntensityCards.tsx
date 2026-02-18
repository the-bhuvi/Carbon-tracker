import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap, Leaf } from "lucide-react";

interface EmissionIntensityCardsProps {
  scope1Kg: number;
  scope2Kg: number;
  scope3Kg: number;
  coPerStudentKg?: number;
  totalStudents?: number;
}

export const EmissionIntensityCards = ({
  scope1Kg,
  scope2Kg,
  scope3Kg,
  coPerStudentKg,
  totalStudents
}: EmissionIntensityCardsProps) => {
  const totalKg = scope1Kg + scope2Kg + scope3Kg;
  const scope1Pct = totalKg > 0 ? ((scope1Kg / totalKg) * 100) : 0;
  const scope2Pct = totalKg > 0 ? ((scope2Kg / totalKg) * 100) : 0;
  const scope3Pct = totalKg > 0 ? ((scope3Kg / totalKg) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Scope 1 - Direct</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{(scope1Kg / 1000).toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Tonnes CO₂e ({scope1Pct.toFixed(1)}%)</div>
          <p className="text-xs text-gray-400 mt-2">Direct emissions from campus sources</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Scope 2 - Indirect Energy</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{(scope2Kg / 1000).toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Tonnes CO₂e ({scope2Pct.toFixed(1)}%)</div>
          <p className="text-xs text-gray-400 mt-2">Purchased electricity emissions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Scope 3 - Other Indirect</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{(scope3Kg / 1000).toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Tonnes CO₂e ({scope3Pct.toFixed(1)}%)</div>
          <p className="text-xs text-gray-400 mt-2">Travel, waste, and other sources</p>
        </CardContent>
      </Card>

      {coPerStudentKg !== undefined && (
        <Card className="md:col-span-3 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Emission Intensity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{coPerStudentKg.toFixed(2)}</div>
                <p className="text-sm text-gray-600 mt-1">kg CO₂e per student</p>
              </div>
              {totalStudents && (
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
                  <p className="text-sm text-gray-600 mt-1">students enrolled</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
