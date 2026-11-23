"use client";

import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { RotateCcw, Play, Check } from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

interface VideoPlayerProps {
  sourceUrl: string;
  sourceFormat?: string; // "HLS" | "MP4"
  poster?: string;
  title?: string;
  contentType: "MOVIE" | "SERIES";
  contentId: string;
  episodeId?: string;
  initialTime?: number;
  subtitles?: Array<{ language: string; subtitleUrl: string }>;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

export default function VideoPlayer({
  sourceUrl,
  sourceFormat = "HLS",
  poster,
  title,
  contentType,
  contentId,
  episodeId,
  initialTime = 0,
  subtitles = [],
  onNextEpisode,
  hasNextEpisode,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const { user } = useAuthStore();

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeSeconds, setResumeSeconds] = useState(0);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!videoRef.current) return;

    // Create video element
    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-theme-sea");
    videoRef.current.appendChild(videoElement);

    const isHls = sourceFormat.toUpperCase() === "HLS" || sourceUrl.includes(".m3u8");
    const mimeType = isHls ? "application/x-mpegURL" : "video/mp4";

    const player = (playerRef.current = videojs(
      videoElement,
      {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        aspectRatio: "16:9",
        preload: "auto",
        poster: poster || "",
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        sources: [
          {
            src: sourceUrl,
            type: mimeType,
          },
        ],
        controlBar: {
          children: [
            "playToggle",
            "volumePanel",
            "currentTimeDisplay",
            "timeDivider",
            "durationDisplay",
            "progressControl",
            "playbackRateMenuButton",
            "subsCapsButton",
            "pictureInPictureToggle",
            "fullscreenToggle",
          ],
        },
      },
      () => {
        // Player ready
        if (initialTime && initialTime > 15) {
          setResumeSeconds(initialTime);
          setShowResumePrompt(true);
        }
      }
    ));

    // Dynamically update player aspect ratio to match exact video dimensions once metadata is ready
    player.on("loadedmetadata", () => {
      const w = player.videoWidth();
      const h = player.videoHeight();
      if (w && h && w > 0 && h > 0) {
        player.aspectRatio(`${w}:${h}`);
      }
    });

    // Add subtitles if available
    subtitles.forEach((sub) => {
      player.addRemoteTextTrack(
        {
          kind: "subtitles",
          label: sub.language,
          src: sub.subtitleUrl,
          srclang: sub.language.toLowerCase().slice(0, 2),
        },
        false
      );
    });

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        player.paused() ? player.play() : player.pause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        const cur = player.currentTime() || 0;
        player.currentTime(cur + 10);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        const cur = player.currentTime() || 0;
        player.currentTime(Math.max(0, cur - 10));
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        player.muted(!player.muted());
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Heartbeat Sync: sends progress to backend every 10 seconds
    const heartbeatInterval = setInterval(() => {
      if (!player.paused() && user) {
        const currentTime = Math.floor(player.currentTime() || 0);
        const duration = Math.floor(player.duration() || 0);
        if (currentTime > 5) {
          fetchApi("/watch-history/progress", {
            method: "POST",
            body: JSON.stringify({
              contentType,
              contentId,
              episodeId: episodeId || undefined,
              progressSeconds: currentTime,
              durationSeconds: duration,
            }),
          }).catch(() => {});
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(heartbeatInterval);
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [sourceUrl, sourceFormat]);

  const handleResumePlayback = () => {
    if (playerRef.current) {
      playerRef.current.currentTime(resumeSeconds);
      playerRef.current.play();
      setShowResumePrompt(false);
    }
  };

  const handleStartFromBeginning = () => {
    if (playerRef.current) {
      playerRef.current.currentTime(0);
      playerRef.current.play();
      setShowResumePrompt(false);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-cinema-700/60 group">
      {/* Video.js element mount */}
      <div data-vjs-player className="w-full">
        <div ref={videoRef} className="w-full" />
      </div>

      {/* Resume from timestamp prompt dialog */}
      {showResumePrompt && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className="bg-cinema-900 border border-cinema-700 p-6 sm:p-8 rounded-3xl max-w-sm text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-cinema-red/20 text-cinema-red mx-auto flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Resume Playback?</h3>
              <p className="text-xs text-cinema-muted mt-1">
                You previously paused at <span className="text-white font-mono font-bold">{formatTime(resumeSeconds)}</span>.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleResumePlayback}
                className="w-full py-2.5 px-4 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-cinema-red/30"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume from {formatTime(resumeSeconds)}</span>
              </button>
              <button
                onClick={handleStartFromBeginning}
                className="w-full py-2.5 px-4 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-slate-300 font-semibold text-xs transition"
              >
                Start from Beginning (00:00)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Next Episode Button (at video end) */}
      {hasNextEpisode && onNextEpisode && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={onNextEpisode}
            className="bg-cinema-900/90 hover:bg-cinema-red border border-cinema-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition backdrop-blur-md"
          >
            Next Episode →
          </button>
        </div>
      )}
    </div>
  );
}
