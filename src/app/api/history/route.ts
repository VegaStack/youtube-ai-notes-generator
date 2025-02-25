import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { verifyAuth } from '@/lib/auth';

export const runtime = 'edge';

// GET /api/history?page=1&limit=10
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Parse pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' }, 
        { status: 400 }
      );
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get total count for pagination
    const countResult = await db.select({ count: sql`count(*)` })
      .from(notes)
      .where(eq(notes.userId, auth.id));
    
    const totalCount = Number(countResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    // Get user's history
    const userHistory = await db.query.notes.findMany({
      where: eq(notes.userId, auth.id),
      orderBy: [desc(notes.updatedAt)],
      offset,
      limit,
    });
    
    return NextResponse.json({
      items: userHistory,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' }, 
      { status: 500 }
    );
  }
}