import { NextRequest, NextResponse } from 'next/server';

// Study-focused AI companion personalities
const STUDY_COMPANIONS = {
  'companion-1-luna': {
    name: 'Luna',
    subject: 'Mindfulness & History',
    personality: 'calm and wise',
    greeting: "Hello! I'm Luna, your mindfulness and history study companion. What would you like to explore today?",
    expertise: ['meditation', 'ancient history', 'philosophy', 'mindfulness', 'peace studies'],
    studyPrompts: {
      initial: "What do you want to study today? I can help you with mindfulness practices, ancient history, or philosophical concepts.",
      followUp: "That's fascinating! Let me help you dive deeper into that topic. What specific aspect would you like to explore?",
      encouragement: "Great question! I love your curiosity. Let's explore this together step by step."
    }
  },
  'companion-2-rex': {
    name: 'Rex',
    subject: 'Science & Health',
    personality: 'energetic and motivating',
    greeting: "Hey there! I'm Rex, your science and health study buddy. Ready to learn something amazing today?",
    expertise: ['biology', 'chemistry', 'physics', 'health', 'fitness', 'anatomy'],
    studyPrompts: {
      initial: "What do you want to study today? I can help you with science concepts, health topics, or any STEM subjects!",
      followUp: "Excellent choice! Science is all about discovery and understanding. What specific area interests you most?",
      encouragement: "That's a brilliant question! I'm excited to help you understand this concept better."
    }
  },
  'companion-3-nova': {
    name: 'Nova',
    subject: 'Technology & Programming',
    personality: 'futuristic and analytical',
    greeting: "Greetings! I'm Nova, your technology and programming study guide. What shall we build and learn today?",
    expertise: ['programming', 'computer science', 'AI', 'web development', 'algorithms', 'data structures'],
    studyPrompts: {
      initial: "What do you want to study today? I can help you with programming, computer science, or any tech topics!",
      followUp: "Perfect! Technology is constantly evolving, and I love exploring new concepts. What specific technology interests you?",
      encouragement: "That's an excellent question! I'm here to help you master this technology concept."
    }
  }
};

// Generate study-focused AI response
function generateStudyResponse(message: string, companionId: string, conversationHistory: string[] = []): string {
  const companion = STUDY_COMPANIONS[companionId as keyof typeof STUDY_COMPANIONS] || STUDY_COMPANIONS['companion-1-luna'];
  const lowerMessage = message.toLowerCase();
  
  // Check if this is the first interaction (greeting)
  if (conversationHistory.length === 0 || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
    return companion.studyPrompts.initial;
  }
  
  // Check for study topic mentions
  const studyTopics = companion.expertise;
  const mentionedTopics = studyTopics.filter(topic => lowerMessage.includes(topic));
  
  if (mentionedTopics.length > 0) {
    const topic = mentionedTopics[0];
    return generateTopicResponse(topic, companion, lowerMessage);
  }
  
  // Check for question patterns
  if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('?')) {
    return generateQuestionResponse(companion, lowerMessage);
  }
  
  // Check for help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('explain') || lowerMessage.includes('teach')) {
    return generateHelpResponse(companion, lowerMessage);
  }
  
  // General study encouragement
  return generateEncouragementResponse(companion, message);
}

// Generate topic-specific responses
function generateTopicResponse(topic: string, companion: { studyPrompts: { followUp: string } }, _message: string): string {
  const responses: { [key: string]: string } = {
    'meditation': "Meditation is a powerful practice for focus and clarity! Let's start with basic breathing techniques. Find a quiet space, sit comfortably, and focus on your breath for 5 minutes. What specific meditation technique interests you?",
    'history': "History is full of fascinating stories and lessons! I love exploring how past events shape our present. What historical period or event would you like to dive into?",
    'programming': "Programming is like learning a new language! Start with the basics - variables, functions, and control structures. What programming language or concept would you like to explore?",
    'science': "Science is all about asking questions and finding answers! I love how it helps us understand the world around us. What scientific concept or phenomenon interests you?",
    'health': "Health is our most valuable asset! Whether it's nutrition, exercise, or mental wellness, I'm here to help you understand how to take care of yourself. What aspect of health would you like to learn about?",
    'technology': "Technology is constantly evolving and changing our world! From AI to web development, there's always something new to learn. What technology trend or concept fascinates you?"
  };
  
  return responses[topic] || `${companion.studyPrompts.followUp} I can help you with ${topic} and related concepts.`;
}

// Generate question responses
function generateQuestionResponse(companion: { name: string; subject: string; studyPrompts: { encouragement: string } }, message: string): string {
  if (message.includes('what do you') || message.includes('what can you')) {
    return `I'm ${companion.name}, your ${companion.subject} study companion! I can help you understand complex concepts, answer questions, and guide you through your learning journey. What specific topic would you like to explore?`;
  }
  
  if (message.includes('how do i') || message.includes('how can i')) {
    return `Great question! Let me break this down into simple steps. First, let's understand the basics, then we'll build up to more complex concepts. What's your current level of knowledge on this topic?`;
  }
  
  return `${companion.studyPrompts.encouragement} Let's explore this together. What would you like to know more about?`;
}

// Generate help responses
function generateHelpResponse(companion: { subject: string }, _message: string): string {
  return `I'm here to help you succeed! As your ${companion.subject} study companion, I can explain concepts, provide examples, and guide you through practice problems. What specific topic would you like help with?`;
}

// Generate encouragement responses
function generateEncouragementResponse(companion: { subject: string }, _message: string): string {
  const encouragements = [
    `That's interesting! I love your curiosity about ${companion.subject}. Let's explore this together!`,
    `Great thinking! In ${companion.subject}, we often find that every question leads to new discoveries. What would you like to explore next?`,
    `I appreciate you sharing that! As your study companion, I'm here to help you understand and master these concepts. What specific area interests you?`,
    `That's a thoughtful perspective! ${companion.subject} is full of fascinating connections and insights. What would you like to dive deeper into?`
  ];
  
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

// In-memory conversation storage
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
    conversationHistory.push(`Student: ${message}`);
    
    // Generate AI response
    const aiResponse = generateStudyResponse(message, companionId, conversationHistory);
    
    // Add AI response to history
    conversationHistory.push(`AI: ${aiResponse}`);
    
    // Store updated conversation (keep last 20 messages)
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, conversationHistory.length - 20);
    }
    conversations.set(conversationKey, conversationHistory);

    // Get companion info for response
    const companion = STUDY_COMPANIONS[companionId as keyof typeof STUDY_COMPANIONS] || STUDY_COMPANIONS['companion-1-luna'];

    return NextResponse.json({
      response: aiResponse,
      threadId: threadId,
      companionId: companionId,
      companionName: companion.name,
      subject: companion.subject,
      status: 'success',
      model: 'study-focused-ai'
    });

  } catch (error) {
    console.error('Error in study AI API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process study message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Study AI API is running!',
    status: 'healthy',
    model: 'study-focused-ai',
    companions: Object.keys(STUDY_COMPANIONS).map(id => ({
      id,
      ...STUDY_COMPANIONS[id as keyof typeof STUDY_COMPANIONS]
    }))
  });
}
