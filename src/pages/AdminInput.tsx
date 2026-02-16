import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Droplet, Trash2, Fuel, Calculator, Car } from "lucide-react";
import { useCreateCarbonSubmission, useDepartments, useCurrentUser } from "@/hooks/useSupabase";

interface CarbonInputData {
  electricity: string;
  diesel: string;
  petrol: string;
  lpg: string;
  png: string;
  travel: string;
  water: string;
  paper: string;
  ewaste: string;
  departmentId: string;
}

const AdminInput = () => {
  const { toast } = useToast();
  const { data: user } = useCurrentUser();
  const { data: departments } = useDepartments();
  const { mutate: createSubmission, isPending } = useCreateCarbonSubmission();
  
  const [formData, setFormData] = useState<CarbonInputData>({
    electricity: "",
    diesel: "",
    petrol: "",
    lpg: "",
    png: "",
    travel: "",
    water: "",
    paper: "",
    ewaste: "",
    departmentId: ""
  });

  const updateField = (field: keyof CarbonInputData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.departmentId) {
      toast({
        title: "Missing Information",
        description: "Please select a department.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to submit data.",
        variant: "destructive"
      });
      return;
    }

    // Prepare submission data
    const submissionData = {
      user_id: user.id,
      department_id: formData.departmentId,
      electricity_kwh: parseFloat(formData.electricity) || 0,
      diesel_liters: parseFloat(formData.diesel) || 0,
      petrol_liters: parseFloat(formData.petrol) || 0,
      lpg_kg: parseFloat(formData.lpg) || 0,
      png_m3: parseFloat(formData.png) || 0,
      travel_km: parseFloat(formData.travel) || 0,
      water_liters: parseFloat(formData.water) || 0,
      paper_kg: parseFloat(formData.paper) || 0,
      ewaste_kg: parseFloat(formData.ewaste) || 0
    };

    createSubmission(submissionData, {
      onSuccess: (data) => {
        toast({
          title: "Success!",
          description: `Carbon footprint recorded: ${((data.total_carbon || 0) / 1000).toFixed(2)} tons CO₂e`,
        });

        // Reset form
        setFormData({
          electricity: "",
          diesel: "",
          petrol: "",
          lpg: "",
          png: "",
          travel: "",
          water: "",
          paper: "",
          ewaste: "",
          departmentId: formData.departmentId // Keep department selected
        });
      },
      onError: (error: any) => {
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to save carbon footprint data",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Carbon Emission Input
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter consumption data to track carbon footprint
        </p>
      </div>

      <div className="space-y-6">
        {/* Department Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Department</CardTitle>
            <CardDescription>Select the department for this submission</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => updateField("departmentId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Energy Consumption */}
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Energy Consumption
            </CardTitle>
            <CardDescription>Electricity and fuel usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="electricity">Electricity (kWh)</Label>
                <Input
                  id="electricity"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 450"
                  value={formData.electricity}
                  onChange={(e) => updateField("electricity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diesel">Diesel (liters)</Label>
                <Input
                  id="diesel"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 20"
                  value={formData.diesel}
                  onChange={(e) => updateField("diesel", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="petrol">Petrol (liters)</Label>
                <Input
                  id="petrol"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 30"
                  value={formData.petrol}
                  onChange={(e) => updateField("petrol", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lpg">LPG (kg)</Label>
                <Input
                  id="lpg"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 15"
                  value={formData.lpg}
                  onChange={(e) => updateField("lpg", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="png">PNG (m³)</Label>
                <Input
                  id="png"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 25"
                  value={formData.png}
                  onChange={(e) => updateField("png", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transportation & Resources */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Transportation & Resources
            </CardTitle>
            <CardDescription>Travel and resource consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="travel">Travel Distance (km)</Label>
                <Input
                  id="travel"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 80"
                  value={formData.travel}
                  onChange={(e) => updateField("travel", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="water" className="flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  Water (liters)
                </Label>
                <Input
                  id="water"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 8000"
                  value={formData.water}
                  onChange={(e) => updateField("water", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paper">Paper (kg)</Label>
                <Input
                  id="paper"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 12"
                  value={formData.paper}
                  onChange={(e) => updateField("paper", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ewaste" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  E-Waste (kg)
                </Label>
                <Input
                  id="ewaste"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5"
                  value={formData.ewaste}
                  onChange={(e) => updateField("ewaste", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            <span className="font-semibold">Note:</span> All calculations are automatically performed using standard emission factors stored in the database.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
          disabled={isPending}
        >
          <Calculator className="mr-2 h-5 w-5" />
          {isPending ? 'Submitting...' : 'Submit Carbon Data'}
        </Button>
      </div>
    </div>
  );
};

export default AdminInput;
