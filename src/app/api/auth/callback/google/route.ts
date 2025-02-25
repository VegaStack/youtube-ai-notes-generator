// src/app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { signAuth } from '@/lib/auth';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect('/');
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${url.origin}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed');
      return NextResponse.redirect('/');
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    if (!userInfoResponse.ok) {
      console.error('Failed to fetch user info');
      return NextResponse.redirect('/');
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Try to find or create user
    try {
      let userId;
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, userInfo.email),
      });
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
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
    } catch (error) {
      console.error('Error with user management:', error);
    }
    
    // Always redirect to home page regardless of success/failure
    return NextResponse.redirect('/');
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect('/');
  }
}