'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DIDAvatarProps {
  companionId: string;
  companionName: string;
  subject: string;
  isVisible: boolean;
  onToggle: () => void;
}
const avatar1 = "/Ai_Video.mp4";
export default function DIDAvatar({ 
  companionId, 
  companionName, 
  subject, 
  isVisible, 
  onToggle 
}: DIDAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video URLs for different companions
  const companionVideos = {
    'companion-1-luna': avatar1,
    'companion-2-rex': avatar1,
    'companion-3-nova': avatar1
  };

  // Get the video URL for the current companion
  const getVideoUrl = () => {
    return companionVideos[companionId as keyof typeof companionVideos] || companionVideos['companion-1-luna'];
  };

  // Auto-play video when component becomes visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          // Silently handle play errors (common when video is removed from DOM)
          console.log('Video play interrupted or failed:', error);
        }
      };
      playVideo();
    }
  }, [isVisible]);

  // Cleanup video when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#2196F3',
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
        title={`See ${companionName} avatar`}
      >
        👤
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        width: '350px',
        height: '400px',
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
          background: 'linear-gradient(135deg, #2196F3, #1976D2)',
          color: 'white',
          padding: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{companionName}</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>{subject} Study Companion</p>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Video Area */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <video
          ref={videoRef}
          src={avatar1}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            console.error('Video failed to load:', e);
            // Fallback to a placeholder if video fails
            const videoElement = e.target as HTMLVideoElement;
            videoElement.style.display = 'none';
          }}
        />
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: '10px 15px',
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          fontSize: '12px',
          color: '#666'
        }}
      >
        <span>🎥 Video playing</span>
      </div>

    </div>
  );
}
