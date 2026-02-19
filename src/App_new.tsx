import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import AdminInput from "./pages/AdminInput";
import StudentSurvey from "./pages/StudentSurvey";
import FacultySurvey from "./pages/FacultySurvey";
import AdminSurveyManagement from "./pages/AdminSurveyManagement";
import Login from "./pages/Login";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentSignup from "./pages/StudentSignup";
import LandingPage from "./pages/LandingPage";
import DebugUser from "./pages/DebugUser";
import NotFound from "./pages/NotFound";
import CarbonNeutralityPage from "./pages/CarbonNeutralityPage";
import RefreshDashboard from "./pages/RefreshDashboard";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user, userRole, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    // Redirect based on user role
    if (userRole === 'admin') {
      return <Navigate to="/admin/input" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/student-survey" replace />;
    } else if (userRole === 'faculty') {
      return <Navigate to="/faculty-survey" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/landing" replace />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/student/login" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, userRole, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Public routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/signup" element={<StudentSignup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <Navigation />
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/refresh-dashboard" element={<AdminRoute><RefreshDashboard /></AdminRoute>} />
                      <Route path="/carbon-neutrality" element={<CarbonNeutralityPage />} />
                      <Route path="/debug" element={<DebugUser />} />
                      <Route path="/student-survey" element={<StudentSurvey />} />
                      <Route path="/faculty-survey" element={<FacultySurvey />} />
                      
                      {/* Admin-only routes */}
                      <Route path="/admin/input" element={<AdminRoute><AdminInput /></AdminRoute>} />
                      <Route path="/admin/surveys" element={<AdminRoute><AdminSurveyManagement /></AdminRoute>} />
                      
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
