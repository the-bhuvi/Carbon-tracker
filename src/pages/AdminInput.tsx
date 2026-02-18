import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Calculator } from "lucide-react";
import { useUpsertMonthlyAudit, useCurrentUser } from "@/hooks/useSupabase";

interface MonthlyAuditFormData {
  year: string;
  month: string;
  factorName: string;
  activityData: string;
  emissionFactor: string;
  unit: string;
  notes: string;
}

// Common emission factors
const COMMON_FACTORS = {
  'Electricity': 0.73,
  'Natural Gas': 1.89,
  'Diesel': 2.68,
  'Petrol': 2.31,
  'LPG': 1.50,
  'Water': 0.35,
  'Paper': 1.70,
  'Plastic': 2.00,
  'E-Waste': 3.50,
  'Organic Waste': 0.30,
  'Travel (km)': 0.12
};

const FACTOR_UNITS = {
  'Electricity': 'kWh',
  'Natural Gas': 'm³',
  'Diesel': 'liters',
  'Petrol': 'liters',
  'LPG': 'kg',
  'Water': 'liters',
  'Paper': 'kg',
  'Plastic': 'kg',
  'E-Waste': 'kg',
  'Organic Waste': 'kg',
  'Travel (km)': 'km'
};

const AdminInput = () => {
  const { toast } = useToast();
  const { data: user } = useCurrentUser();
  const { mutate: upsertMonthlyAudit, isPending } = useUpsertMonthlyAudit();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  const [formData, setFormData] = useState<MonthlyAuditFormData>({
    year: currentYear,
    month: currentMonth,
    factorName: 'Electricity',
    activityData: '',
    emissionFactor: COMMON_FACTORS['Electricity'].toString(),
    unit: FACTOR_UNITS['Electricity'] || '',
    notes: ''
  });

  const updateField = (field: keyof MonthlyAuditFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-update emission factor and unit when factor changes
    if (field === 'factorName' && value in COMMON_FACTORS) {
      setFormData(prev => ({
        ...prev,
        emissionFactor: COMMON_FACTORS[value as keyof typeof COMMON_FACTORS].toString(),
        unit: FACTOR_UNITS[value as keyof typeof FACTOR_UNITS] || ''
      }));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.year || !formData.month || !formData.factorName || !formData.activityData) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Year, Month, Factor, Activity Data).",
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

    // Prepare audit data
    const auditData = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      factor_name: formData.factorName,
      activity_data: parseFloat(formData.activityData),
      emission_factor: parseFloat(formData.emissionFactor),
      unit: formData.unit || null,
      notes: formData.notes || null,
      created_by: user.id
    };

    upsertMonthlyAudit(auditData, {
      onSuccess: () => {
        const calculatedEmission = (parseFloat(formData.activityData) * parseFloat(formData.emissionFactor)).toFixed(2);
        toast({
          title: "Success!",
          description: `Monthly audit entry recorded: ${calculatedEmission} kg CO₂e`
        });

        // Reset form but keep year/month
        setFormData({
          year: formData.year,
          month: formData.month,
          factorName: 'Electricity',
          activityData: '',
          emissionFactor: COMMON_FACTORS['Electricity'].toString(),
          unit: FACTOR_UNITS['Electricity'] || '',
          notes: ''
        });
      },
      onError: (error: any) => {
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to save monthly audit data",
          variant: "destructive"
        });
      }
    });
  };

  const calculatedEmission = formData.activityData && formData.emissionFactor
    ? (parseFloat(formData.activityData) * parseFloat(formData.emissionFactor)).toFixed(2)
    : '0.00';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Institutional Monthly Audit
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter monthly emission factor data for institutional-level tracking (July 2024 onward)
        </p>
      </div>

      <div className="space-y-6">
        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Period</CardTitle>
            <CardDescription>Select the year and month for this audit entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={formData.year} onValueChange={(value) => updateField("year", value)}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027].map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={formData.month} onValueChange={(value) => updateField("month", value)}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthNum = i + 1;
                      const monthStr = monthNum.toString().padStart(2, '0');
                      const monthName = new Date(2024, i).toLocaleDateString('en-US', { month: 'long' });
                      return (
                        <SelectItem key={monthNum} value={monthStr}>
                          {monthName} ({monthStr})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emission Factor Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Emission Factor</CardTitle>
            <CardDescription>Select the emission factor or enter a custom one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="factorName">Factor Name</Label>
              <Select value={formData.factorName} onValueChange={(value) => updateField("factorName", value)}>
                <SelectTrigger id="factorName">
                  <SelectValue placeholder="Select factor" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMMON_FACTORS).map(([name]) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Factor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="activityData">Activity Value</Label>
                <Input
                  id="activityData"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 1000"
                  value={formData.activityData}
                  onChange={(e) => updateField("activityData", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">in {formData.unit}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emissionFactor">Emission Factor</Label>
                <Input
                  id="emissionFactor"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 0.73"
                  value={formData.emissionFactor}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">kg CO₂e per unit (auto-set from factor)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calculatedEmission">Calculated Emission</Label>
                <Input
                  id="calculatedEmission"
                  type="text"
                  placeholder="Auto-calculated"
                  value={`${calculatedEmission} kg`}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">Activity × Factor</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Optional notes for this entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                placeholder="e.g., Building A electricity consumption, Generator maintenance..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="w-full p-2 border rounded-md min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            <span className="font-semibold">Note:</span> Emission factors are automatically calculated using pre-configured values. You can customize the emission factor if needed for specific conditions or data sources.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button 
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            disabled={isPending}
          >
            <Calculator className="mr-2 h-5 w-5" />
            {isPending ? 'Submitting...' : 'Submit Monthly Audit'}
          </Button>
          <Button 
            onClick={() => setFormData({
              year: currentYear,
              month: currentMonth,
              factorName: 'Electricity',
              activityData: '',
              emissionFactor: COMMON_FACTORS['Electricity'].toString(),
              unit: FACTOR_UNITS['Electricity'] || '',
              notes: ''
            })}
            variant="outline"
            size="lg"
          >
            Reset Form
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminInput;
