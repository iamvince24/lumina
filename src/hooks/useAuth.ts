'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

/**
 * Custom hook for managing authentication state
 * Synchronizes with Supabase Auth and Zustand store
 */
export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(true);
  const { user, setUser, logout } = useAuthStore();
  const supabase = createClient();

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email ?? null,
          name: session.user.user_metadata.name ?? null,
        };
        setUser(authUser, session.access_token);
      } else {
        logout();
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email ?? null,
          name: session.user.user_metadata.name ?? null,
        };
        setUser(authUser, session.access_token);
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, logout]);

  /**
   * Sign in with email and password
   */
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email ?? null,
          name: data.user.user_metadata.name ?? null,
        };
        setUser(authUser, data.session?.access_token ?? '');
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  /**
   * Sign up with email, password, and name
   */
  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email ?? null,
          name: data.user.user_metadata.name ?? null,
        };
        setUser(authUser, data.session?.access_token ?? '');
      }

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}

/**
 * Hook for sign in functionality
 */
export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const execute = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
  };

  return { execute, loading, error };
}

/**
 * Hook for sign up functionality
 */
export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();

  const execute = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    const result = await signUp(email, password, name);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
  };

  return { execute, loading, error };
}

/**
 * Hook for sign out functionality
 */
export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();

  const execute = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  return { execute, loading };
}
