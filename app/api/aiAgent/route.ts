import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_ID = 293628284;
const SERVER_SECRET = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "7ef5ad0e5bb3b97fb13ff842d1122837";

// Generate signature for Zego API calls
function generateSignature(appId: number, serverSecret: string, timestamp: number): string {
  const message = `${appId}${timestamp}`;
  return crypto.createHmac('sha256', serverSecret).update(message).digest('hex');
}

// Register AI Agent for digital human (fallback implementation)
async function registerAIAgent(roomId: string, digitalHumanId: string, companionId: string) {
  // Map companion IDs to their personalities and capabilities
  const companionConfigs: { [key: string]: { name: string; personality: string; expertise: string; greeting: string } } = {
    'companion-1-luna': {
      name: 'Luna',
      personality: 'calm and knowledgeable',
      expertise: 'mindfulness and history',
      greeting: 'Hello! I\'m Luna, your mindful AI companion. I specialize in meditation, history, and helping you find inner peace. How can I assist you today?'
    },
    'companion-2-rex': {
      name: 'Rex',
      personality: 'energetic and motivating',
      expertise: 'fitness and health',
      greeting: 'Hey there! I\'m Rex, your fitness coach AI! I\'m here to motivate you, guide your workouts, and help you achieve your health goals. Let\'s get moving!'
    },
    'companion-3-nova': {
      name: 'Nova',
      personality: 'futuristic and tech-savvy',
      expertise: 'technology and coding',
      greeting: 'Greetings! I\'m Nova, your tech expert AI companion. I can help with coding, technology questions, and futuristic innovations. What would you like to explore?'
    }
  };

  const config = companionConfigs[companionId] || companionConfigs['companion-1-luna'];

  // For now, return a mock response since ZEGOCLOUD AI Agent API is not accessible
  // This will be replaced when the service is properly activated
  console.log(`Creating fallback AI agent for ${config.name} in room ${roomId}`);
  
  return {
    agentId: `agent_${companionId}_${Date.now()}`,
    instanceId: `instance_${companionId}_${roomId}_${Date.now()}`,
    config: config,
    status: 'fallback_mode',
    message: 'AI agent created in fallback mode - ZEGOCLOUD AI Agent service not activated'
  };
}

// Handle AI agent interactions using study-focused AI model
async function handleAIInteraction(roomId: string, digitalHumanId: string, message: string, userId: string, companionId: string) {
  try {
    // Call our study-focused AI model API
    const response = await fetch('/api/studyAI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        threadId: userId,
        companionId: companionId,
        roomId: roomId
      }),
    });

    if (!response.ok) {
      throw new Error(`Study AI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      response: data.response,
      status: 'success',
      thread_id: data.threadId,
      companion_id: data.companionId,
      companion_name: data.companionName,
      subject: data.subject,
      model: data.model
    };

  } catch (error) {
    console.error('Error calling study AI API:', error);
    
    // Fallback to simple study responses
    console.log(`Using fallback study response for: "${message}" from user ${userId} in room ${roomId}`);
    
    let response = "I received your message! ";
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      response += "Hello! What do you want to study today?";
    } else if (message.toLowerCase().includes('help')) {
      response += "I'm here to help you learn! What subject would you like to explore?";
    } else if (message.toLowerCase().includes('thank')) {
      response += "You're welcome! I'm here to help you succeed in your studies. What else would you like to learn?";
    } else {
      response += "That's interesting! Let's explore this topic together. What would you like to know more about?";
    }
    
    return {
      response: response,
      status: 'fallback_mode',
      message: 'Study AI interaction processed in fallback mode'
    };
  }
}

// POST endpoint to register AI agent
export async function POST(request: NextRequest) {
  try {
    const { action, roomId, digitalHumanId, companionId, message, userId } = await request.json();

    if (action === 'register') {
      if (!roomId || !digitalHumanId || !companionId) {
        return NextResponse.json(
          { error: 'Missing required parameters for registration: roomId, digitalHumanId, companionId' },
          { status: 400 }
        );
      }

      const result = await registerAIAgent(roomId, digitalHumanId, companionId);
      return NextResponse.json({
        success: true,
        message: 'AI agent registered successfully',
        data: result
      });

    } else if (action === 'interact') {
      if (!roomId || !digitalHumanId || !message || !userId) {
        return NextResponse.json(
          { error: 'Missing required parameters for interaction: roomId, digitalHumanId, message, userId' },
          { status: 400 }
        );
      }

      const result = await handleAIInteraction(roomId, digitalHumanId, message, userId, companionId);
      return NextResponse.json({
        success: true,
        message: 'AI interaction processed',
        data: result
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "register" or "interact"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in AI agent API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI agent request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
