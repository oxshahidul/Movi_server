"use client";

import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import {
  RotateCcw,
  Play,
  Clock,
  Volume2,
  VolumeX,
  Volume1,
  FastForward,
  Rewind,
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

interface VideoPlayerProps {
  sourceUrl: string;
  sourceFormat?: string; // "HLS" | "MP4"
  poster?: string;
  title?: string;
  runtimeMinutes?: number;
  contentType: "MOVIE" | "SERIES";
  contentId: string;
  episodeId?: string;
  initialTime?: number;
  subtitles?: Array<{ language: string; subtitleUrl: string }>;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

interface HudFeedback {
  type: "volume" | "seek";
  label: string;
  percent?: number;
  direction?: "forward" | "backward";
  muted?: boolean;
}

export default function VideoPlayer({
  sourceUrl,
  sourceFormat = "HLS",
  poster,
  title,
  runtimeMinutes,
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
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuthStore();

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeSeconds, setResumeSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [isUserActive, setIsUserActive] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [hudFeedback, setHudFeedback] = useState<HudFeedback | null>(null);

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

  const triggerHud = (feedback: HudFeedback) => {
    setHudFeedback(feedback);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      setHudFeedback(null);
    }, 950);
  };

  useEffect(() => {
    if (!videoRef.current) return;

    // Create video element
    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-theme-sea");
    videoRef.current.appendChild(videoElement);

    const isHls = sourceFormat.toUpperCase() === "HLS" || sourceUrl.includes(".m3u8");
    const isMkv = sourceUrl.toLowerCase().includes(".mkv");

    const sources = isHls
      ? [{ src: sourceUrl, type: "application/x-mpegURL" }]
      : isMkv
      ? [
          { src: sourceUrl, type: "video/mp4" },
          { src: sourceUrl, type: "video/webm" },
        ]
      : [{ src: sourceUrl, type: "video/mp4" }];

    let volPanelEl: Element | null = null;
    let handleVolumeWheel: ((e: WheelEvent) => void) | null = null;
    let durationObserver: MutationObserver | null = null;

    const player = (playerRef.current = videojs(
      videoElement,
      {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        aspectRatio: "16:9",
        preload: "metadata",
        enableSmoothSeeking: true,
        poster: poster || "",
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        sources,
        controlBar: {
          skipButtons: {
            forward: 10,
            backward: 10,
          },
          children: [
            "playToggle",
            "skipBackward",
            "skipForward",
            "volumePanel",
            "currentTimeDisplay",
            "timeDivider",
            "durationDisplay",
            "progressControl",
            "customControlSpacer",
            "audioTrackButton",
            "playbackRateMenuButton",
            "subsCapsButton",
            "pictureInPictureToggle",
            "fullscreenToggle",
          ],
        },
      } as any,
      () => {
        // Player ready
        if (initialTime && initialTime > 15) {
          setResumeSeconds(initialTime);
          setShowResumePrompt(true);
        }

        // Show fallback duration from runtimeMinutes immediately until stream metadata loads
        const rootEl = player.el();
        const durDisplayEl = rootEl?.querySelector(".vjs-duration-display");
        const applyDurationFallback = () => {
          if (!durDisplayEl || !runtimeMinutes || runtimeMinutes <= 0) return;
          if ((player.duration() ?? 0) > 0) return;
          const formattedFallback = formatTime(runtimeMinutes * 60);
          Array.from(durDisplayEl.childNodes).forEach((node: any) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const txt = node.textContent || "";
              if (txt.includes("-") || txt.trim() === "" || txt.trim() === "0:00") {
                node.textContent = formattedFallback;
              }
            }
          });
        };

        if (durDisplayEl && runtimeMinutes && runtimeMinutes > 0) {
          applyDurationFallback();
          durationObserver = new MutationObserver(() => {
            applyDurationFallback();
          });
          durationObserver.observe(durDisplayEl, {
            childList: true,
            characterData: true,
            subtree: true,
          });
        }
        player.on("durationchange", applyDurationFallback);

        // Inject crisp Volume % indicator and attach wheel listener inside sound pill
        volPanelEl = rootEl?.querySelector(".vjs-volume-panel") || null;
        if (volPanelEl) {
          let percentSpan = volPanelEl.querySelector(".vjs-volume-percent") as HTMLSpanElement | null;
          if (!percentSpan) {
            percentSpan = document.createElement("span");
            percentSpan.className = "vjs-volume-percent";
            volPanelEl.appendChild(percentSpan);
          }

          const syncVolumeText = () => {
            if (!percentSpan) return;
            const muted = player.muted();
            const vol = player.volume() ?? 1;
            percentSpan.textContent = muted || vol === 0 ? "0%" : `${Math.round(vol * 100)}%`;
          };

          syncVolumeText();
          player.on("volumechange", syncVolumeText);

          handleVolumeWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const step = e.deltaY < 0 ? 0.05 : -0.05;
            const currentVol = player.muted() ? 0 : player.volume() ?? 1;
            const nextVol = Math.min(1, Math.max(0, Number((currentVol + step).toFixed(2))));
            if (nextVol > 0 && player.muted()) {
              player.muted(false);
            }
            player.volume(nextVol);
            const pct = Math.round(nextVol * 100);
            triggerHud({
              type: "volume",
              label: pct === 0 ? "Muted" : `${pct}%`,
              percent: pct,
              muted: pct === 0,
            });
          };

          volPanelEl.addEventListener("wheel", handleVolumeWheel as EventListener, {
            passive: false,
          });
        }
      }
    ));

    // Sync real stream duration and aspect ratio
    const updateDurationAndRatio = () => {
      const w = player.videoWidth();
      const h = player.videoHeight();
      if (w && h && w > 0 && h > 0) {
        player.aspectRatio(`${w}:${h}`);
      }
      const d = player.duration();
      if (typeof d === "number" && isFinite(d) && d > 0) {
        setDurationSeconds(d);
      }
    };

    player.on("loadedmetadata", updateDurationAndRatio);
    player.on("durationchange", updateDurationAndRatio);
    player.on("play", () => setIsPaused(false));
    player.on("pause", () => setIsPaused(true));
    player.on("useractive", () => setIsUserActive(true));
    player.on("userinactive", () => setIsUserActive(false));

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

    // Keyboard Shortcuts (Play, Seek ±10s, Volume ±5%, Mute, Fullscreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        player.paused() ? player.play() : player.pause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        const cur = player.currentTime() || 0;
        player.currentTime(cur + 10);
        triggerHud({ type: "seek", label: "+10s", direction: "forward" });
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        const cur = player.currentTime() || 0;
        player.currentTime(Math.max(0, cur - 10));
        triggerHud({ type: "seek", label: "-10s", direction: "backward" });
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        const currentVol = player.muted() ? 0 : player.volume() ?? 1;
        const nextVol = Math.min(1, Number((currentVol + 0.05).toFixed(2)));
        if (player.muted()) player.muted(false);
        player.volume(nextVol);
        const pct = Math.round(nextVol * 100);
        triggerHud({ type: "volume", label: `${pct}%`, percent: pct, muted: false });
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        const currentVol = player.muted() ? 0 : player.volume() ?? 1;
        const nextVol = Math.max(0, Number((currentVol - 0.05).toFixed(2)));
        player.volume(nextVol);
        const pct = Math.round(nextVol * 100);
        triggerHud({
          type: "volume",
          label: pct === 0 ? "Muted" : `${pct}%`,
          percent: pct,
          muted: pct === 0,
        });
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        const nextMuted = !player.muted();
        player.muted(nextMuted);
        const pct = nextMuted ? 0 : Math.round((player.volume() ?? 1) * 100);
        triggerHud({
          type: "volume",
          label: nextMuted ? "Muted" : `${pct}%`,
          percent: pct,
          muted: nextMuted,
        });
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
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
      if (durationObserver) durationObserver.disconnect();
      if (volPanelEl && handleVolumeWheel) {
        volPanelEl.removeEventListener("wheel", handleVolumeWheel as EventListener);
      }
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

  // Compute clear minutes / hours label from live video metadata or DB runtime fallback
  const resolvedMinutes =
    durationSeconds > 0
      ? Math.max(1, Math.round(durationSeconds / 60))
      : runtimeMinutes && runtimeMinutes > 0
      ? runtimeMinutes
      : null;

  const formattedDurationBadge = resolvedMinutes
    ? resolvedMinutes >= 60
      ? `${Math.floor(resolvedMinutes / 60)}h ${resolvedMinutes % 60}m (${resolvedMinutes} min)`
      : `${resolvedMinutes} min`
    : null;

  const showTopBar = isPaused || isUserActive;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-cinema-700/60 group">
      {/* Video.js element mount */}
      <div data-vjs-player className="w-full">
        <div ref={videoRef} className="w-full" />
      </div>

      {/* Top Cinema Header Overlay (Title + Total Minutes Badge + Next Episode) */}
      {(title || formattedDurationBadge || (hasNextEpisode && onNextEpisode)) && (
        <div
          className={`pointer-events-none absolute top-0 left-0 right-0 z-20 px-4 sm:px-5 pt-3.5 pb-10 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between gap-3 transition-opacity duration-300 ${
            showTopBar ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="min-w-0 flex items-center gap-2.5">
            {title && (
              <span className="text-xs sm:text-sm font-bold text-white/95 truncate drop-shadow">
                {title}
              </span>
            )}
          </div>

          <div className="pointer-events-auto shrink-0 flex items-center gap-2">
            {formattedDurationBadge && (
              <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/15 text-slate-100 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                <Clock className="w-3.5 h-3.5 text-cinema-cyan" />
                <span>{formattedDurationBadge}</span>
              </span>
            )}

            {hasNextEpisode && onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="bg-cinema-900/90 hover:bg-cinema-red border border-cinema-700 text-white text-xs font-semibold px-3.5 py-1 rounded-full shadow-lg transition backdrop-blur-md"
              >
                Next Episode →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Center Floating Sound & Seek HUD Feedback */}
      {hudFeedback && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="bg-black/75 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-3.5 shadow-2xl flex flex-col items-center gap-2 min-w-[140px]">
            {hudFeedback.type === "volume" ? (
              <>
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  {hudFeedback.muted || (hudFeedback.percent ?? 0) === 0 ? (
                    <VolumeX className="w-5 h-5 text-cinema-red" />
                  ) : (hudFeedback.percent ?? 0) < 50 ? (
                    <Volume1 className="w-5 h-5 text-cinema-cyan" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-cinema-cyan" />
                  )}
                  <span className="tabular-nums">{hudFeedback.label}</span>
                </div>
                <div className="w-28 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-rose-500 transition-all duration-100"
                    style={{ width: `${hudFeedback.percent ?? 0}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                {hudFeedback.direction === "backward" ? (
                  <Rewind className="w-5 h-5 text-cinema-cyan" />
                ) : (
                  <FastForward className="w-5 h-5 text-cinema-cyan" />
                )}
                <span>{hudFeedback.label}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                You previously paused at{" "}
                <span className="text-white font-mono font-bold">
                  {formatTime(resumeSeconds)}
                </span>
                .
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
    </div>
  );
}
