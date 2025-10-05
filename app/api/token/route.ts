import { NextRequest, NextResponse } from 'next/server';
import { generateToken04 } from './zegoServerAssistant';
import { ZEGO_CONFIG } from '../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    const { userId, roomId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    const effectiveTimeInSeconds = 3600; // 1 hour
    const payload = roomId ? JSON.stringify({ room_id: roomId }) : '';

    const token = generateToken04(
      ZEGO_CONFIG.APP_ID,
      userId,
      ZEGO_CONFIG.SERVER_SECRET,
      effectiveTimeInSeconds,
      payload
    );

    return NextResponse.json({ 
      token,
      appId: ZEGO_CONFIG.APP_ID,
      effectiveTime: effectiveTimeInSeconds
    });

  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

