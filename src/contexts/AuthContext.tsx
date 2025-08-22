import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  resendVerificationEmail: (email: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  verifyOtp: (email: string, token: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
}

// Create a default value for the context
const defaultAuthContext: AuthContextType = {
  session: null,
  user: null,
  loading: true,
  signUp: async () => ({ error: new Error('Not implemented'), data: null }),
  signIn: async () => ({ error: new Error('Not implemented'), data: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: new Error('Not implemented'), data: null }),
  resendVerificationEmail: async () => ({ error: new Error('Not implemented'), data: null }),
  verifyOtp: async () => ({ error: new Error('Not implemented'), data: null }),
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wrap in try-catch to prevent uncaught errors
    try {
      // Get initial session
      const initializeAuth = async () => {
        try {
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
          setUser(data.session?.user ?? null);
        } catch (error) {
          console.error('Error getting session:', error);
        } finally {
          setLoading(false);
        }
      };

      initializeAuth();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error in auth effect:', error);
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error('Error', {
          description: error.message,
        });
        return { error, data: null };
      }

      toast.success('Success', {
        description: 'Check your email for the confirmation link',
      });
      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Error', {
        description: 'An unexpected error occurred',
      });
      return { error: error as Error, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Error', {
          description: error.message,
        });
        return { error, data: null };
      }

      toast.success('Success', {
        description: 'You have been signed in',
      });
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Error', {
        description: 'An unexpected error occurred',
      });
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Success', {
        description: 'You have been signed out',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error', {
        description: 'An error occurred while signing out',
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error('Error', {
          description: error.message,
        });
        return { error, data: null };
      }

      toast.success('Success', {
        description: 'Check your email for the password reset link',
      });
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error', {
        description: 'An unexpected error occurred',
      });
      return { error: error as Error, data: null };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        toast.error('Error', {
          description: error.message,
        });
        return { error, data: null };
      }

      toast.success('Success', {
        description: 'Verification email has been sent',
      });
      return { data, error: null };
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Error', {
        description: 'An unexpected error occurred',
      });
      return { error: error as Error, data: null };
    }
  };

  // Verify OTP (one-time password) token
  const verifyOtp = async (email: string, token: string) => {
    try {
      // Verify the OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) {
        toast.error('Error', {
          description: error.message,
        });
        return { error, data: null };
      }

      // If verification is successful, the user is automatically logged in
      // Update the local state with the new session and user
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      toast.success('Success', {
        description: 'Email verified successfully. You are now logged in!',
      });
      return { data, error: null };
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Error', {
        description: 'An unexpected error occurred',
      });
      return { error: error as Error, data: null };
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerificationEmail,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
