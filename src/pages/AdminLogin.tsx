import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AdminLogin = () => {
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
      
      // Check if user has admin role
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth user:', user);
      
      if (user) {
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('Database user:', dbUser);
        console.log('Database error:', error);
        console.log('Error message:', error?.message);
        console.log('Error code:', error?.code);
        console.log('Error details:', error?.details);
        console.log('User role:', dbUser?.role);
        console.log('Role type:', typeof dbUser?.role);
        
        if (error || !dbUser || dbUser.role !== 'admin') {
          // Not an admin - sign them out
          await signOut();
          toast({
            title: 'Access Denied',
            description: `This login page is for administrators only. Found role: ${dbUser?.role || 'none'}`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }
      
      toast({
        title: 'Admin access granted',
        description: 'You have successfully logged in.',
      });
      
      // Use full page navigation to ensure auth context updates
      window.location.href = '/admin/input';
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Invalid email or password';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid admin credentials. Please check your email and password.';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200">
      <Card className="w-full max-w-md border-slate-300">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-slate-700" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Access administrative dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@university.edu"
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
            <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800" disabled={loading}>
              {loading ? 'Signing in...' : 'Admin Sign In'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Link to="/student/login" className="text-gray-600 hover:underline">
              Student Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
