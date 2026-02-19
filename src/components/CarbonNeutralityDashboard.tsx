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
import {
  useCampusCarbonSummary,
  useCampusCarbonSummaryByAcademicYear,
} from '@/hooks/useCampusCarbonSummary';
import { CarbonKPICards } from '@/components/CarbonKPICards';
import { ScopeBreakdownChart } from '@/components/ScopeBreakdownChart';
import { NeutralityProgress } from '@/components/NeutralityProgress';
import { CarbonSimulator } from '@/components/CarbonSimulator';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';

type ViewMode = 'calendar' | 'academic';

// Academic years start from 2024-2025 (earliest data is July 2024)
const FIRST_ACADEMIC_YEAR_START = 2024;

function buildAcademicYearOptions(currentYear: number): string[] {
  const currentMonth = new Date().getMonth() + 1;
  // Only include current academic year if it has started (July+)
  const latestStart = currentMonth >= 7 ? currentYear : currentYear - 1;
  const options: string[] = [];
  for (let y = latestStart; y >= FIRST_ACADEMIC_YEAR_START; y--) {
    options.push(`${y}-${y + 1}`);
  }
  return options;
}

function NeutralityContent({ viewMode, selectedYear, selectedAcademicYear }: {
  viewMode: ViewMode;
  selectedYear: number;
  selectedAcademicYear: string;
}) {
  const calendarQuery = useCampusCarbonSummary(viewMode === 'calendar' ? selectedYear : 0);
  const academicQuery = useCampusCarbonSummaryByAcademicYear(
    viewMode === 'academic' ? selectedAcademicYear : ''
  );

  const { data: summary, isLoading, error } =
    viewMode === 'academic' ? academicQuery : calendarQuery;

  const yearLabel = viewMode === 'academic' ? selectedAcademicYear : String(selectedYear);

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
          No data available for {yearLabel}. Please select a different period.
        </AlertDescription>
      </Alert>
    );
  }

  const simulatorYear =
    viewMode === 'academic'
      ? parseInt(selectedAcademicYear.split('-')[0])
      : selectedYear;

  return (
    <>
      {/* KPI Cards */}
      <CarbonKPICards summary={summary} />

      {/* Tabs for Different Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <NeutralityProgress summary={summary} />
            <ScopeBreakdownChart summary={summary} />
          </div>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <CarbonSimulator year={simulatorYear} defaultTreeCount={summary.total_tree_count} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsPanel year={simulatorYear} />
        </TabsContent>
      </Tabs>
    </>
  );
}

export function CarbonNeutralityDashboard() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // Default to current academic year if it has started (July+), otherwise previous
  const defaultAcademicStart = currentMonth >= 7 ? currentYear : currentYear - 1;
  const [viewMode, setViewMode] = useState<ViewMode>('academic');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    `${Math.max(defaultAcademicStart, FIRST_ACADEMIC_YEAR_START)}-${Math.max(defaultAcademicStart + 1, FIRST_ACADEMIC_YEAR_START + 1)}`
  );

  const calendarYearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const academicYearOptions = buildAcademicYearOptions(currentYear);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carbon Neutrality Dashboard</h1>
          <p className="text-muted-foreground">
            Track campus emissions, tree absorption, and progress toward carbon neutrality
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academic">Academic Year</SelectItem>
              <SelectItem value="calendar">Calendar Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Year selector */}
          {viewMode === 'calendar' ? (
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {calendarYearOptions.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map((ay) => (
                  <SelectItem key={ay} value={ay}>
                    {ay}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <NeutralityContent
        viewMode={viewMode}
        selectedYear={selectedYear}
        selectedAcademicYear={selectedAcademicYear}
      />
    </div>
  );
}
