import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, Users, FileText, CheckCircle2 } from "lucide-react";

const StudentSurvey = () => {
  const { toast } = useToast();
  const [surveyLink, setSurveyLink] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [responseCount, setResponseCount] = useState(0);

  // In a real app, this would integrate with Google Forms API
  const generateSurveyLink = () => {
    if (!surveyLink) {
      toast({
        title: "Missing Link",
        description: "Please enter your Google Form link",
        variant: "destructive"
      });
      return;
    }

    // Validate URL
    try {
      new URL(surveyLink);
      setGeneratedLink(surveyLink);
      
      // Store in localStorage (would be Firebase in production)
      localStorage.setItem("studentSurveyLink", surveyLink);
      
      toast({
        title: "Survey Link Generated!",
        description: "Students can now access the carbon footprint survey",
      });

      // Simulate response count (in real app, would fetch from Google Forms API)
      const storedCount = localStorage.getItem("surveyResponseCount");
      if (storedCount) {
        setResponseCount(parseInt(storedCount));
      }
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Form link",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Copied!",
      description: "Survey link copied to clipboard",
    });
  };

  const openLink = () => {
    window.open(generatedLink, "_blank");
  };

  // Load saved link on component mount
  useState(() => {
    const savedLink = localStorage.getItem("studentSurveyLink");
    if (savedLink) {
      setGeneratedLink(savedLink);
      setSurveyLink(savedLink);
    }
    const storedCount = localStorage.getItem("surveyResponseCount") || "0";
    setResponseCount(parseInt(storedCount));
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Student Carbon Survey
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Collect student carbon footprint data via Google Forms
        </p>
      </div>

      <div className="space-y-6">
        {/* Survey Generation Card */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Generate Student Survey
            </CardTitle>
            <CardDescription>
              Connect your Google Form to collect student data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Create a Google Form with questions about student travel patterns, food habits, 
                and electricity usage. Then paste the shareable link below.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="surveyLink">Google Form Link</Label>
              <div className="flex gap-2">
                <Input
                  id="surveyLink"
                  type="url"
                  placeholder="https://forms.gle/..."
                  value={surveyLink}
                  onChange={(e) => setSurveyLink(e.target.value)}
                />
                <Button onClick={generateSurveyLink} className="bg-green-600 hover:bg-green-700">
                  Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Link Display */}
        {generatedLink && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Active Survey Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Survey Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={openLink}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Total Student Responses</span>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {responseCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Survey Information */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Data Collection</CardTitle>
            <CardDescription>
              What data is collected from students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Transport
                  </h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Travel mode (bus, bike, car)</li>
                    <li>• Distance from home</li>
                    <li>• Frequency of travel</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Food Habits
                  </h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Diet type (veg/non-veg)</li>
                    <li>• Meals per day on campus</li>
                    <li>• Food waste habits</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Energy Use
                  </h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Device usage hours</li>
                    <li>• Hostel electricity use</li>
                    <li>• AC/fan usage patterns</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Privacy Note:</strong> All student responses are anonymous and used only for carbon footprint estimation. 
                  No personal identification data is collected.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>How to Set Up Your Google Form</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">1</Badge>
                <span>Go to <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Forms</a> and create a new form</span>
              </li>
              <li className="flex gap-2">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">2</Badge>
                <span>Add questions about transport mode, distance, food habits, and energy usage</span>
              </li>
              <li className="flex gap-2">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">3</Badge>
                <span>Click the "Send" button and copy the shareable link</span>
              </li>
              <li className="flex gap-2">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">4</Badge>
                <span>Paste the link in the field above and click "Generate"</span>
              </li>
              <li className="flex gap-2">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">5</Badge>
                <span>Share the generated link with students via email or campus portal</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentSurvey;
