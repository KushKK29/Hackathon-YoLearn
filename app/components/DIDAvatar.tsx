"use client";

import React, { useEffect, useRef, useState } from "react";

interface DIDAvatarProps {
  companionId: string;
  companionName: string;
  subject: string;
  isVisible: boolean;
  onToggle: () => void;
}

const fallbackVideo = "/Ai_Video.mp4";

export default function DIDAvatar({
  companionId: _companionId,
  companionName,
  subject,
  isVisible,
  onToggle,
}: DIDAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Idle");

  // 🔹 Fetch avatar video (or fallback if failed)
  const fetchAvatarResponse = async () => {
    try {
      setStatus("Fetching avatar video...");
      const res = await fetch("/api/digitalHuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companionId: _companionId,
          prompt: `Greet the user and talk about ${subject}.`,
        }),
      });

      const data = await res.json();

      if (data?.videoUrl) {
        setVideoSrc(data.videoUrl);
        setStatus("🎥 Playing live avatar");
      } else {
        console.warn("No video URL returned, using fallback");
        setVideoSrc(fallbackVideo);
        setStatus("🎥 Playing fallback video");
      }
    } catch (error) {
      console.error("Error fetching avatar video:", error);
      setVideoSrc(fallbackVideo);
      setStatus("⚠️ Using fallback video due to API error");
    }
  };

  // 🔹 Play video when source is available
  useEffect(() => {
    if (videoSrc && isVisible && videoRef.current) {
      const play = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          console.warn("Autoplay blocked or failed:", error);
        }
      };
      play();
    }
  }, [videoSrc, isVisible]);

  // 🔹 Start fetching when avatar becomes visible
  useEffect(() => {
    if (isVisible) {
      fetchAvatarResponse();
    }
  }, [isVisible]);

  // 🔹 Cleanup on unmount
  useEffect(() => {
    return () => {
      const el = videoRef.current;
      if (el) {
        el.pause();
        el.src = "";
        el.load();
      }
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          zIndex: 1001,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
        position: "fixed",
        top: "20px",
        left: "20px",
        width: "350px",
        height: "400px",
        backgroundColor: "white",
        borderRadius: "15px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        zIndex: 1001,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #2196F3, #1976D2)",
          color: "white",
          padding: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
            {companionName}
          </h3>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", opacity: 0.9 }}>
            {subject} Study Companion
          </p>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
            padding: "5px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Video Area */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e) => {
              console.error("Video failed to load:", e);
              setStatus("⚠️ Video failed to load");
            }}
          />
        ) : (
          <p style={{ color: "#fff", fontSize: "14px" }}>Loading avatar...</p>
        )}
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: "10px 15px",
          backgroundColor: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <span>{status}</span>
      </div>
    </div>
  );
}
