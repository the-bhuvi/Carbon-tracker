import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const RefreshDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshedData, setRefreshedData] = useState<{
    monthlyCount: number;
    academicYearCount: number;
  } | null>(null);

  const handleRefreshMonthly = async (year: number, month: number) => {
    try {
      const { error } = await supabase.rpc('refresh_monthly_summary', {
        p_year: year,
        p_month: month
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error refreshing monthly summary:', error);
      return false;
    }
  };

  const handleRefreshAcademicYear = async (academicYear: string) => {
    try {
      const { error } = await supabase.rpc('refresh_academic_year_summary', {
        p_academic_year: academicYear
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error refreshing academic year summary:', error);
      return false;
    }
  };

  const handleRefreshCurrentMonth = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const success = await handleRefreshMonthly(year, month);
      
      if (success) {
        toast({
          title: "Success!",
          description: `Dashboard data refreshed for ${year}-${month.toString().padStart(2, '0')}. Changes should appear immediately.`
        });
        setRefreshedData({ monthlyCount: 1, academicYearCount: 0 });
      } else {
        throw new Error('Failed to refresh data');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCurrentYear = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      let monthlyCount = 0;
      // Refresh all months of the current year
      for (let m = 1; m <= 12; m++) {
        if (await handleRefreshMonthly(year, m)) {
          monthlyCount++;
        }
      }

      // Refresh academic years that span current year
      const academicYears = [
        `${year - 1}-${year}`,
        `${year}-${year + 1}`
      ];
      let academicYearCount = 0;
      for (const ay of academicYears) {
        if (await handleRefreshAcademicYear(ay)) {
          academicYearCount++;
        }
      }

      toast({
        title: "Success!",
        description: `Dashboard data refreshed. Updated ${monthlyCount} months and ${academicYearCount} academic years. Changes should appear immediately.`
      });
      setRefreshedData({ monthlyCount, academicYearCount });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCustom = async (year: string, month?: string) => {
    setIsLoading(true);
    try {
      let monthlyCount = 0;
      let academicYearCount = 0;

      const yearNum = parseInt(year);
      
      if (month) {
        const monthNum = parseInt(month);
        if (await handleRefreshMonthly(yearNum, monthNum)) {
          monthlyCount++;
        }
        toast({
          title: "Success!",
          description: `Dashboard data refreshed for ${year}-${month.padStart(2, '0')}. Changes should appear immediately.`
        });
      } else {
        // Refresh all months of the year
        for (let m = 1; m <= 12; m++) {
          if (await handleRefreshMonthly(yearNum, m)) {
            monthlyCount++;
          }
        }
        
        // Refresh academic years
        const academicYears = [
          `${yearNum - 1}-${yearNum}`,
          `${yearNum}-${yearNum + 1}`
        ];
        for (const ay of academicYears) {
          if (await handleRefreshAcademicYear(ay)) {
            academicYearCount++;
          }
        }

        toast({
          title: "Success!",
          description: `Dashboard data refreshed. Updated ${monthlyCount} months and ${academicYearCount} academic years.`
        });
      }

      setRefreshedData({ monthlyCount, academicYearCount });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Refresh Dashboard Data</h1>
          <p className="text-gray-600">Update dashboard calculations after adding data directly to the database</p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>When to use this:</strong> If you added data directly to the database tables (like <code className="bg-white px-1 rounded">monthly_audit_data</code>), use this page to recalculate the dashboard summaries. The Admin Input form does this automatically.
          </AlertDescription>
        </Alert>

        {refreshedData && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              ✓ Successfully refreshed {refreshedData.monthlyCount} month(s) and {refreshedData.academicYearCount} academic year(s). Go to Dashboard to see updated data.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {/* Current Month */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Current Month Only
              </CardTitle>
              <CardDescription>Refresh calculations for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRefreshCurrentMonth}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Current Month'}
              </Button>
            </CardContent>
          </Card>

          {/* Current Year */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Current Year
              </CardTitle>
              <CardDescription>Refresh all months and academic years for this year</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRefreshCurrentYear}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Current Year'}
              </Button>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Dashboard Still Not Showing Data?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Checklist:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Data is in the <strong>monthly_audit_data</strong> table</li>
                  <li>Year and month values are correct</li>
                  <li>You've clicked the refresh button above</li>
                  <li>Dashboard is showing the correct month/year selection</li>
                  <li>Try refreshing the page (Ctrl+R) after clicking refresh</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-700">
                  <strong>Pro tip:</strong> When using the Admin Input form, refreshes happen automatically. Data added directly to the database requires manual refresh here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RefreshDashboard;
