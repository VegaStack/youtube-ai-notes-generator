import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Start OAuth Flow
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get('callbackUrl') || '/';
  const requestOrigin = url.origin;
  
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  
  // Build the redirect URI from the current request origin
  const redirectUri = `${requestOrigin}/api/auth/callback/google`;
  
  // Create the full Google OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'profile email');
  authUrl.searchParams.set('prompt', 'select_account');
  
  const fullAuthUrl = authUrl.toString();
  
  // Store the callback URL in a cookie
  const response = NextResponse.redirect(fullAuthUrl);
  
  // Set the cookie with callback URL
  response.cookies.set('callbackUrl', callbackUrl, {
    path: '/',
    maxAge: 60 * 10, // 10 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  return response;
}