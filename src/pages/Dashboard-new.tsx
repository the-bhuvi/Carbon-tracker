import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, AlertTriangle, Leaf, Lightbulb, Droplet, Trash2, Car, Building } from "lucide-react";
import { useDepartmentSummary, useMonthlyTrends } from "@/hooks/useSupabase";

const Dashboard = () => {
  const { data: departmentSummary, isLoading: loadingSummary } = useDepartmentSummary();
  const { data: monthlyTrends, isLoading: loadingTrends } = useMonthlyTrends();

  if (loadingSummary || loadingTrends) {
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

  if (!departmentSummary || departmentSummary.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            No data available. Please submit carbon emission data first using the Admin Input or Student Survey pages.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate total emissions across all departments
  const totalEmissions = departmentSummary.reduce((sum, dept) => sum + (dept.total_carbon_kg || 0), 0);
  const totalSubmissions = departmentSummary.reduce((sum, dept) => sum + (dept.submission_count || 0), 0);

  // Prepare data for charts
  const departmentData = departmentSummary.map(dept => ({
    name: dept.department_name,
    emissions: (dept.total_carbon_kg / 1000).toFixed(2),
    submissions: dept.submission_count,
    fill: getRandomColor()
  }));

  const pieData = departmentSummary.map((dept, index) => ({
    name: dept.department_name,
    value: dept.total_carbon_kg,
    color: getColorByIndex(index)
  }));

  // Find department with highest emissions
  const highestDept = departmentSummary.reduce((prev, current) => 
    (current.total_carbon_kg > prev.total_carbon_kg) ? current : prev
  );

  // Prepare monthly trends data
  const trendsData = monthlyTrends?.map(trend => ({
    month: new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    emissions: (trend.total_carbon_kg / 1000).toFixed(2),
    submissions: trend.submission_count
  })) || [];

  function getColorByIndex(index: number) {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    return colors[index % colors.length];
  }

  function getRandomColor() {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Carbon Footprint Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Campus emissions overview and insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
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
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Departments Reporting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {departmentSummary.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">active departments</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {totalSubmissions}
            </p>
            <p className="text-sm text-muted-foreground mt-1">data entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Pie Chart - Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Emissions by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(2)} tons CO₂e`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Department Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Department Comparison</CardTitle>
            <CardDescription>Emissions by department (tons CO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="emissions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      {trendsData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Emissions Over Time</CardTitle>
            <CardDescription>Monthly carbon emission trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="emissions" stroke="#22c55e" strokeWidth={2} name="Emissions (tons)" />
                <Line type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={2} name="Submissions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Highest Emitter Alert */}
      <Card className="mb-6 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Highest Emitting Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Building className="h-5 w-5" />
              <span>{highestDept.department_name}</span>
            </div>
            <Badge variant="destructive" className="text-sm">
              {(highestDept.total_carbon_kg / 1000).toFixed(2)} tons CO₂e
            </Badge>
            <Badge variant="outline" className="text-sm">
              {highestDept.submission_count} submissions
            </Badge>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This department contributes the most to campus carbon footprint. Focus reduction efforts here for maximum impact.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Department Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
          <CardDescription>Breakdown by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold text-right">Emissions (tons)</th>
                  <th className="pb-3 font-semibold text-right">Submissions</th>
                  <th className="pb-3 font-semibold text-right">Avg per Submission</th>
                  <th className="pb-3 font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {departmentSummary.map((dept, index) => (
                  <tr key={dept.department_id} className="border-b last:border-0">
                    <td className="py-3">{dept.department_name}</td>
                    <td className="py-3 text-right font-medium">{(dept.total_carbon_kg / 1000).toFixed(2)}</td>
                    <td className="py-3 text-right">{dept.submission_count}</td>
                    <td className="py-3 text-right">{(dept.avg_carbon_kg / 1000).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <Badge variant={dept.carbon_score === 'Green' ? 'default' : dept.carbon_score === 'Moderate' ? 'secondary' : 'destructive'}>
                        {dept.carbon_score}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Trees Needed to Offset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {Math.ceil(totalEmissions / 21)} 🌳
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on 21kg CO₂/tree/year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg per Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {(totalEmissions / 1000 / departmentSummary.length).toFixed(2)} t
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              tons CO₂e per department
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg per Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {(totalEmissions / totalSubmissions).toFixed(2)} kg
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              CO₂e per entry
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
