'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// --- Embedded VideoCall Component ---
// This component encapsulates all ZegoCloud logic.
interface VideoCallProps {
  userName: string;
  roomID: string;
  onLeave: () => void;
}
console.log('call caller page');

// Function to spawn digital human AI
async function spawnDigitalHuman(roomID: string) {
  try {
    // Get the selected companion from localStorage
    const selectedCompanion = localStorage.getItem('selectedCompanion');
    console.log('Spawning digital human for companion:', selectedCompanion, 'in room:', roomID);
    
    // Map companions to their digital human IDs
    const companionToDigitalHuman: { [key: string]: string } = {
      'companion-1-luna': 'dh_luna_01',
      'companion-2-rex': 'dh_rex_01', 
      'companion-3-nova': 'dh_nova_01'
    };

    const digitalHumanId = companionToDigitalHuman[selectedCompanion || 'companion-1-luna'];
    console.log('Using digital human ID:', digitalHumanId);
    
    // Call our backend API to spawn the digital human
    const response = await fetch('/api/spawnDigitalHuman', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: roomID,
        digitalHumanId: digitalHumanId,
        companionId: selectedCompanion
      }),
    });

    console.log('API response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('Digital human spawned successfully!', result);
    } else {
      const errorText = await response.text();
      console.error('Failed to spawn digital human:', errorText);
    }
  } catch (error) {
    console.error('Error spawning digital human:', error);
    // For now, just log the error but don't break the video call
    console.log('Continuing with video call without digital human...');
  }
}

function VideoCall({ userName, roomID, onLeave }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const zpRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const onLeaveRef = useRef(onLeave);

  // Update the ref when onLeave changes
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    if (hasInitialized.current || !containerRef.current) return;
    hasInitialized.current = true;

    import('@zegocloud/zego-uikit-prebuilt').then(({ ZegoUIKitPrebuilt }) => {
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
        onLeaveRoom: () => onLeaveRef.current(), // Use ref to avoid dependency issues
        sharedLinks: [{
          name: 'Copy room link',
          url: window.location.href,
        }]
      });

      // Spawn digital human AI after user joins (with delay to ensure room is ready)
      setTimeout(() => {
        spawnDigitalHuman(roomID);
      }, 2000);
    });

    // Cleanup function
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [userName, roomID]); // Removed onLeave from dependencies

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
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