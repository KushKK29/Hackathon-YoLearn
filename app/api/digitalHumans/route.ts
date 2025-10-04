import { NextResponse } from 'next/server';
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

// Get available timbres (voices) for digital humans
async function getTimbreList() {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(APP_ID, SERVER_SECRET, timestamp);

  try {
    const response = await fetch('https://aie-api.zegocloud.com/v1/getTimbreList', {
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
    console.error('Error fetching timbre list:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Fetch both digital humans and timbres
    const [digitalHumans, timbres] = await Promise.all([
      getDigitalHumanList(),
      getTimbreList()
    ]);

    return NextResponse.json({
      success: true,
      digitalHumans: digitalHumans?.DigitalHumanList || [],
      timbres: timbres?.TimbreList || [],
      // Provide some default mappings for our companions
      companionMappings: {
        'companion-1-luna': {
          digitalHumanId: 'dh_luna_01',
          name: 'Luna',
          description: 'A calm and knowledgeable AI specializing in mindfulness and history.'
        },
        'companion-2-rex': {
          digitalHumanId: 'dh_rex_01', 
          name: 'Rex',
          description: 'An energetic and motivating fitness coach AI to guide your workouts.'
        },
        'companion-3-nova': {
          digitalHumanId: 'dh_nova_01',
          name: 'Nova', 
          description: 'A futuristic tech expert and coding assistant AI.'
        }
      }
    });

  } catch (error) {
    console.error('Error in digitalHumans API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch digital human data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

