import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      
      // Check if user has student or faculty role (not admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error || !dbUser) {
          await signOut();
          toast({
            title: 'Login Error',
            description: 'Unable to verify user account. Please contact support.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        if (dbUser.role === 'admin') {
          // Admin trying to use student login - sign them out
          await signOut();
          toast({
            title: 'Access Denied',
            description: 'Administrators must use the admin login. Click the admin icon in the top-right corner.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/student-survey');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Invalid email or password';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before logging in.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Student Login</CardTitle>
          <CardDescription>Sign in to your student account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@student.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/student/signup" className="text-green-600 hover:underline font-medium">
              Sign up here
            </Link>
          </div>
          
          <div className="mt-2 text-center text-sm">
            <Link to="/admin/login" className="text-gray-600 hover:underline">
              Login as Admin
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;
