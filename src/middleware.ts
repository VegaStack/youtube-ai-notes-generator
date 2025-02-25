import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from './lib/auth';

// This configuration defines which paths this middleware will run on
export const config = {
  matcher: [
    '/api/notes/:path*',
    '/api/history/:path*',
    // Add any other protected paths here
  ],
};

export default async function middleware(request: NextRequest) {
  // Only check authentication for API routes that need protection
  if (request.nextUrl.pathname.startsWith('/api/notes') || 
      request.nextUrl.pathname.startsWith('/api/history')) {
    
    // Skip the OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
      return NextResponse.next();
    }
    
    // Verify authentication
    const user = await verifyAuth();
    
    if (!user) {
      // Return 401 for API routes when not authenticated
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  // Continue to the requested route
  return NextResponse.next();
}