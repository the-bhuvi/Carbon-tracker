import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingDown, TrendingUp, History as HistoryIcon, AlertCircle } from "lucide-react";

interface YearData {
  academicYear: string;
  timestamp: string;
  emissions: {
    electricity: number;
    water: number;
    waste: number;
    fuel: number;
    food: number;
    infrastructure: number;
    total: number;
  };
}

const History = () => {
  const [yearlyData, setYearlyData] = useState<YearData[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Load historical data from localStorage
    const storedData = localStorage.getItem("campusFootprintData");
    if (storedData) {
      const data = JSON.parse(storedData);
      setYearlyData(data.sort((a: YearData, b: YearData) => 
        a.academicYear.localeCompare(b.academicYear)
      ));
      setHasData(data.length > 0);
    } else {
      // Sample historical data for demonstration
      const sampleData: YearData[] = [
        {
          academicYear: "2023-2024",
          timestamp: "2024-03-15T10:00:00Z",
          emissions: {
            electricity: 45000,
            water: 32.5,
            waste: 2800,
            fuel: 6000,
            food: 5000,
            infrastructure: 60000,
            total: 118832.5
          }
        },
        {
          academicYear: "2024-2025",
          timestamp: "2025-03-15T10:00:00Z",
          emissions: {
            electricity: 43000,
            water: 30.2,
            waste: 2600,
            fuel: 5500,
            food: 4700,
            infrastructure: 57000,
            total: 112830.2
          }
        },
        {
          academicYear: "2025-2026",
          timestamp: "2026-02-10T10:00:00Z",
          emissions: {
            electricity: 41000,
            water: 29.8,
            waste: 2500,
            fuel: 5360,
            food: 4500,
            infrastructure: 55000,
            total: 108389.8
          }
        }
      ];
      setYearlyData(sampleData);
      setHasData(true);
    }
  }, []);

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const chartData = yearlyData.map(data => ({
    year: data.academicYear,
    total: (data.emissions.total / 1000).toFixed(2),
    electricity: (data.emissions.electricity / 1000).toFixed(2),
    fuel: (data.emissions.fuel / 1000).toFixed(2),
    food: (data.emissions.food / 1000).toFixed(2)
  }));

  if (!hasData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Historical Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Year-over-year carbon footprint comparison
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No historical data available yet. Data will appear here after you submit carbon footprint calculations.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Historical Data
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Year-over-year carbon footprint comparison
        </p>
      </div>

      {/* Trend Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-blue-600" />
            Emissions Trend Over Years
          </CardTitle>
          <CardDescription>
            Total carbon footprint by academic year (tons CO₂e)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Total Emissions" />
              <Line type="monotone" dataKey="electricity" stroke="#facc15" strokeWidth={2} name="Electricity" />
              <Line type="monotone" dataKey="fuel" stroke="#ef4444" strokeWidth={2} name="Fuel" />
              <Line type="monotone" dataKey="food" stroke="#f97316" strokeWidth={2} name="Food" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Year-wise Comparison Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Academic Year Breakdown</h2>
        
        {yearlyData.map((yearData, index) => {
          const previousYear = index > 0 ? yearlyData[index - 1] : null;
          const percentageChange = previousYear 
            ? calculatePercentageChange(yearData.emissions.total, previousYear.emissions.total)
            : 0;
          const isReduction = percentageChange < 0;

          return (
            <Card key={yearData.academicYear} className={isReduction && index > 0 ? "border-green-200 dark:border-green-800" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {yearData.academicYear}
                  </CardTitle>
                  {index > 0 && (
                    <Badge 
                      variant={isReduction ? "default" : "destructive"}
                      className={isReduction ? "bg-green-600" : ""}
                    >
                      {isReduction ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(percentageChange).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Recorded on {new Date(yearData.timestamp).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Total Emissions */}
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <span className="font-semibold">Total Emissions</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {(yearData.emissions.total / 1000).toFixed(2)} tons CO₂e
                    </span>
                  </div>

                  {/* Category Breakdown */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <span className="text-sm font-medium">Electricity</span>
                      <span className="font-semibold">{(yearData.emissions.electricity / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <span className="text-sm font-medium">Water</span>
                      <span className="font-semibold">{(yearData.emissions.water / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <span className="text-sm font-medium">Waste</span>
                      <span className="font-semibold">{(yearData.emissions.waste / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <span className="text-sm font-medium">Fuel</span>
                      <span className="font-semibold">{(yearData.emissions.fuel / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <span className="text-sm font-medium">Food</span>
                      <span className="font-semibold">{(yearData.emissions.food / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                      <span className="text-sm font-medium">Infrastructure</span>
                      <span className="font-semibold">{(yearData.emissions.infrastructure / 1000).toFixed(2)} t</span>
                    </div>
                  </div>

                  {/* Comparison with previous year */}
                  {previousYear && (
                    <Alert className={isReduction ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-orange-200 bg-orange-50 dark:bg-orange-950"}>
                      <AlertDescription className="flex items-center gap-2">
                        {isReduction ? (
                          <>
                            <TrendingDown className="h-4 w-4 text-green-600" />
                            <span>
                              <strong>Great progress!</strong> Reduced by <strong>{Math.abs(percentageChange).toFixed(1)}%</strong> compared to {previousYear.academicYear}
                              {" "}({Math.abs((yearData.emissions.total - previousYear.emissions.total) / 1000).toFixed(2)} tons CO₂e reduction)
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            <span>
                              <strong>Increased by {percentageChange.toFixed(1)}%</strong> compared to {previousYear.academicYear}
                              {" "}(+{((yearData.emissions.total - previousYear.emissions.total) / 1000).toFixed(2)} tons CO₂e)
                            </span>
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Statistics */}
      {yearlyData.length > 1 && (
        <Card className="mt-6 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Overall Progress Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Years Tracked</p>
                <p className="text-3xl font-bold text-blue-600">{yearlyData.length}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">First Year Total</p>
                <p className="text-3xl font-bold text-purple-600">
                  {(yearlyData[0].emissions.total / 1000).toFixed(1)} t
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latest Year Total</p>
                <p className="text-3xl font-bold text-green-600">
                  {(yearlyData[yearlyData.length - 1].emissions.total / 1000).toFixed(1)} t
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;
