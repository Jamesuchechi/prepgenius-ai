import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const { pathname } = request.nextUrl

  // Protected routes - require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard')

  // Auth routes - redirect to dashboard if already authenticated
  const isAuthRoute = pathname === '/signin' || pathname === '/signup'

  if (isProtectedRoute && !token) {
    // Redirect to signin if trying to access protected route without token
    const url = new URL('/signin', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && token) {
    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup']
}