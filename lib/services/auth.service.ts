import 'server-only';
import type { Session } from '@supabase/supabase-js';

interface SignUpData {
  email: string;
  password: string;
  name: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    name: string | null;
  } | null;
  session: Session | null;
}

interface AuthError {
  error: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async signUp(data: SignUpData): Promise<AuthResponse | AuthError> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Signup failed' };
      }

      return result;
    } catch (error) {
      console.error('AuthService.signUp error:', error);
      return { error: 'Network error' };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData): Promise<AuthResponse | AuthError> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Signin failed' };
      }

      return result;
    } catch (error) {
      console.error('AuthService.signIn error:', error);
      return { error: 'Network error' };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ message: string } | AuthError> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/signout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Signout failed' };
      }

      return result;
    } catch (error) {
      console.error('AuthService.signOut error:', error);
      return { error: 'Network error' };
    }
  }

  /**
   * Get the current user
   */
  static async getCurrentUser(): Promise<AuthResponse | AuthError> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Failed to get user' };
      }

      return result;
    } catch (error) {
      console.error('AuthService.getCurrentUser error:', error);
      return { error: 'Network error' };
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    valid: boolean;
    error?: string;
  } {
    if (password.length < 8) {
      return {
        valid: false,
        error: 'Password must be at least 8 characters long',
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one uppercase letter',
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one lowercase letter',
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one number',
      };
    }

    return { valid: true };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
  }
}
