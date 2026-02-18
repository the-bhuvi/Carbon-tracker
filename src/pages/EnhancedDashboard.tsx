import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, AlertTriangle, Leaf, Calendar, Target, Zap } from "lucide-react";
import { 
  useMonthlyEmissionByYear, 
  useAcademicYearEmissionSummary, 
  useFactorBreakdown, 
  useMonthlyNeutrality, 
  useAcademicYearNeutrality,
  useTopContributor,
  useEmissionIntensity,
  useScopeBreakdown,
  useNetZeroProjection,
  useSimulateReduction
} from "@/hooks/useSupabase";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { ReductionSimulator } from "@/components/ReductionSimulator";

type ViewMode = 'monthly' | 'academic_year';

const EnhancedDashboard = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentAcademicYear = currentMonth >= 7 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(currentAcademicYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Monthly view data
  const { data: monthlyData = [] } = useMonthlyEmissionByYear(selectedYear);
  const { data: monthlyFactorBreakdown = [] } = useFactorBreakdown(selectedYear, selectedMonth);
  const { data: monthlyNeutrality = 0 } = useMonthlyNeutrality(selectedYear, selectedMonth);

  // Academic year view data
  const { data: academicYearSummary } = useAcademicYearEmissionSummary(selectedAcademicYear);
  const { data: academicFactorBreakdown = [] } = useFactorBreakdown(selectedYear);
  const { data: academicYearNeutrality = 0 } = useAcademicYearNeutrality(selectedAcademicYear);

  // NEW: Analytical features
  const { data: topContributor } = useTopContributor(selectedYear, selectedMonth);
  const { data: intensityMetrics } = useEmissionIntensity(viewMode === 'monthly' ? selectedYear : undefined, viewMode === 'monthly' ? selectedMonth : undefined);
  const { data: scopeBreakdown = [] } = useScopeBreakdown(selectedYear, viewMode === 'monthly' ? selectedMonth : undefined);
  const { data: netZeroProjection } = useNetZeroProjection(selectedYear, 5);
  const { mutateAsync: simulateReduction, isPending: isSimulating, data: simulationResult } = useSimulateReduction();

  const isLoading = viewMode === 'monthly' ? !monthlyData : !academicYearSummary;

  // Get current month summary
  const currentMonthSummary = monthlyData?.find(m => m.month === selectedMonth);

  // Process chart data
  const factorData = useMemo(() => {
    const factors = viewMode === 'monthly' ? monthlyFactorBreakdown : academicFactorBreakdown;
    return (factors || []).map((f) => ({
      name: f.factor_name,
      value: parseFloat(f.total_co2e_kg.toString()),
      percentage: parseFloat(f.percentage.toString())
    })).sort((a, b) => b.value - a.value);
  }, [monthlyFactorBreakdown, academicFactorBreakdown, viewMode]);

  const monthlyTrendData = useMemo(() => {
    return (monthlyData || []).map(m => ({
      month: new Date(selectedYear, m.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      emissions: parseFloat(m.total_emission_kg.toString()) / 1000,
      perCapita: parseFloat(m.per_capita_kg.toString())
    }));
  }, [monthlyData, selectedYear]);

  const scopeData = useMemo(() => {
    return (scopeBreakdown || []).map(s => ({
      name: s.scope,
      value: parseFloat(s.total_co2e_kg.toString()),
      percentage: parseFloat(s.percentage_contribution.toString())
    }));
  }, [scopeBreakdown]);

  const totalEmissions = useMemo(() => {
    if (viewMode === 'monthly') {
      return monthlyData?.reduce((sum, m) => sum + parseFloat(m.total_emission_kg.toString()), 0) || 0;
    }
    return academicYearSummary ? parseFloat(academicYearSummary.total_emission_kg.toString()) : 0;
  }, [monthlyData, academicYearSummary, viewMode]);

  const perCapita = useMemo(() => {
    if (viewMode === 'monthly') {
      return currentMonthSummary ? parseFloat(currentMonthSummary.per_capita_kg.toString()) : 0;
    }
    return academicYearSummary ? parseFloat(academicYearSummary.per_capita_kg.toString()) : 0;
  }, [currentMonthSummary, academicYearSummary, viewMode]);

  const neutrality = viewMode === 'monthly' ? monthlyNeutrality : academicYearNeutrality;
  const highestFactor = factorData[0];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Leaf className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (totalEmissions === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            No emission data available. Please enter monthly audit data using the Admin Input page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const scopeColors = ['#ef4444', '#f59e0b', '#22c55e'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Carbon Footprint Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Institutional-level emissions overview with advanced analytics
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={viewMode === 'monthly' ? 'default' : 'outline'}
          onClick={() => setViewMode('monthly')}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Monthly View
        </Button>
        <Button
          variant={viewMode === 'academic_year' ? 'default' : 'outline'}
          onClick={() => setViewMode('academic_year')}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Academic Year View
        </Button>
      </div>

      {/* Period Selection */}
      <div className="mb-6 flex gap-4">
        {viewMode === 'monthly' && (
          <>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(selectedYear, m - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </>
        )}
        {viewMode === 'academic_year' && (
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={`${y}-${y + 1}`}>{y}-{y + 1}</option>
            ))}
          </select>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalEmissions / 1000).toFixed(2)}</div>
            <p className="text-xs text-gray-500">Tonnes CO₂e</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CO₂ per Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intensityMetrics?.co2_per_student_kg.toFixed(2) || 'N/A'}</div>
            <p className="text-xs text-gray-500">kg per student</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Contributor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topContributor?.percentage_contribution.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">{topContributor?.factor_name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Zero Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{netZeroProjection?.projected_net_zero_year || 'N/A'}</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Target className="h-3 w-3" />
              @ 5% annual reduction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Factor Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Factor Breakdown</CardTitle>
            <CardDescription>Top emission contributors by factor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={factorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {factorData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} kg`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scope Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Scope-wise Breakdown</CardTitle>
            <CardDescription>GHG Protocol scope distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scopeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scopeData.map((_, index) => (
                    <Cell key={`scope-${index}`} fill={scopeColors[index % scopeColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} kg`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      {viewMode === 'monthly' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Emissions throughout the year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" label={{ value: 'Emissions (Tonnes)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Per Capita (kg)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="emissions" stroke="#22c55e" name="Total Emissions (Tonnes)" />
                <Line yAxisId="right" type="monotone" dataKey="perCapita" stroke="#3b82f6" name="Per Capita (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Intensity Metrics Cards */}
      {intensityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scope 1 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(intensityMetrics.scope1_kg / 1000).toFixed(2)}</div>
              <p className="text-xs text-gray-500">Tonnes CO₂e (Direct)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scope 2 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(intensityMetrics.scope2_kg / 1000).toFixed(2)}</div>
              <p className="text-xs text-gray-500">Tonnes CO₂e (Indirect Energy)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scope 3 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(intensityMetrics.scope3_kg / 1000).toFixed(2)}</div>
              <p className="text-xs text-gray-500">Tonnes CO₂e (Other Indirect)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reduction Simulator */}
      <div className="mb-8">
        <ReductionSimulator
          factors={factorData}
          onSimulate={(reductions) => simulateReduction({
            year: selectedYear,
            month: selectedMonth,
            reductions
          })}
          isLoading={isSimulating}
          result={simulationResult}
        />
      </div>

      {/* Footer Stats */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tree Equivalents</p>
              <p className="text-lg font-semibold text-green-700">
                {Math.round((totalEmissions / 1000) * 20)} trees
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Carbon Neutrality</p>
              <p className="text-lg font-semibold text-blue-700">{neutrality.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average per Month</p>
              <p className="text-lg font-semibold text-amber-700">
                {(totalEmissions / (viewMode === 'monthly' ? 12 : 12) / 1000).toFixed(2)} Tonnes
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Quality</p>
              <Badge variant="secondary">Institutional Data</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;
