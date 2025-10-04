import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_ID = 293628284;
const SERVER_SECRET = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "7ef5ad0e5bb3b97fb13ff842d1122837";

// Generate signature for Zego API calls
function generateSignature(appId: number, serverSecret: string, timestamp: number): string {
  const message = `${appId}${timestamp}`;
  return crypto.createHmac('sha256', serverSecret).update(message).digest('hex');
}

// Get available digital humans
async function getDigitalHumanList() {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(APP_ID, SERVER_SECRET, timestamp);

  try {
    const response = await fetch('https://aie-api.zegocloud.com/v1/getDigitalHumanList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AppID: APP_ID,
        Signature: signature,
        Timestamp: timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching digital human list:', error);
    return null;
  }
}

// Spawn digital human into room
async function spawnDigitalHuman(roomId: string, digitalHumanId: string, companionId: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(APP_ID, SERVER_SECRET, timestamp);

  // Map companion IDs to user names
  const companionNames: { [key: string]: string } = {
    'companion-1-luna': 'Luna',
    'companion-2-rex': 'Rex',
    'companion-3-nova': 'Nova'
  };

  const companionName = companionNames[companionId] || 'AI Companion';
  const botUserId = `${companionId}_bot_${Date.now()}`;

  try {
    const response = await fetch('https://aie-api.zegocloud.com/v1/startDigitalHumanLive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AppID: APP_ID,
        Signature: signature,
        Timestamp: timestamp,
        RoomID: roomId,
        DigitalHumanId: digitalHumanId,
        TimbreId: 'timbre_default', // Default voice
        UserID: botUserId,
        UserName: companionName,
        // Optional: Add text for the AI to say when joining
        Text: `Hello! I'm ${companionName}, your AI companion. How can I help you today?`
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error spawning digital human:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { roomId, digitalHumanId, companionId } = await request.json();

    if (!roomId || !digitalHumanId || !companionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: roomId, digitalHumanId, companionId' },
        { status: 400 }
      );
    }

    console.log(`Attempting to spawn digital human ${digitalHumanId} for companion ${companionId} in room ${roomId}`);

    // For now, let's return a success response to avoid breaking the video call
    // The actual digital human integration can be added later when the ZEGOCLOUD API is properly configured
    
    // TODO: Implement actual digital human spawning when ZEGOCLOUD Digital Human API is available
    console.log('Digital human feature is in development. Video call will work without AI companion for now.');

    return NextResponse.json({
      success: true,
      message: 'Digital human feature is in development',
      data: {
        roomId,
        digitalHumanId,
        companionId,
        status: 'feature_in_development'
      }
    });

    /* 
    // Uncomment this section when ZEGOCLOUD Digital Human API is properly configured
    
    // First, get the list of available digital humans to validate
    const digitalHumans = await getDigitalHumanList();
    
    if (!digitalHumans || !digitalHumans.DigitalHumanList) {
      console.warn('Could not fetch digital human list, proceeding with spawn attempt...');
    } else {
      console.log('Available digital humans:', digitalHumans.DigitalHumanList);
    }

    // Spawn the digital human
    const result = await spawnDigitalHuman(roomId, digitalHumanId, companionId);

    return NextResponse.json({
      success: true,
      message: 'Digital human spawned successfully',
      data: result
    });
    */

  } catch (error) {
    console.error('Error in spawnDigitalHuman API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to spawn digital human',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch available digital humans
export async function GET() {
  try {
    const digitalHumans = await getDigitalHumanList();
    
    if (!digitalHumans) {
      return NextResponse.json(
        { error: 'Failed to fetch digital human list' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      digitalHumans: digitalHumans.DigitalHumanList || []
    });

  } catch (error) {
    console.error('Error fetching digital humans:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch digital human list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

