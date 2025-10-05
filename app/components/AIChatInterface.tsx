'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AIChatInterfaceProps {
  roomId: string;
  digitalHumanId: string;
  userId: string;
  companionName: string;
  companionId: string;
  isVisible: boolean;
  onToggle: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatInterface({ 
  roomId, 
  digitalHumanId, 
  userId, 
  companionName, 
  companionId,
  isVisible, 
  onToggle 
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message when component mounts
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: `Hello! I'm ${companionName}, your AI companion. How can I help you today?`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [companionName]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/aiAgent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'interact',
          roomId: roomId,
          digitalHumanId: digitalHumanId,
          message: inputText,
          userId: userId,
          companionId: companionId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          text: result.data.response || 'I received your message and I\'m processing it...',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorText = await response.text();
        console.error('Failed to send message to AI:', errorText);
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
        title={`Chat with ${companionName}`}
      >
        💬
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        borderRadius: '10px',
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
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '16px' }}>{companionName}</h3>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>AI Companion</p>
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
          padding: '10px',
          overflowY: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '10px',
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: '18px',
                backgroundColor: message.isUser ? '#4CAF50' : '#e0e0e0',
                color: message.isUser ? 'white' : 'black',
                fontSize: '14px',
                wordWrap: 'break-word'
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '10px'
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '18px',
                backgroundColor: '#e0e0e0',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
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
              {companionName} is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '10px',
          backgroundColor: 'white',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${companionName}...`}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              padding: '8px 15px',
              backgroundColor: inputText.trim() && !isLoading ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Send
          </button>
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
