import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { verifyAuth } from '@/lib/auth';
import { createId } from '@paralleldrive/cuid2';

export const runtime = 'edge';

// GET /api/notes?videoId=xxx
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId parameter is required' }, 
        { status: 400 }
      );
    }
    
    const userNotes = await db.query.notes.findFirst({
      where: and(
        eq(notes.userId, auth.id),
        eq(notes.videoId, videoId)
      ),
    });
    
    if (!userNotes) {
      return NextResponse.json(
        { error: 'Not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(userNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' }, 
      { status: 500 }
    );
  }
}

// POST /api/notes
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { videoId, title, channelTitle, transcript, notesContent } = body;
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' }, 
        { status: 400 }
      );
    }
    
    // Check if a note already exists for this user and video
    const existingNote = await db.query.notes.findFirst({
      where: and(
        eq(notes.userId, auth.id),
        eq(notes.videoId, videoId)
      ),
    });
    
    let result;
    
    if (existingNote) {
      // Update existing note
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      // Only update fields that are provided
      if (title) updateData.title = title;
      if (channelTitle) updateData.channelTitle = channelTitle;
      if (transcript) updateData.transcript = transcript;
      if (notesContent) updateData.notesContent = notesContent;
      
      result = await db
        .update(notes)
        .set(updateData)
        .where(
          and(
            eq(notes.userId, auth.id),
            eq(notes.videoId, videoId)
          )
        )
        .returning();
      
      return NextResponse.json(result[0]);
    } else {
      // Create new note
      result = await db
        .insert(notes)
        .values({
          id: createId(),
          videoId,
          userId: auth.id,
          title,
          channelTitle,
          transcript,
          notesContent,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      return NextResponse.json(result[0], { status: 201 });
    }
  } catch (error) {
    console.error('Error saving notes:', error);
    return NextResponse.json(
      { error: 'Failed to save notes' }, 
      { status: 500 }
    );
  }
}