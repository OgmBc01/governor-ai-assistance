import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  // Check if accessing admin routes without token
  if (isAdminRoute && !token && request.nextUrl.pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Check if accessing login page with token
  if (request.nextUrl.pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};