import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const user = await verifyAuth();
  
  if (user) {
    return NextResponse.json({ user });
  }
  
  return NextResponse.json({ user: null });
}