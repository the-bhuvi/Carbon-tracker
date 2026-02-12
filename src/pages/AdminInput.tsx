import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveAdminFacilityData, saveCarbonHistory } from "@/lib/api";
import { Building2, Lightbulb, Droplet, Trash2, Fuel, Calculator } from "lucide-react";

interface AdminInputData {
  // Section A: Indirect inputs
  classrooms: string;
  buildings: string;
  hostels: string;
  canteens: string;
  foodType: string;
  
  // Section B: Direct inputs
  electricity: string;
  water: string;
  waste: string;
  fuel: string;
}

const AdminInput = () => {
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AdminInputData>({
    classrooms: "",
    buildings: "",
    hostels: "",
    canteens: "",
    foodType: "",
    electricity: "",
    water: "",
    waste: "",
    fuel: ""
  });

  const updateField = (field: keyof AdminInputData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCarbonFootprint = async () => {
    // Check authentication
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save data.",
        variant: "destructive"
      });
      return;
    }

    // Check admin role
    if (userRole !== 'admin') {
      toast({
        title: "Admin Access Required",
        description: "Only admins can submit facility data.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const requiredFields = Object.entries(formData).filter(([key, value]) => !value);
    if (requiredFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before calculating.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Emission factors (kg CO2e)
      const emissionFactors = {
        classroom: 500,      // per classroom per year
        building: 2000,      // per building per year
        hostel: 3000,        // per hostel per year
        canteen: 1500,       // per canteen per year
        foodVeg: 0.5,        // multiplier for vegetarian
        foodMixed: 1.0,      // multiplier for mixed
        foodNonVeg: 1.5,     // multiplier for non-veg
        electricity: 0.82,   // per kWh
        water: 0.298,        // per 1000 litres
        waste: 0.5,          // per kg
        fuel: 2.68           // per litre
      };

      // Calculate indirect emissions
      const classroomEmissions = parseInt(formData.classrooms) * emissionFactors.classroom;
      const buildingEmissions = parseInt(formData.buildings) * emissionFactors.building;
      const hostelEmissions = parseInt(formData.hostels) * emissionFactors.hostel;
      const canteenEmissions = parseInt(formData.canteens) * emissionFactors.canteen;
      
      const foodMultiplier = formData.foodType === "Vegetarian" ? emissionFactors.foodVeg :
                            formData.foodType === "Non-vegetarian" ? emissionFactors.foodNonVeg :
                            emissionFactors.foodMixed;
      const foodEmissions = canteenEmissions * foodMultiplier;

      // Calculate direct emissions
      const electricityEmissions = parseFloat(formData.electricity) * emissionFactors.electricity;
      const waterEmissions = (parseFloat(formData.water) / 1000) * emissionFactors.water;
      const wasteEmissions = parseFloat(formData.waste) * emissionFactors.waste;
      const fuelEmissions = parseFloat(formData.fuel) * emissionFactors.fuel;

      const totalEmissions = classroomEmissions + buildingEmissions + hostelEmissions + 
                            foodEmissions + electricityEmissions + waterEmissions + 
                            wasteEmissions + fuelEmissions;

      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Save to Supabase
      const facilityData = await saveAdminFacilityData({
        classrooms: parseInt(formData.classrooms),
        buildings: parseInt(formData.buildings),
        hostels: parseInt(formData.hostels),
        canteens: parseInt(formData.canteens),
        food_type: formData.foodType.toLowerCase() as 'vegetarian' | 'non-vegetarian' | 'mixed',
        electricity_kwh: parseFloat(formData.electricity),
        water_liters: parseFloat(formData.water),
        waste_kg: parseFloat(formData.waste),
        fuel_liters: parseFloat(formData.fuel),
        fuel_type: 'diesel',
        total_carbon_kg: totalEmissions,
        month: currentMonth,
        year: currentYear,
      });

      // Save to carbon history
      await saveCarbonHistory('facility', facilityData.id, {
        energy_carbon_kg: electricityEmissions,
        waste_carbon_kg: wasteEmissions,
        food_carbon_kg: foodEmissions,
        total_carbon_kg: totalEmissions,
        period_month: currentMonth,
        period_year: currentYear,
      });

      toast({
        title: "Success!",
        description: `Carbon footprint saved: ${(totalEmissions / 1000).toFixed(2)} tons CO₂e`,
      });

      // Reset form
      setFormData({
        classrooms: "",
        buildings: "",
        hostels: "",
        canteens: "",
        foodType: "",
        electricity: "",
        water: "",
        waste: "",
        fuel: ""
      });
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Input
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter campus data to calculate carbon footprint
        </p>
      </div>

      <div className="space-y-6">
        {/* Section A: Indirect / Assumption-based inputs */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Section A: Indirect / Assumption-based Inputs
            </CardTitle>
            <CardDescription>
              Infrastructure and operational data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <span className="font-semibold">Note:</span> Values are estimated using standard emission factors
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="classrooms">Number of Classrooms</Label>
                <Input
                  id="classrooms"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.classrooms}
                  onChange={(e) => updateField("classrooms", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildings">Number of Buildings</Label>
                <Input
                  id="buildings"
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.buildings}
                  onChange={(e) => updateField("buildings", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostels">Number of Hostels</Label>
                <Input
                  id="hostels"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.hostels}
                  onChange={(e) => updateField("hostels", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canteens">Number of Canteens</Label>
                <Input
                  id="canteens"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.canteens}
                  onChange={(e) => updateField("canteens", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foodType">Food Supply Type</Label>
              <Select
                value={formData.foodType}
                onValueChange={(value) => updateField("foodType", value)}
              >
                <SelectTrigger id="foodType">
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Non-vegetarian">Non-vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section B: Direct inputs */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Section B: Direct Inputs
            </CardTitle>
            <CardDescription>
              Measured consumption data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="electricity" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Electricity Consumption (kWh)
                </Label>
                <Input
                  id="electricity"
                  type="number"
                  placeholder="e.g., 50000"
                  value={formData.electricity}
                  onChange={(e) => updateField("electricity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="water" className="flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  Water Usage (litres)
                </Label>
                <Input
                  id="water"
                  type="number"
                  placeholder="e.g., 100000"
                  value={formData.water}
                  onChange={(e) => updateField("water", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waste" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Waste Generated (kg)
                </Label>
                <Input
                  id="waste"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.waste}
                  onChange={(e) => updateField("waste", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel" className="flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  Fuel Consumption (litres)
                </Label>
                <Input
                  id="fuel"
                  type="number"
                  placeholder="e.g., 2000"
                  value={formData.fuel}
                  onChange={(e) => updateField("fuel", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={calculateCarbonFootprint}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
          disabled={isSubmitting || !user || userRole !== 'admin'}
        >
          <Calculator className="mr-2 h-5 w-5" />
          {isSubmitting ? 'Saving...' : 'Calculate & Save Carbon Footprint'}
        </Button>

        {!user && (
          <Alert>
            <AlertDescription>
              Please log in as an admin to submit facility data.
            </AlertDescription>
          </Alert>
        )}

        {user && userRole !== 'admin' && (
          <Alert>
            <AlertDescription>
              Admin access required to submit facility data.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AdminInput;
