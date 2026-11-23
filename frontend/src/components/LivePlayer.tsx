"use client";

import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { AlertCircle, RefreshCw, Check } from "lucide-react";
import { LiveTvChannel } from "../types";

interface LivePlayerProps {
  channel: LiveTvChannel;
  isUsingBackup: boolean;
  onToggleBackup?: () => void;
}

export default function LivePlayer({ channel, isUsingBackup, onToggleBackup }: LivePlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const streamUrl = isUsingBackup && channel.backupUrl ? channel.backupUrl : channel.streamUrl;

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    setPlayerError(null);

    // If player already initialized, update source
    if (playerRef.current) {
      playerRef.current.src({
        src: streamUrl,
        type: "application/x-mpegURL",
      });
      playerRef.current.play().catch(() => {});
      return;
    }

    // Create fresh video element
    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-theme-sea");
    videoRef.current.innerHTML = "";
    videoRef.current.appendChild(videoElement);

    const player = (playerRef.current = videojs(
      videoElement,
      {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        aspectRatio: "16:9",
        liveui: true,
        sources: [
          {
            src: streamUrl,
            type: "application/x-mpegURL",
          },
        ],
        controlBar: {
          children: [
            "playToggle",
            "volumePanel",
            "liveDisplay",
            "pictureInPictureToggle",
            "fullscreenToggle",
          ],
        },
      },
      () => {
        // Player ready
      }
    ));

    player.on("error", () => {
      const err = player.error();
      console.warn("Live stream error:", err);
      if (!isUsingBackup && channel.backupUrl && onToggleBackup) {
        onToggleBackup();
      } else {
        setPlayerError("Stream is temporarily offline or restricted by ISP. Try another channel.");
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [channel.id, isUsingBackup, streamUrl]);

  const handleRetry = () => {
    setPlayerError(null);
    if (playerRef.current && streamUrl) {
      playerRef.current.src({
        src: streamUrl,
        type: "application/x-mpegURL",
      });
      playerRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="w-full h-full relative aspect-video bg-black flex items-center justify-center">
      <div ref={videoRef} className="w-full h-full" />

      {/* Error Overlay */}
      {playerError && (
        <div className="absolute inset-0 bg-cinema-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Stream Unavailable</h3>
          <p className="text-xs text-cinema-muted max-w-md mb-4">{playerError}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center space-x-1.5 bg-cinema-red hover:bg-cinema-red-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Stream</span>
            </button>
            {channel.backupUrl && onToggleBackup && (
              <button
                onClick={onToggleBackup}
                className="bg-cinema-800 hover:bg-cinema-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                {isUsingBackup ? "Use Primary Stream" : "Use Backup Stream"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
