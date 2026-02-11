import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Leaf, TrendingDown, TrendingUp, Car, Zap, Trash2, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface FootprintEntry {
  id: string;
  date: Date;
  category: string;
  activity: string;
  amount: number;
  unit: string;
  co2e: number;
}

const Index = () => {
  const [entries, setEntries] = useState<FootprintEntry[]>([
    {
      id: "1",
      date: new Date(2026, 1, 8),
      category: "Transport",
      activity: "Car commute",
      amount: 15,
      unit: "km",
      co2e: 3.45
    },
    {
      id: "2",
      date: new Date(2026, 1, 9),
      category: "Energy",
      activity: "Electricity usage",
      amount: 25,
      unit: "kWh",
      co2e: 12.5
    },
    {
      id: "3",
      date: new Date(2026, 1, 10),
      category: "Food",
      activity: "Meat consumption",
      amount: 500,
      unit: "g",
      co2e: 6.8
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    category: "",
    activity: "",
    amount: "",
    unit: "",
    date: new Date()
  });

  const categories = [
    { name: "Transport", icon: Car, color: "bg-blue-500" },
    { name: "Energy", icon: Zap, color: "bg-yellow-500" },
    { name: "Waste", icon: Trash2, color: "bg-green-500" },
    { name: "Food", icon: UtensilsCrossed, color: "bg-orange-500" }
  ];

  const calculateCO2e = (category: string, amount: number): number => {
    const factors: { [key: string]: number } = {
      "Transport": 0.23, // kg CO2e per km
      "Energy": 0.5,     // kg CO2e per kWh
      "Waste": 0.3,      // kg CO2e per kg
      "Food": 0.0136     // kg CO2e per g (meat)
    };
    return amount * (factors[category] || 0);
  };

  const handleAddEntry = () => {
    if (!newEntry.category || !newEntry.activity || !newEntry.amount || !newEntry.unit) {
      return;
    }

    const amount = parseFloat(newEntry.amount);
    const co2e = calculateCO2e(newEntry.category, amount);

    const entry: FootprintEntry = {
      id: Date.now().toString(),
      date: newEntry.date,
      category: newEntry.category,
      activity: newEntry.activity,
      amount: amount,
      unit: newEntry.unit,
      co2e: co2e
    };

    setEntries([entry, ...entries]);
    setNewEntry({
      category: "",
      activity: "",
      amount: "",
      unit: "",
      date: new Date()
    });
  };

  const totalCO2e = entries.reduce((sum, entry) => sum + entry.co2e, 0);
  const weeklyAverage = totalCO2e / 1; // Simplified for demo
  const monthlyProjection = weeklyAverage * 4.3;

  const getCategoryTotal = (category: string) => {
    return entries
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.co2e, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Footprint Tracker</h1>
            </div>
            <Badge variant="outline" className="text-sm">
              {format(new Date(), "MMMM dd, yyyy")}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CO₂e</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCO2e.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground">All time emissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyAverage.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground">Per week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Projection</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyProjection.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground">Estimated for this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="dashboard" className="space-y-4">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="add">Add Entry</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Emissions by Category</CardTitle>
                    <CardDescription>Your carbon footprint breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categories.map((cat) => {
                      const categoryTotal = getCategoryTotal(cat.name);
                      const percentage = totalCO2e > 0 ? (categoryTotal / totalCO2e) * 100 : 0;
                      const Icon = cat.icon;
                      
                      return (
                        <div key={cat.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn("rounded-full p-2", cat.color)}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium">{cat.name}</span>
                            </div>
                            <span className="text-sm font-medium">{categoryTotal.toFixed(2)} kg CO₂e</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={cn("h-full transition-all", cat.color)}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="add" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Entry</CardTitle>
                    <CardDescription>Track your carbon footprint activities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newEntry.category}
                        onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.name} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activity">Activity Description</Label>
                      <Input
                        id="activity"
                        placeholder="e.g., Car commute, Electricity usage"
                        value={newEntry.activity}
                        onChange={(e) => setNewEntry({ ...newEntry, activity: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0"
                          value={newEntry.amount}
                          onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          placeholder="e.g., km, kWh, kg"
                          value={newEntry.unit}
                          onChange={(e) => setNewEntry({ ...newEntry, unit: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newEntry.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newEntry.date ? format(newEntry.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newEntry.date}
                            onSelect={(date) => date && setNewEntry({ ...newEntry, date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <Button onClick={handleAddEntry} className="w-full">
                      Add Entry
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                    <CardDescription>Your recent carbon footprint entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {entries.length === 0 ? (
                        <p className="text-center text-muted-foreground">No entries yet. Add your first entry!</p>
                      ) : (
                        entries.map((entry) => {
                          const category = categories.find(c => c.name === entry.category);
                          const Icon = category?.icon || Leaf;
                          
                          return (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between rounded-lg border p-4"
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn("rounded-full p-2", category?.color || "bg-gray-500")}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium">{entry.activity}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.amount} {entry.unit} • {format(entry.date, "MMM dd, yyyy")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{entry.co2e.toFixed(2)} kg</p>
                                <p className="text-xs text-muted-foreground">CO₂e</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💡 Tips to Reduce</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <p className="font-medium">Transport</p>
                  <p className="text-xs text-muted-foreground">Use public transit or bike when possible</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
                  <p className="font-medium">Energy</p>
                  <p className="text-xs text-muted-foreground">Turn off lights and unplug devices</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                  <p className="font-medium">Waste</p>
                  <p className="text-xs text-muted-foreground">Recycle and compost when available</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
                  <p className="font-medium">Food</p>
                  <p className="text-xs text-muted-foreground">Choose plant-based options more often</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trees needed to offset:</span>
                    <span className="font-semibold">{Math.ceil(totalCO2e / 21)} 🌳</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total entries:</span>
                    <span className="font-semibold">{entries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days tracked:</span>
                    <span className="font-semibold">{new Set(entries.map(e => e.date.toDateString())).size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
