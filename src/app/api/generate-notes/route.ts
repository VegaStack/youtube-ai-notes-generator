import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Update edge runtime configuration
export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // Optional: in case you need to override
});

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();
    
    if (!transcript) {
      return new NextResponse(
        JSON.stringify({ error: 'Transcript is required' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    const prompt = process.env.SUMMARY_PROMPT || 'Create structured notes from this transcript:';
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert note-taker who creates clear, organized, comprehensive notes from video transcripts.'
        },
        { 
          role: 'user', 
          content: `${prompt}\n\n${transcript}`
        }
      ],
      temperature: 0.3,
    });

    return new NextResponse(
      JSON.stringify({
        notes: response.choices[0]?.message?.content || 'Failed to generate notes.'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error generating notes:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate notes' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}