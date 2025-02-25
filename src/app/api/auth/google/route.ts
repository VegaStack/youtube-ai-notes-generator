import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { signAuth } from '@/lib/auth';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`;

// Start OAuth Flow
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get('callbackUrl') || '/';
  
  // Store the callback URL in a cookie for later retrieval
  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=profile email&prompt=select_account`);
  
  response.cookies.set('callbackUrl', callbackUrl, {
    path: '/',
    maxAge: 60 * 10, // 10 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  return response;
}