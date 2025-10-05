'use client';

import React, { useState, useRef, useEffect } from 'react';

// Type declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface StudyChatInterfaceProps {
  roomId: string;
  digitalHumanId: string;
  userId: string;
  companionName: string;
  companionId: string;
  subject: string;
  isVisible: boolean;
  onToggle: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isAudio?: boolean;
}

export default function StudyChatInterface({ 
  roomId, 
  digitalHumanId: _digitalHumanId, 
  userId, 
  companionName, 
  companionId,
  subject,
  isVisible, 
  onToggle 
}: StudyChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Add initial greeting message when component mounts
  useEffect(() => {
    const greetingMessage: ChatMessage = {
      id: 'greeting',
      text: `Hello! I'm ${companionName}, your ${subject} study companion. What do you want to study today?`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
  }, [companionName, subject]);

  // Text-to-speech function
  const speakText = (text: string) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  // Start speech recognition
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Send message to study AI
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/studyAI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          companionId: companionId,
          threadId: userId,
          roomId: roomId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          text: result.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Speak the AI response
        speakText(result.response);
      } else {
        const errorText = await response.text();
        console.error('Failed to send message to study AI:', errorText);
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          text: 'Sorry, I encountered an error processing your message. Please try again.',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        text: 'Sorry, I encountered an error. Please check your connection and try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          zIndex: 1001,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={`Study with ${companionName}`}
      >
        🎓
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        height: '600px',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{companionName}</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>{subject} Study Companion</p>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: '20px',
                backgroundColor: message.isUser ? '#4CAF50' : '#e9ecef',
                color: message.isUser ? 'white' : 'black',
                fontSize: '14px',
                wordWrap: 'break-word',
                position: 'relative'
              }}
            >
              {message.text}
              {!message.isUser && (
                <button
                  onClick={() => speakText(message.text)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: 0.7
                  }}
                  title="Listen to response"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '15px'
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '20px',
                backgroundColor: '#e9ecef',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #999',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              {companionName} is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '15px',
          backgroundColor: 'white',
          borderTop: '1px solid #e9ecef'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${companionName} about ${subject}...`}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 15px',
              border: '2px solid #e9ecef',
              borderRadius: '25px',
              outline: 'none',
              fontSize: '14px',
              transition: 'border-color 0.3s'
            }}
          />
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            style={{
              padding: '10px',
              backgroundColor: isListening ? '#ff4444' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: isListening ? 'pointer' : 'pointer',
              fontSize: '16px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              flex: 1,
              padding: '10px 20px',
              backgroundColor: inputText.trim() && !isLoading ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Send
          </button>
          {isSpeaking && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#4CAF50',
                fontSize: '12px'
              }}
            >
              🔊 Speaking...
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
