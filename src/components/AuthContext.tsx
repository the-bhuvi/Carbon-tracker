import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { auth } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useSupabase';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'student' | 'faculty' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { name: string; role: 'student' | 'admin'; department_id?: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: dbUser } = useCurrentUser();

  useEffect(() => {
    // Check active session
    auth.getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user } = await auth.signIn(email, password);
    setUser(user);
  };

  const signUp = async (email: string, password: string, metadata?: { name: string; role: 'student' | 'admin'; department_id?: string }) => {
    const { user } = await auth.signUp(email, password, metadata);
    setUser(user);
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  const userRole = dbUser?.role || null;

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
