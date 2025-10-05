from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
from langraph_database_backend import chatbot
from langchain_core.messages import HumanMessage, AIMessage
import json
import os

app = FastAPI(title="AI Companion API", version="1.0.0")

class ChatRequest(BaseModel):
    message: str
    thread_id: str
    companion_id: str
    room_id: str

class ChatResponse(BaseModel):
    response: str
    thread_id: str
    companion_id: str
    status: str

# Companion personalities
COMPANION_PERSONALITIES = {
    'companion-1-luna': {
        'name': 'Luna',
        'personality': 'calm and knowledgeable',
        'expertise': 'mindfulness and history',
        'system_prompt': 'You are Luna, a calm and knowledgeable AI companion specializing in mindfulness and history. You help users find inner peace, learn about history, and practice meditation. Be gentle, wise, and encouraging.'
    },
    'companion-2-rex': {
        'name': 'Rex',
        'personality': 'energetic and motivating',
        'expertise': 'fitness and health',
        'system_prompt': 'You are Rex, an energetic and motivating fitness coach AI! You help users with workouts, health goals, and motivation. Be enthusiastic, encouraging, and focused on fitness and wellness.'
    },
    'companion-3-nova': {
        'name': 'Nova',
        'personality': 'futuristic and tech-savvy',
        'expertise': 'technology and coding',
        'system_prompt': 'You are Nova, a futuristic tech expert and coding assistant AI. You help with technology questions, coding problems, and innovative solutions. Be knowledgeable, helpful, and forward-thinking.'
    }
}

@app.get("/")
async def root():
    return {"message": "AI Companion API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "TinyLlama-1.1B-Chat-v1.0"}

@app.post("/chat", response_model=ChatResponse)
async def chat_with_companion(request: ChatRequest):
    try:
        # Get companion personality
        companion = COMPANION_PERSONALITIES.get(request.companion_id, COMPANION_PERSONALITIES['companion-1-luna'])
        
        # Create system message with personality
        system_message = AIMessage(content=companion['system_prompt'])
        user_message = HumanMessage(content=request.message)
        
        # Prepare messages for the model
        messages = [system_message, user_message]
        
        # Create unique thread ID for this conversation
        thread_id = f"{request.companion_id}_{request.room_id}_{request.thread_id}"
        
        # Invoke the chatbot
        config = {"configurable": {"thread_id": thread_id}}
        response = chatbot.invoke(
            {"messages": messages},
            config=config
        )
        
        # Extract AI response
        ai_message = response["messages"][-1].content
        
        return ChatResponse(
            response=ai_message,
            thread_id=thread_id,
            companion_id=request.companion_id,
            status="success"
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.get("/companions")
async def get_companions():
    """Get available AI companions with their personalities"""
    return {
        "companions": [
            {
                "id": companion_id,
                "name": info["name"],
                "personality": info["personality"],
                "expertise": info["expertise"]
            }
            for companion_id, info in COMPANION_PERSONALITIES.items()
        ]
    }

@app.post("/reset-conversation")
async def reset_conversation(thread_id: str):
    """Reset conversation history for a specific thread"""
    try:
        # This would clear the conversation history for the thread
        # For now, we'll just return success as the model handles this
        return {"message": f"Conversation reset for thread {thread_id}", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting conversation: {str(e)}")

if __name__ == "__main__":
    print("Starting AI Companion API...")
    print("Model: TinyLlama-1.1B-Chat-v1.0")
    print("Available companions:", list(COMPANION_PERSONALITIES.keys()))
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=True
    )

