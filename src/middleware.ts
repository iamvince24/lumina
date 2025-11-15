/**
 * Next.js Middleware
 * 處理路由保護和認證檢查
 */

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

export function middleware(request: NextRequest) {
  // 暫時禁用認證檢查，允許直接訪問所有頁面
  // TODO: 完成應用程式功能開發後，重新啟用認證
  return NextResponse.next();

  /*
  // 原始認證邏輯（已暫時禁用）
  const { pathname } = request.nextUrl;

  // 檢查是否有認證 token（從 cookie）
  const token = request.cookies.get('lumina-auth')?.value;
  const isAuthenticated = !!token;

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

  return NextResponse.next();
  */
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
