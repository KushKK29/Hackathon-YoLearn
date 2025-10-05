import { NextRequest, NextResponse } from 'next/server';

const DID_API_KEY = process.env.DID_API_KEY || 'your_did_api_key_here';
const DID_API_URL = 'https://api.d-id.com';

// Create D-ID talk (generate avatar video)
export async function POST(request: NextRequest) {
  try {
    const { text, avatarUrl, voice } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for D-ID talk generation' },
        { status: 400 }
      );
    }

    // Default avatar if not provided
    const defaultAvatar = avatarUrl || 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg';
    
    // Default voice settings
    const voiceSettings = voice || {
      type: 'microsoft',
      voice: 'en-US-AriaNeural' // Female voice for study companion
    };

    const response = await fetch(`${DID_API_URL}/talks`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
      },
      body: JSON.stringify({
        source_url: defaultAvatar,
        script: {
          type: 'text',
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-AriaNeural'
          },
          input: text
        },
        config: {
          result_format: 'mp4',
          persist: true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`D-ID API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      talkId: data.id,
      status: data.status,
      message: 'D-ID talk created successfully'
    });

  } catch (error) {
    console.error('Error creating D-ID talk:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create D-ID talk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get D-ID talk result (check status and get video URL)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const talkId = searchParams.get('talkId');

    if (!talkId) {
      return NextResponse.json(
        { error: 'Talk ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${DID_API_URL}/talks/${talkId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`D-ID API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      talkId: data.id,
      status: data.status,
      resultUrl: data.result_url,
      message: data.status === 'done' ? 'Video ready' : 'Video processing'
    });

  } catch (error) {
    console.error('Error getting D-ID talk result:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get D-ID talk result',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

