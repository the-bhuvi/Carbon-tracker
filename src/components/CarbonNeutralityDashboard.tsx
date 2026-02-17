import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCampusCarbonSummary } from '@/hooks/useCampusCarbonSummary';
import { CarbonKPICards } from '@/components/CarbonKPICards';
import { ScopeBreakdownChart } from '@/components/ScopeBreakdownChart';
import { NeutralityProgress } from '@/components/NeutralityProgress';
import { CarbonSimulator } from '@/components/CarbonSimulator';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';

export function CarbonNeutralityDashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: summary, isLoading, error } = useCampusCarbonSummary(selectedYear);

  // Generate year options (current year and past 4 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load carbon neutrality data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!summary) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No data available for {selectedYear}. Please select a different year.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carbon Neutrality Dashboard</h1>
          <p className="text-muted-foreground">
            Track campus emissions, tree absorption, and progress toward carbon neutrality
          </p>
        </div>
        <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(Number(val))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <CarbonKPICards summary={summary} />

      {/* Tabs for Different Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <NeutralityProgress summary={summary} />
            <ScopeBreakdownChart summary={summary} />
          </div>
        </TabsContent>

        {/* Simulator Tab */}
        <TabsContent value="simulator" className="space-y-6">
          <CarbonSimulator year={selectedYear} defaultTreeCount={summary.total_tree_count} />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsPanel year={selectedYear} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
