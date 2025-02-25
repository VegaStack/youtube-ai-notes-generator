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

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/error?error=NoCodeProvided`);
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user info with access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user information');
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Check if user exists in database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, userInfo.email),
    });
    
    let userId;
    
    if (existingUser) {
      // Update existing user
      userId = existingUser.id;
      await db.update(users).set({
        name: userInfo.name,
        image: userInfo.picture,
      }).where(eq(users.id, existingUser.id));
    } else {
      // Create new user
      const newUser = await db.insert(users).values({
        id: createId(),
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.picture,
        emailVerified: new Date(),
      }).returning({ id: users.id });
      
      userId = newUser[0].id;
    }
    
    // Create auth session
    await signAuth({
      id: userId,
      name: userInfo.name,
      email: userInfo.email,
      image: userInfo.picture,
    });
    
    // Get the original callback URL
    const callbackUrl = request.cookies.get('callbackUrl')?.value || '/';
    
    // Redirect back to the application
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${callbackUrl}`);
    
    // Clear the callback URL cookie
    response.cookies.delete('callbackUrl');
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/error?error=AuthError`);
  }
}