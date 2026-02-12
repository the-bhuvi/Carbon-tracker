import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveStudentSurvey, saveCarbonHistory } from "@/lib/api";
import { Bus, Utensils, Zap, Recycle, Calculator } from "lucide-react";

interface SurveyFormData {
  // Transportation
  transportMode: string;
  distanceKm: string;
  frequencyPerWeek: string;
  
  // Energy
  electricityUsage: string;
  heatingCooling: string;
  
  // Diet
  dietType: string;
  localFoodPercentage: string;
  
  // Waste
  recyclingFrequency: string;
  plasticUsage: string;
}

const StudentSurveyForm = () => {
  const { toast } = useToast();
  const { user } = useSimpleAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SurveyFormData>({
    transportMode: "",
    distanceKm: "",
    frequencyPerWeek: "",
    electricityUsage: "",
    heatingCooling: "",
    dietType: "",
    localFoodPercentage: "",
    recyclingFrequency: "",
    plasticUsage: ""
  });

  const updateField = (field: keyof SurveyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAndSubmit = async () => {
    // Check authentication
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your survey.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const requiredFields = Object.entries(formData).filter(([key, value]) => !value);
    if (requiredFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Emission factors (kg CO2e per year)
      const transportEmissions: Record<string, number> = {
        walking: 0,
        bicycle: 0,
        motorcycle: 0.1,
        car: 0.192,
        bus: 0.089,
        train: 0.041,
        flight: 0.255
      };

      const electricityEmissions: Record<string, number> = {
        low: 300,
        medium: 600,
        high: 1200
      };

      const heatingCoolingEmissions: Record<string, number> = {
        none: 0,
        minimal: 200,
        moderate: 500,
        extensive: 1000
      };

      const dietEmissions: Record<string, number> = {
        vegan: 1500,
        vegetarian: 1700,
        pescatarian: 1900,
        'meat-eater': 2500
      };

      const plasticEmissions: Record<string, number> = {
        minimal: 50,
        moderate: 150,
        high: 300
      };

      // Calculate transport emissions
      const distance = parseFloat(formData.distanceKm);
      const frequency = parseInt(formData.frequencyPerWeek);
      const transportCO2 = (transportEmissions[formData.transportMode] || 0) * distance * frequency * 52; // Annual

      // Calculate energy emissions
      const electricityCO2 = electricityEmissions[formData.electricityUsage] || 0;
      const heatingCO2 = heatingCoolingEmissions[formData.heatingCooling] || 0;
      const energyCO2 = electricityCO2 + heatingCO2;

      // Calculate food emissions
      const baseDietCO2 = dietEmissions[formData.dietType] || 0;
      const localFoodPercent = parseInt(formData.localFoodPercentage);
      const localFoodReduction = (localFoodPercent / 100) * 0.15; // 15% reduction for local food
      const foodCO2 = baseDietCO2 * (1 - localFoodReduction);

      // Calculate waste emissions
      const recyclingReduction: Record<string, number> = {
        never: 1.0,
        rarely: 0.9,
        sometimes: 0.75,
        often: 0.5,
        always: 0.25
      };
      const plasticCO2 = plasticEmissions[formData.plasticUsage] || 0;
      const recyclingMultiplier = recyclingReduction[formData.recyclingFrequency] || 1.0;
      const wasteCO2 = plasticCO2 * recyclingMultiplier;

      const totalCO2 = transportCO2 + energyCO2 + foodCO2 + wasteCO2;

      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Save to Supabase
      const surveyResponse = await saveStudentSurvey({
        transport_mode: formData.transportMode as any,
        distance_km: parseFloat(formData.distanceKm),
        frequency_per_week: parseInt(formData.frequencyPerWeek),
        electricity_usage: formData.electricityUsage as any,
        heating_cooling: formData.heatingCooling as any,
        diet_type: formData.dietType as any,
        local_food_percentage: parseInt(formData.localFoodPercentage),
        recycling_frequency: formData.recyclingFrequency as any,
        plastic_usage: formData.plasticUsage as any,
        total_carbon_kg: totalCO2,
        survey_month: currentMonth,
        survey_year: currentYear,
      });

      // Save to carbon history
      await saveCarbonHistory('student_survey', surveyResponse.id, {
        transport_carbon_kg: transportCO2,
        energy_carbon_kg: energyCO2,
        food_carbon_kg: foodCO2,
        waste_carbon_kg: wasteCO2,
        total_carbon_kg: totalCO2,
        period_month: currentMonth,
        period_year: currentYear,
      });

      toast({
        title: "Survey Submitted!",
        description: `Your carbon footprint: ${(totalCO2 / 1000).toFixed(2)} tons CO₂e per year`,
      });

      // Reset form
      setFormData({
        transportMode: "",
        distanceKm: "",
        frequencyPerWeek: "",
        electricityUsage: "",
        heatingCooling: "",
        dietType: "",
        localFoodPercentage: "",
        recyclingFrequency: "",
        plasticUsage: ""
      });
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit survey. Please try again.",
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
          Student Carbon Footprint Survey
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Help us track campus sustainability by sharing your habits
        </p>
      </div>

      <div className="space-y-6">
        {/* Transportation Section */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              Transportation
            </CardTitle>
            <CardDescription>
              Your daily commute and travel patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transportMode">Primary Mode of Transport</Label>
              <Select
                value={formData.transportMode}
                onValueChange={(value) => updateField("transportMode", value)}
              >
                <SelectTrigger id="transportMode">
                  <SelectValue placeholder="Select transport mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="bicycle">Bicycle</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="flight">Flight (for long distances)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="distanceKm">Distance to Campus (km)</Label>
                <Input
                  id="distanceKm"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.5"
                  value={formData.distanceKm}
                  onChange={(e) => updateField("distanceKm", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequencyPerWeek">Trips per Week</Label>
                <Input
                  id="frequencyPerWeek"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.frequencyPerWeek}
                  onChange={(e) => updateField("frequencyPerWeek", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Section */}
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Energy Consumption
            </CardTitle>
            <CardDescription>
              Your electricity and energy usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="electricityUsage">Electricity Usage Level</Label>
              <Select
                value={formData.electricityUsage}
                onValueChange={(value) => updateField("electricityUsage", value)}
              >
                <SelectTrigger id="electricityUsage">
                  <SelectValue placeholder="Select usage level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (minimal device usage)</SelectItem>
                  <SelectItem value="medium">Medium (moderate usage)</SelectItem>
                  <SelectItem value="high">High (heavy usage, gaming, etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heatingCooling">Heating/Cooling Usage</Label>
              <Select
                value={formData.heatingCooling}
                onValueChange={(value) => updateField("heatingCooling", value)}
              >
                <SelectTrigger id="heatingCooling">
                  <SelectValue placeholder="Select usage level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="extensive">Extensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Food Section */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-green-600" />
              Food & Diet
            </CardTitle>
            <CardDescription>
              Your dietary preferences and habits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dietType">Diet Type</Label>
              <Select
                value={formData.dietType}
                onValueChange={(value) => updateField("dietType", value)}
              >
                <SelectTrigger id="dietType">
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="pescatarian">Pescatarian</SelectItem>
                  <SelectItem value="meat-eater">Meat Eater</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localFoodPercentage">Local Food Percentage (%)</Label>
              <Input
                id="localFoodPercentage"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 50"
                value={formData.localFoodPercentage}
                onChange={(e) => updateField("localFoodPercentage", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Waste Section */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-purple-600" />
              Waste & Recycling
            </CardTitle>
            <CardDescription>
              Your waste management habits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recyclingFrequency">Recycling Frequency</Label>
              <Select
                value={formData.recyclingFrequency}
                onValueChange={(value) => updateField("recyclingFrequency", value)}
              >
                <SelectTrigger id="recyclingFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="often">Often</SelectItem>
                  <SelectItem value="sometimes">Sometimes</SelectItem>
                  <SelectItem value="rarely">Rarely</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plasticUsage">Plastic Usage</Label>
              <Select
                value={formData.plasticUsage}
                onValueChange={(value) => updateField("plasticUsage", value)}
              >
                <SelectTrigger id="plasticUsage">
                  <SelectValue placeholder="Select usage level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={calculateAndSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
          disabled={isSubmitting || !user}
        >
          <Calculator className="mr-2 h-5 w-5" />
          {isSubmitting ? 'Submitting...' : 'Calculate & Submit My Carbon Footprint'}
        </Button>

        {!user && (
          <Alert>
            <AlertDescription>
              Please log in to submit your carbon footprint survey.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Privacy Note:</strong> Your responses are stored securely and used only for campus sustainability tracking.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default StudentSurveyForm;
