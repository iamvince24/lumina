// lib/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../supabase/server';
import { User } from '@supabase/supabase-js';

type AuthenticatedContext = {
  params: Record<string, string>;
  user: User; // 注入 User 物件
};

type AuthenticatedHandler = (
  req: NextRequest,
  context: AuthenticatedContext
) => Promise<Response>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const supabase = await createClient();

      // 驗證 User Session
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }

      // Next.js 15: params 是 Promise，需要 await
      const params = await context.params;

      // 驗證通過，將 user 注入並執行原本的 handler
      return await handler(req, { params, user });
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }
  };
}
