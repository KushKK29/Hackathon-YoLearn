'use client';

import React, { useState, useEffect, useRef } from 'react';
// Assuming the environment should resolve 'next/navigation' for the App Router
import { useRouter } from 'next/navigation';
console.log('video caller page');
// --- We are embedding the VideoCall component directly into this file ---
// --- to resolve the component import error. ---

interface VideoCallProps {
  userName: string;
  roomID: string;
  onLeave: () => void;
}

function VideoCall({ userName, roomID, onLeave }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !containerRef.current) return;
    hasInitialized.current = true;

    // Dynamically import the Zego library only on the client-side
    import('@zegocloud/zego-uikit-prebuilt').then(({ ZegoUIKitPrebuilt }) => {
      const APP_ID = process.env.NEXT_PUBLIC_ZEGO_APP_ID ? parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID, 10) : 0;
      const SERVER_SECRET = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

      if (!APP_ID || !SERVER_SECRET) {
        console.error("ZegoCloud App ID or Server Secret is missing.");
        return;
      }

      const userID = userName.replace(/\s/g, '_').toLowerCase() + `_${Date.now()}`;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        roomID,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        onLeaveRoom: onLeave,
        sharedLinks: [{
          name: 'Copy room link',
          url: window.location.href,
        }]
      });
    });
  }, [userName, roomID, onLeave]);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}

// --- Main Page Component ---

export default function CallPage({ params }: { params: { roomId: string } }) {
  const [isClient, setIsClient] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const { roomId } = params;
  
  // This useEffect ensures that code relying on browser APIs
  // only runs on the client-side.
  useEffect(() => {
    setIsClient(true);
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      alert('User name not found. Redirecting to the homepage.');
      router.push('/');
    }
  }, [router]);

  const handleLeave = () => {
    router.push('/');
  };

  return (
    <>
      <style jsx global>{`
        body { background-color: #121212; }
        .mainContainer {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          background-color: #121212;
          color: #e0e0e0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .loadingText { font-size: 1.2rem; }
      `}</style>
      <main className="mainContainer">
        {isClient && userName ? (
          <VideoCall userName={userName} roomID={roomId} onLeave={handleLeave} />
        ) : (
          <p className="loadingText">Preparing your session...</p>
        )}
      </main>
    </>
  );
}

