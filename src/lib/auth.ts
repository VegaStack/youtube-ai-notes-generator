import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users } from '../lib/db/schema';
import type { User } from '../lib/db/schema';

// Types for auth
export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

// Create a secret key for JWT
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error('JWT Secret key is not defined');
  }
  return new TextEncoder().encode(secret);
};

// Verify JWT token
export async function verifyAuth() {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) return null;
  
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload as AuthUser;
  } catch (error) {
    return null;
  }
}

// Create a session (sign JWT)
export async function signAuth(user: AuthUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2w') // 2 weeks
    .sign(getJwtSecretKey());
  
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 14, // 2 weeks
    path: '/',
  });
  
  return token;
}

// Sign out user
export function signOut() {
  cookies().delete('auth-token');
}

// Get current user from database
export async function getCurrentUser(): Promise<User | null> {
  const auth = await verifyAuth();
  if (!auth?.id) return null;
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.id),
  });
  
  return user as User | null;
}