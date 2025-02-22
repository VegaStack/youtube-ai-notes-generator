import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { transcript } = await request.json();
    
    if (!transcript) {
      return new NextResponse(
        JSON.stringify({ error: 'Transcript is required' }), 
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
          }
        }
      );
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    const prompt = process.env.SUMMARY_PROMPT || 'Create structured notes from this transcript:';
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      throw new Error(error.error?.message || `OpenAI API error: ${openaiResponse.statusText}`);
    }

    const result = await openaiResponse.json();

    if (!result.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    return new NextResponse(
      JSON.stringify({
        notes: result.choices[0].message.content
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
      }
    );
  } catch (error) {
    console.error('Error generating notes:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate notes',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
      }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}