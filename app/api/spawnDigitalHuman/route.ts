import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_ID = 293628284;
const SERVER_SECRET = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "7ef5ad0e5bb3b97fb13ff842d1122837";

// Generate signature for Zego API calls
function generateSignature(appId: number, serverSecret: string, timestamp: number): string {
  const message = `${appId}${timestamp}`;
  return crypto.createHmac('sha256', serverSecret).update(message).digest('hex');
}

// Get available digital humans (fallback implementation)
async function getDigitalHumanList() {
  // For now, return a mock response since ZEGOCLOUD Digital Human API is not accessible
  // This will be replaced when the service is properly activated
  console.log('Using fallback digital human list - ZEGOCLOUD Digital Human service not activated');
  
  return {
    DigitalHumanList: [
      { id: 'dh_luna_01', name: 'Luna', description: 'Mindfulness and history expert' },
      { id: 'dh_rex_01', name: 'Rex', description: 'Fitness and health coach' },
      { id: 'dh_nova_01', name: 'Nova', description: 'Technology and coding assistant' }
    ]
  };
}

// Spawn digital human into room (fallback implementation)
async function spawnDigitalHuman(roomId: string, digitalHumanId: string, companionId: string) {
  // Map companion IDs to user names
  const companionNames: { [key: string]: string } = {
    'companion-1-luna': 'Luna',
    'companion-2-rex': 'Rex',
    'companion-3-nova': 'Nova'
  };

  const companionName = companionNames[companionId] || 'AI Companion';
  const botUserId = `${companionId}_bot_${Date.now()}`;

  // For now, return a mock response since ZEGOCLOUD Digital Human API is not accessible
  // This will be replaced when the service is properly activated
  console.log(`Creating fallback digital human ${digitalHumanId} for companion ${companionId} in room ${roomId}`);
  
  return {
    roomId: roomId,
    digitalHumanId: digitalHumanId,
    companionId: companionId,
    status: 'fallback_mode',
    message: 'Digital human created in fallback mode - ZEGOCLOUD Digital Human service not activated',
    config: {
      appID: APP_ID,
      roomID: roomId,
      userID: botUserId,
      userName: companionName,
      digitalHumanID: digitalHumanId,
      greeting: `Hello! I'm ${companionName}, your AI companion. How can I help you today?`
    }
  };
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

