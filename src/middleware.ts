/**
 * Next.js Middleware
 * 處理路由保護和認證檢查
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 需要認證的路由
 */
const protectedRoutes = [
  '/today',
  '/editor',
  '/topics',
  '/calendar',
  '/settings',
];

/**
 * 認證相關路由（已登入使用者不應訪問）
 */
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response object to handle cookie updates
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  // 如果訪問需要認證的路由，但未登入
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果訪問認證頁面，但已登入
  if (
    authRoutes.some((route) => pathname.startsWith(route)) &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/today', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由，除了：
     * - api (API 路由)
     * - _next/static (靜態檔案)
     * - _next/image (圖片優化)
     * - favicon.ico (網站圖示)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
