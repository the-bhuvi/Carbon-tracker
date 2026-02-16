import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, GraduationCap, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-100 via-blue-50 to-green-50 relative">
      {/* Admin Login Icon - Top Right */}
      <Link 
        to="/admin/login" 
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white rounded-lg shadow-sm hover:shadow-md transition-all group"
      >
        <ShieldCheck className="h-5 w-5 text-slate-700 group-hover:text-slate-900" />
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Admin</span>
      </Link>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Leaf className="h-20 w-20 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Carbon Tracker</h1>
          <p className="text-lg text-gray-600">Track and reduce your carbon footprint</p>
        </div>

        {/* Student Card - Centered */}
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <GraduationCap className="h-20 w-20 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Welcome Students!</CardTitle>
            <CardDescription className="text-base">Track your carbon footprint and contribute to a sustainable campus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/student/login" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Login
              </Button>
            </Link>
            <Link to="/student/signup" className="block">
              <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50" size="lg">
                Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Join the movement towards a sustainable campus</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
