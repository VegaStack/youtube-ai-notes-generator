import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  signOut();
  
  return NextResponse.json({ success: true });
}