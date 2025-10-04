'use client';

import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const APP_ID = 293628284;
    const SERVER_SECRET = '7ef5ad0e5bb3b97fb13ff842d1122837';
    const ROOM_ID = 'ai_companion_room_xyz';
    const USER_NAME = 'Human User';
    const USER_ID = `user_${Date.now()}`;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      APP_ID,
      SERVER_SECRET,
      ROOM_ID,
      USER_ID,
      USER_NAME
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current,
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showTextChat: true,
      showScreenSharingButton: true,
    });
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}
