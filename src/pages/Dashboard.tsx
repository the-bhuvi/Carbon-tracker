import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, AlertTriangle, Leaf, Calendar } from "lucide-react";
import { useMonthlyEmissionByYear, useAcademicYearEmissionSummary, useFactorBreakdown, useMonthlyNeutrality, useAcademicYearNeutrality, useAvailableAuditYears } from "@/hooks/useSupabase";

type ViewMode = 'monthly' | 'academic_year';

const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentAcademicYear = currentMonth >= 7 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(currentAcademicYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Auto-detect year with data
  const { data: availableYears = [] } = useAvailableAuditYears();
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears]);

  // Monthly view data
  const { data: monthlyData = [], isLoading: monthlyLoading, error: monthlyError } = useMonthlyEmissionByYear(selectedYear);
  const { data: monthlyFactorBreakdown = [] } = useFactorBreakdown(selectedYear, selectedMonth);
  const { data: monthlyNeutrality = 0 } = useMonthlyNeutrality(selectedYear, selectedMonth);

  // Auto-select first available month when year/data changes
  useEffect(() => {
    if (monthlyData.length > 0 && !monthlyData.find(m => m.month === selectedMonth)) {
      setSelectedMonth(monthlyData[0].month);
    }
  }, [monthlyData]);

  // Academic year view data
  const { data: academicYearSummary, isLoading: academicLoading, error: academicError } = useAcademicYearEmissionSummary(selectedAcademicYear);
  const { data: academicFactorBreakdown = [] } = useFactorBreakdown(selectedYear);
  const { data: academicYearNeutrality = 0 } = useAcademicYearNeutrality(selectedAcademicYear);

  const isLoading = viewMode === 'monthly' ? monthlyLoading : academicLoading;
  const hasNoAcademicData = viewMode === 'academic_year' && !academicLoading && !academicYearSummary;
  const queryError = viewMode === 'monthly' ? monthlyError : academicError;

  // Get current month summary
  const currentMonthSummary = monthlyData?.find(m => m.month === selectedMonth);

  // Process chart data
  const factorData = useMemo(() => {
    const factors = viewMode === 'monthly' ? monthlyFactorBreakdown : academicFactorBreakdown;
    return (factors || []).map((f, i) => ({
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

  if (queryError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading data: {(queryError as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (hasNoAcademicData || totalEmissions === 0) {
    const yearOptions = availableYears.length > 0 ? availableYears : [2024, 2025, 2026];
    const periodLabel = viewMode === 'academic_year' ? selectedAcademicYear : String(selectedYear);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Carbon Footprint Dashboard
          </h1>
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
        <div className="mb-4 flex gap-2 items-center">
          {viewMode === 'monthly' ? (
            <>
              <span className="text-sm text-gray-600">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">Academic Year:</span>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                {['2024-2025', '2025-2026'].map(ay => (
                  <option key={ay} value={ay}>{ay}</option>
                ))}
              </select>
            </>
          )}
        </div>
        <Alert>
          <AlertDescription>
            No emission data found for <strong>{periodLabel}</strong>.{' '}
            {viewMode === 'academic_year'
              ? 'This academic year may not have started yet or has no data. Please select a different academic year.'
              : availableYears.length > 0
                ? `Data is available for: ${availableYears.join(', ')}. Please select one of those years.`
                : 'Please enter monthly audit data using the Admin Input page.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Carbon Footprint Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Institutional-level emissions overview and insights
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
      <div className="mb-6 flex gap-4 flex-wrap">
        {viewMode === 'monthly' && (
          <>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {(availableYears.length > 0 ? availableYears : [currentYear - 1, currentYear, currentYear + 1]).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {monthlyData.length > 0
                ? monthlyData.map(m => (
                    <option key={m.month} value={m.month}>
                      {new Date(selectedYear, m.month - 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))
                : Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {new Date(selectedYear, m - 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))
              }
            </select>
          </>
        )}
        {viewMode === 'academic_year' && (
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {['2024-2025', '2025-2026'].map(ay => (
              <option key={ay} value={ay}>{ay}</option>
            ))}
          </select>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Total Emissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {(totalEmissions / 1000).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">tons CO₂e</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Per Capita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {perCapita.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">kg CO₂e/student</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Top Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {highestFactor?.percentage.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">{highestFactor?.name || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Neutrality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {(neutrality as number).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">offset + reduction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Factor Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Factor-wise Breakdown</CardTitle>
            <CardDescription>Emissions by factor (descending)</CardDescription>
          </CardHeader>
          <CardContent>
            {factorData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No factor data for selected period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={factorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${(percentage).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {factorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(2)} tons CO₂e`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Factor Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Factor Comparison</CardTitle>
            <CardDescription>Emissions by factor (tons CO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            {factorData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No factor data for selected period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={factorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(2)} tons`} />
                  <Bar dataKey="value" name="Emissions (kg)" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {viewMode === 'monthly' && monthlyTrendData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly Emissions Trend</CardTitle>
            <CardDescription>Monthly emissions and per-capita values for {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="emissions" stroke="#22c55e" strokeWidth={2} name="Emissions (tons)" />
                <Line type="monotone" dataKey="perCapita" stroke="#3b82f6" strokeWidth={2} name="Per Capita (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Highest Factor Alert */}
      {highestFactor && (
        <Card className="mb-6 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Highest Contributing Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span>{highestFactor.name}</span>
              </div>
              <Badge variant="destructive" className="text-sm">
                {(highestFactor.value / 1000).toFixed(2)} tons CO₂e
              </Badge>
              <Badge variant="outline" className="text-sm">
                {highestFactor.percentage.toFixed(1)}% of total
              </Badge>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Focus reduction efforts on this emission factor for maximum impact on carbon neutrality.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Factor Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Factor Details</CardTitle>
          <CardDescription>Complete breakdown of all emission factors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">Factor Name</th>
                  <th className="pb-3 font-semibold text-right">Emissions (tons)</th>
                  <th className="pb-3 font-semibold text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {factorData.map((factor, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3">{factor.name}</td>
                    <td className="py-3 text-right font-medium">{(factor.value / 1000).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <Badge variant="secondary">
                        {factor.percentage.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
