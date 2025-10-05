'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DIDAvatar from '../../components/DIDAvatar';

// --- Embedded VideoCall Component ---
// This component encapsulates all ZegoCloud logic.
interface VideoCallProps {
  userName: string;
  roomID: string;
  onLeave: () => void;
}
console.log('call caller page');


function VideoCall({ userName, roomID, onLeave }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const zpRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const onLeaveRef = useRef(onLeave);
  
  // Avatar state
  const [showDIDAvatar, setShowDIDAvatar] = useState(false);
  const [companionName, setCompanionName] = useState<string>('');
  const [companionId, setCompanionId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');

  // Update the ref when onLeave changes
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    if (hasInitialized.current || !containerRef.current) return;
    hasInitialized.current = true;

    const initializeVideoCall = async () => {
      try {
        // Import ZegoUIKit
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

        const APP_ID = 293628284;
        const SERVER_SECRET = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "7ef5ad0e5bb3b97fb13ff842d1122837";

        if (!APP_ID || !SERVER_SECRET) {
          console.error("ZegoCloud App ID or Server Secret is missing.");
          return;
        }

        const storedUserID = localStorage.getItem('userID');
        const userID = storedUserID || userName.replace(/\s/g, '_').toLowerCase() + `_${Date.now()}`;
        localStorage.setItem('userID', userID);

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          APP_ID,
          SERVER_SECRET,
          roomID,
          userID,
          userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container: containerRef.current,
          scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          onLeaveRoom: () => onLeaveRef.current(),
          sharedLinks: [{
            name: 'Copy room link',
            url: window.location.href,
          }]
        });

        // Initialize companion data for avatar
        setTimeout(async () => {
          try {
            const selectedCompanion = localStorage.getItem('selectedCompanion') || 'companion-1-luna';
            setCompanionId(selectedCompanion);
            
            // Set companion name and subject based on companion
            const companionData: { [key: string]: { name: string; subject: string } } = {
              'companion-1-luna': { name: 'Luna', subject: 'Mindfulness & History' },
              'companion-2-rex': { name: 'Rex', subject: 'Science & Health' },
              'companion-3-nova': { name: 'Nova', subject: 'Technology & Programming' }
            };
            
            const data = companionData[selectedCompanion] || companionData['companion-1-luna'];
            setCompanionName(data.name);
            setSubject(data.subject);
            
            console.log('Companion data initialized:', data);
          } catch (error) {
            console.error('Error initializing companion data:', error);
          }
        }, 1000);

      } catch (error) {
        console.error('Error initializing video call:', error);
      }
    };

    initializeVideoCall();

    // Cleanup function
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [userName, roomID]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Main video call container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      
      {/* D-ID Avatar */}
      {companionName && companionId && subject && (
        <DIDAvatar
          companionId={companionId}
          companionName={companionName}
          subject={subject}
          isVisible={showDIDAvatar}
          onToggle={() => setShowDIDAvatar(!showDIDAvatar)}
        />
      )}
      
    </div>
  );
}

export default function CallPage({ params }: { params: Promise<{ roomId: string }> }) {
    const [isClient, setIsClient] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<string>('');
    const router = useRouter();
    
    useEffect(() => {
      setIsClient(true);
      const storedUserName = localStorage.getItem('userName');
      if (storedUserName) {
        setUserName(storedUserName);
      } else {
        alert('User name not found. Redirecting to the dashboard.');
        router.push('/');
      }
      
      // Handle async params
      params.then((resolvedParams) => {
        setRoomId(resolvedParams.roomId);
      });
    }, [router, params]);
  
    const handleLeave = useCallback(() => {
      router.push('/');
    }, [router]);
  
    return (
      <main style={{ background: '#1a202c' }}>
          {isClient && userName && roomId ? (
            <VideoCall userName={userName} roomID={roomId} onLeave={handleLeave} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>
              <p>Preparing your session...</p>
            </div>
          )}
      </main>
    );
  }