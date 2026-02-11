import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Leaf, Lightbulb, Droplet, Trash2, Car, UtensilsCrossed } from "lucide-react";

interface EmissionData {
  electricity: number;
  water: number;
  waste: number;
  fuel: number;
  food: number;
  infrastructure: number;
  total: number;
}

const Dashboard = () => {
  const [emissions, setEmissions] = useState<EmissionData>({
    electricity: 0,
    water: 0,
    waste: 0,
    fuel: 0,
    food: 0,
    infrastructure: 0,
    total: 0
  });

  const [highestCategory, setHighestCategory] = useState("");
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Load latest footprint data from localStorage
    const latestData = localStorage.getItem("latestFootprint");
    if (latestData) {
      const data = JSON.parse(latestData);
      setEmissions(data.emissions);
      setHasData(true);

      // Calculate highest emission category
      const categories = [
        { name: "Electricity", value: data.emissions.electricity },
        { name: "Water", value: data.emissions.water },
        { name: "Waste", value: data.emissions.waste },
        { name: "Fuel", value: data.emissions.fuel },
        { name: "Food", value: data.emissions.food },
        { name: "Infrastructure", value: data.emissions.infrastructure }
      ];
      const highest = categories.reduce((prev, current) => 
        prev.value > current.value ? prev : current
      );
      setHighestCategory(highest.name);
    } else {
      // Sample data for demonstration
      const sampleEmissions = {
        electricity: 41000,
        water: 29.8,
        waste: 2500,
        fuel: 5360,
        food: 4500,
        infrastructure: 55000,
        total: 108389.8
      };
      setEmissions(sampleEmissions);
      setHasData(true);
      setHighestCategory("Infrastructure");
    }
  }, []);

  const pieData = [
    { name: "Electricity", value: emissions.electricity, color: "#facc15" },
    { name: "Water", value: emissions.water, color: "#3b82f6" },
    { name: "Waste", value: emissions.waste, color: "#22c55e" },
    { name: "Fuel", value: emissions.fuel, color: "#ef4444" },
    { name: "Food", value: emissions.food, color: "#f97316" },
    { name: "Infrastructure", value: emissions.infrastructure, color: "#8b5cf6" }
  ].filter(item => item.value > 0);

  const barData = pieData.map(item => ({
    name: item.name,
    emissions: (item.value / 1000).toFixed(2),
    fill: item.color
  }));

  const suggestions = {
    "Electricity": [
      "Install LED lighting across campus",
      "Use motion sensors in classrooms and corridors",
      "Switch to renewable energy sources (solar panels)",
      "Implement a campus-wide energy monitoring system"
    ],
    "Water": [
      "Fix leaking taps and pipes immediately",
      "Install water-efficient fixtures and sensors",
      "Set up rainwater harvesting systems",
      "Launch water conservation awareness campaigns"
    ],
    "Waste": [
      "Implement waste segregation at source",
      "Set up composting units for organic waste",
      "Reduce single-use plastics on campus",
      "Organize regular recycling drives"
    ],
    "Fuel": [
      "Encourage carpooling and campus shuttle services",
      "Provide bicycle parking and promote cycling",
      "Transition to electric or hybrid vehicles",
      "Organize walking/cycling weeks"
    ],
    "Food": [
      "Introduce more plant-based meal options",
      "Reduce food waste through better planning",
      "Source food locally to reduce transport emissions",
      "Start a campus food waste composting program"
    ],
    "Infrastructure": [
      "Conduct energy audits of all buildings",
      "Improve insulation in older buildings",
      "Install green roofs and vertical gardens",
      "Design new buildings with sustainability in mind"
    ]
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Electricity": return <Lightbulb className="h-5 w-5" />;
      case "Water": return <Droplet className="h-5 w-5" />;
      case "Waste": return <Trash2 className="h-5 w-5" />;
      case "Fuel": return <Car className="h-5 w-5" />;
      case "Food": return <UtensilsCrossed className="h-5 w-5" />;
      default: return <Leaf className="h-5 w-5" />;
    }
  };

  if (!hasData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            No data available. Please go to Admin Input page to calculate carbon footprint first.
          </AlertDescription>
        </Alert>
      </div>
    );
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

      {/* Total Emissions Card */}
      <Card className="mb-6 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Leaf className="h-8 w-8 text-green-600 mr-2" />
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Campus Carbon Footprint
              </h2>
            </div>
            <p className="text-5xl font-bold text-green-600 mb-1">
              {(emissions.total / 1000).toFixed(2)}
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-400">tons CO₂e</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions Breakdown</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
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

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions Comparison</CardTitle>
            <CardDescription>Category-wise emissions (tons CO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
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

      {/* Highest Emission Warning */}
      <Card className="mb-6 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Highest Emission Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              {getCategoryIcon(highestCategory)}
              <span>{highestCategory}</span>
            </div>
            <Badge variant="destructive" className="text-sm">
              {((pieData.find(d => d.name === highestCategory)?.value || 0) / 1000).toFixed(2)} tons CO₂e
            </Badge>
            <Badge variant="outline" className="text-sm">
              {((pieData.find(d => d.name === highestCategory)?.value || 0) / emissions.total * 100).toFixed(1)}% of total
            </Badge>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This category contributes the most to your campus carbon footprint. Focus reduction efforts here for maximum impact.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Actionable Suggestions */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Recommended Actions to Reduce {highestCategory} Emissions
          </CardTitle>
          <CardDescription>
            Priority actions based on your highest emission source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions[highestCategory as keyof typeof suggestions]?.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 mt-0.5">
                  {index + 1}
                </Badge>
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
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
              {Math.ceil(emissions.total / 21)} 🌳
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on 21kg CO₂/tree/year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Per Student Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {(emissions.total / 1000 / 1000).toFixed(2)} t
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Assuming 1000 students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Emission Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {pieData.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Active emission sources
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
