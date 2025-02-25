import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

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

// Verify JWT token with enhanced error handling
export async function verifyAuth() {
  try {
    const token = cookies().get('auth-token')?.value;
    
    if (!token) return null;
    
    try {
      const verified = await jwtVerify(token, getJwtSecretKey());
      return verified.payload as AuthUser;
    } catch (error) {
      console.error('JWT verification error:', error);
      // If token verification fails, clear the invalid token
      cookies().delete('auth-token');
      return null;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Create a session (sign JWT)
export async function signAuth(user: AuthUser) {
  try {
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
  } catch (error) {
    console.error('Error signing auth token:', error);
    throw error;
  }
}

// Sign out user
export function signOut() {
  cookies().delete('auth-token');
}