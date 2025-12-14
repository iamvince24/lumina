import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

/**
 * Authentication context passed to protected route handlers
 */
export interface AuthContext {
  user: User;
  params?: Record<string, string>;
}

/**
 * Type for protected route handler function
 */
type ProtectedRouteHandler = (
  req: NextRequest,
  context: AuthContext & { params?: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps API route handlers with authentication
 *
 * Usage:
 * export const GET = withAuth(async (req, { user }) => {
 *   // user is guaranteed to be authenticated
 *   return NextResponse.json({ data: ... });
 * });
 */
export function withAuth(handler: ProtectedRouteHandler) {
  return async (
    req: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized', success: false },
          { status: 401 }
        );
      }

      // Resolve params if they exist (Next.js 15 async params)
      const resolvedParams = context?.params ? await context.params : undefined;

      return handler(req, { user, params: resolvedParams });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error', success: false },
        { status: 500 }
      );
    }
  };
}
