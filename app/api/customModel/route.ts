import { NextRequest, NextResponse } from 'next/server';

// Companion personalities with enhanced prompts
const COMPANION_PERSONALITIES = {
  'companion-1-luna': {
    name: 'Luna',
    personality: 'calm and knowledgeable',
    expertise: 'mindfulness and history',
    systemPrompt: 'You are Luna, a calm and knowledgeable AI companion specializing in mindfulness and history. You help users find inner peace, learn about history, and practice meditation. Be gentle, wise, and encouraging. Keep responses concise but meaningful.',
    responses: {
      greeting: "Hello! I'm Luna, your mindful AI companion. I specialize in meditation, history, and helping you find inner peace. How can I assist you today?",
      topics: ['meditation', 'mindfulness', 'history', 'peace', 'calm', 'breathing', 'zen', 'wisdom']
    }
  },
  'companion-2-rex': {
    name: 'Rex',
    personality: 'energetic and motivating',
    expertise: 'fitness and health',
    systemPrompt: 'You are Rex, an energetic and motivating fitness coach AI! You help users with workouts, health goals, and motivation. Be enthusiastic, encouraging, and focused on fitness and wellness. Keep responses energetic and motivating.',
    responses: {
      greeting: "Hey there! I'm Rex, your fitness coach AI! I'm here to motivate you, guide your workouts, and help you achieve your health goals. Let's get moving!",
      topics: ['fitness', 'workout', 'exercise', 'health', 'motivation', 'strength', 'cardio', 'nutrition', 'gym']
    }
  },
  'companion-3-nova': {
    name: 'Nova',
    personality: 'futuristic and tech-savvy',
    expertise: 'technology and coding',
    systemPrompt: 'You are Nova, a futuristic tech expert and coding assistant AI. You help with technology questions, coding problems, and innovative solutions. Be knowledgeable, helpful, and forward-thinking. Keep responses technical but accessible.',
    responses: {
      greeting: "Greetings! I'm Nova, your tech expert AI companion. I can help with coding, technology questions, and futuristic innovations. What would you like to explore?",
      topics: ['coding', 'programming', 'technology', 'ai', 'machine learning', 'software', 'development', 'innovation', 'future']
    }
  }
};

// Simple AI response generator (simulates your LangGraph model)
function generateAIResponse(message: string, companionId: string, conversationHistory: string[] = []): string {
  const companion = COMPANION_PERSONALITIES[companionId as keyof typeof COMPANION_PERSONALITIES] || COMPANION_PERSONALITIES['companion-1-luna'];
  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses based on message content and companion expertise
  let response = "";
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    response = `Hello! I'm ${companion.name}. ${companion.responses.greeting}`;
  }
  // Help requests
  else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
    response = `I'm here to help! As ${companion.name}, I specialize in ${companion.expertise}. What specific area would you like guidance with?`;
  }
  // Thank you responses
  else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    response = `You're very welcome! I'm always here to help you with ${companion.expertise}. Is there anything else you'd like to explore?`;
  }
  // Topic-specific responses based on companion expertise
  else if (companion.responses.topics.some(topic => lowerMessage.includes(topic))) {
    if (companionId === 'companion-1-luna') {
      response = generateLunaResponse(lowerMessage);
    } else if (companionId === 'companion-2-rex') {
      response = generateRexResponse(lowerMessage);
    } else if (companionId === 'companion-3-nova') {
      response = generateNovaResponse(lowerMessage);
    }
  }
  // General responses
  else {
    response = generateGeneralResponse(message, companion);
  }
  
  return response;
}

// Luna-specific responses (mindfulness and history)
function generateLunaResponse(message: string): string {
  if (message.includes('meditation') || message.includes('mindful')) {
    return "Meditation is a beautiful practice for finding inner peace. Try starting with just 5 minutes of focused breathing. Find a quiet space, close your eyes, and simply observe your breath without judgment. Would you like me to guide you through a simple meditation technique?";
  } else if (message.includes('history')) {
    return "History is full of wisdom and lessons! I find that understanding our past helps us navigate the present with more clarity. Is there a particular historical period or event that interests you?";
  } else if (message.includes('stress') || message.includes('anxious')) {
    return "I understand that feeling. When stress arises, remember to breathe deeply and ground yourself in the present moment. Sometimes, just acknowledging our feelings with compassion can bring relief. Would you like to try a simple breathing exercise?";
  } else {
    return "That's a thoughtful question. In my experience with mindfulness and history, I find that taking a moment to reflect often reveals the answers we seek. What's on your mind?";
  }
}

// Rex-specific responses (fitness and health)
function generateRexResponse(message: string): string {
  if (message.includes('workout') || message.includes('exercise')) {
    return "Great question! The best workout is the one you'll actually do consistently. Start with something you enjoy - whether it's walking, dancing, or lifting weights. Remember, consistency beats perfection every time! What type of activity interests you?";
  } else if (message.includes('motivation') || message.includes('motivated')) {
    return "I love your energy! Motivation comes and goes, but discipline is what keeps us moving forward. Set small, achievable goals and celebrate every win, no matter how small. You've got this! What's your current fitness goal?";
  } else if (message.includes('health') || message.includes('nutrition')) {
    return "Health is about balance and consistency! Focus on whole foods, stay hydrated, and listen to your body. Remember, it's not about perfection - it's about progress. What aspect of your health would you like to improve?";
  } else {
    return "That's awesome that you're thinking about your health and fitness! Every step forward counts. What's your current fitness journey looking like?";
  }
}

// Nova-specific responses (technology and coding)
function generateNovaResponse(message: string): string {
  if (message.includes('coding') || message.includes('programming')) {
    return "Coding is like building with digital LEGO blocks! Start with the fundamentals - pick one language and master the basics. Practice regularly, build projects, and don't be afraid to make mistakes. They're just learning opportunities! What programming language interests you?";
  } else if (message.includes('ai') || message.includes('machine learning')) {
    return "AI is fascinating! We're living in an exciting time where artificial intelligence is transforming how we work and live. The key is understanding that AI is a tool to augment human creativity, not replace it. What aspect of AI intrigues you most?";
  } else if (message.includes('technology') || message.includes('tech')) {
    return "Technology is constantly evolving, and that's what makes it so exciting! The best approach is to stay curious, keep learning, and don't be afraid to experiment. What technology trend are you most excited about?";
  } else {
    return "That's a great question about technology! I love how tech can solve real-world problems and create new possibilities. What specific area of technology would you like to explore together?";
  }
}

// General response generator
function generateGeneralResponse(message: string, companion: { name: string; expertise: string }): string {
  const responses = [
    `That's interesting! As ${companion.name}, I'd love to help you explore that further. What specific aspect would you like to dive into?`,
    `I appreciate you sharing that with me. From my perspective on ${companion.expertise}, I think there might be some valuable insights we can explore together.`,
    `That's a thoughtful question! ${companion.name} here, and I'm always excited to help with topics related to ${companion.expertise}. What would you like to know more about?`,
    `I find that fascinating! In my experience with ${companion.expertise}, I've learned that every question opens up new possibilities. What's your take on this?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// In-memory conversation storage (in production, use a database)
const conversations = new Map<string, string[]>();

export async function POST(request: NextRequest) {
  try {
    const { message, companionId, threadId, roomId } = await request.json();

    if (!message || !companionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: message, companionId' },
        { status: 400 }
      );
    }

    // Get or create conversation history
    const conversationKey = `${companionId}_${roomId}_${threadId}`;
    const conversationHistory = conversations.get(conversationKey) || [];
    
    // Add user message to history
    conversationHistory.push(`User: ${message}`);
    
    // Generate AI response
    const aiResponse = generateAIResponse(message, companionId, conversationHistory);
    
    // Add AI response to history
    conversationHistory.push(`AI: ${aiResponse}`);
    
    // Store updated conversation (keep last 10 messages)
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, conversationHistory.length - 20);
    }
    conversations.set(conversationKey, conversationHistory);

    return NextResponse.json({
      response: aiResponse,
      threadId: threadId,
      companionId: companionId,
      status: 'success',
      model: 'custom-javascript-ai'
    });

  } catch (error) {
    console.error('Error in custom model API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Custom AI Model API is running!',
    status: 'healthy',
    model: 'custom-javascript-ai',
    companions: Object.keys(COMPANION_PERSONALITIES)
  });
}
