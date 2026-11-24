"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  AlertCircle,
  RefreshCw,
  VolumeX,
  Volume1,
  Volume2,
  Radio,
  Loader2,
  SkipForward,
  Play,
  Pause,
  Maximize,
  Minimize,
  PictureInPicture2,
  Tv,
} from "lucide-react";
import { LiveTvChannel } from "../types";

interface LivePlayerProps {
  channel: LiveTvChannel;
  isUsingBackup: boolean;
  onToggleBackup?: () => void;
  onNextChannel?: () => void;
}

export default function LivePlayer({
  channel,
  isUsingBackup,
  onToggleBackup,
  onNextChannel,
}: LivePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const volumePillRef = useRef<HTMLDivElement>(null);

  const channelRef = useRef<LiveTvChannel>(channel);
  const isUsingBackupRef = useRef<boolean>(isUsingBackup);
  const onToggleBackupRef = useRef(onToggleBackup);

  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAutoplayMuted, setIsAutoplayMuted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [logoFailed, setLogoFailed] = useState<boolean>(false);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  channelRef.current = channel;
  isUsingBackupRef.current = isUsingBackup;
  onToggleBackupRef.current = onToggleBackup;

  const streamUrl =
    isUsingBackup && channel.backupUrl ? channel.backupUrl : channel.streamUrl;

  useEffect(() => {
    setLogoFailed(false);
  }, [channel.id]);

  // Sync fullscreen state listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Mousewheel volume adjustment on Glassmorphic Sound Pill
  useEffect(() => {
    const pill = volumePillRef.current;
    if (!pill) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const video = videoElRef.current;
      if (!video) return;

      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      const base = video.muted ? 0 : video.volume;
      const nextVol = Math.min(1, Math.max(0, Number((base + delta).toFixed(2))));
      if (nextVol > 0 && video.muted) {
        video.muted = false;
        setIsMuted(false);
        setIsAutoplayMuted(false);
      } else if (nextVol === 0) {
        video.muted = true;
        setIsMuted(true);
      }
      video.volume = nextVol;
      setVolume(nextVol);
    };

    pill.addEventListener("wheel", onWheel, { passive: false });
    return () => pill.removeEventListener("wheel", onWheel);
  }, []);

  // Core Low-Latency HLS Engine lifecycle
  useEffect(() => {
    const video = videoElRef.current;
    if (!video || !streamUrl) return;

    setPlayerError(null);
    setIsBuffering(true);
    setHasStarted(false);
    setIsPlaying(false);

    let destroyed = false;
    let networkRetries = 0;
    let mediaRetries = 0;

    const attemptPlay = () => {
      if (destroyed) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err: any) => {
          if (destroyed) return;
          if (err?.name === "AbortError") return;

          if (err?.name === "NotAllowedError") {
            video.muted = true;
            setIsMuted(true);
            setIsAutoplayMuted(true);
            video.play()?.catch(() => {});
          }
        });
      }
    };

    const onWaiting = () => {
      if (!destroyed) setIsBuffering(true);
    };
    const onCanPlay = () => {
      if (!destroyed) setIsBuffering(false);
    };
    const onPlaying = () => {
      if (destroyed) return;
      setIsBuffering(false);
      setHasStarted(true);
      setIsPlaying(true);
      setPlayerError(null);
    };
    const onPause = () => {
      if (!destroyed) setIsPlaying(false);
    };
    const onTimeUpdate = () => {
      if (!destroyed && video.readyState >= 2) {
        setIsBuffering(false);
        setHasStarted(true);
      }
    };
    const onVolumeChange = () => {
      if (destroyed) return;
      setIsMuted(video.muted);
      setVolume(video.volume);
      if (!video.muted && video.volume > 0) {
        setIsAutoplayMuted(false);
      }
    };

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("loadeddata", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("volumechange", onVolumeChange);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 15,
        maxBufferLength: 8,
        maxMaxBufferLength: 16,
        liveSyncDurationCount: 2,
        startFragPrefetch: true,
        manifestLoadingTimeOut: 8000,
        levelLoadingTimeOut: 8000,
        fragLoadingTimeOut: 10000,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        attemptPlay();
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        if (!destroyed && video.paused && !playerError) {
          attemptPlay();
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (destroyed || !data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetries < 1) {
          networkRetries++;
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetries < 1) {
          mediaRetries++;
          hls.recoverMediaError();
          return;
        }

        // Fatal error -> switch to backup if available, else show clean error card
        const currCh = channelRef.current;
        if (!isUsingBackupRef.current && currCh.backupUrl && onToggleBackupRef.current) {
          onToggleBackupRef.current();
        } else {
          setIsBuffering(false);
          setPlayerError(
            "This broadcast stream is currently offline or blocked by your ISP. Try retrying or switch to the next channel."
          );
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari Native HLS
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", attemptPlay);
    } else {
      setIsBuffering(false);
      setPlayerError("Your browser does not support HLS live playback.");
    }

    return () => {
      destroyed = true;
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("loadeddata", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("volumechange", onVolumeChange);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, isUsingBackup, streamUrl, retryTrigger]);

  // 12-Second Stall Watchdog Timeout
  useEffect(() => {
    if (!isBuffering || playerError) return;

    const timer = setTimeout(() => {
      const currCh = channelRef.current;
      if (!isUsingBackupRef.current && currCh.backupUrl && onToggleBackupRef.current) {
        onToggleBackupRef.current();
      } else {
        setIsBuffering(false);
        setPlayerError(
          "Stream timed out while connecting. The broadcast server may be temporarily overloaded or offline."
        );
      }
    }, 12000);

    return () => clearTimeout(timer);
  }, [isBuffering, playerError, channel.id, isUsingBackup, retryTrigger]);

  const togglePlayPause = () => {
    const video = videoElRef.current;
    if (!video) return;
    if (video.paused) {
      video.play()?.catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoElRef.current;
    if (!video) return;
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) {
        video.volume = 0.85;
        setVolume(0.85);
      }
      setIsMuted(false);
      setIsAutoplayMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoElRef.current;
    if (!video) return;
    const nextVol = parseFloat(e.target.value);
    video.volume = nextVol;
    video.muted = nextVol === 0;
    setVolume(nextVol);
    setIsMuted(nextVol === 0);
    if (nextVol > 0) setIsAutoplayMuted(false);
  };

  const handleUnmutePill = () => {
    const video = videoElRef.current;
    if (!video) return;
    video.muted = false;
    if (video.volume === 0) {
      video.volume = 0.85;
      setVolume(0.85);
    }
    setIsMuted(false);
    setIsAutoplayMuted(false);
  };

  const jumpToLiveEdge = () => {
    const video = videoElRef.current;
    const hls = hlsRef.current;
    if (hls && typeof hls.liveSyncPosition === "number" && video) {
      video.currentTime = hls.liveSyncPosition;
      video.play()?.catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoElRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      // ignore PiP errors
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch {
      // ignore fullscreen errors
    }
  };

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  const volumePct = isMuted || volume === 0 ? 0 : Math.round(volume * 100);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative aspect-video bg-black flex items-center justify-center overflow-hidden rounded-2xl group select-none"
    >
      {/* Native Video Element powered by Low-Latency hls.js */}
      <video
        ref={videoElRef}
        onClick={togglePlayPause}
        onDoubleClick={toggleFullscreen}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Top-Left Live Signal Badge */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>LIVE</span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-slate-200">
          <Radio className="w-3 h-3 text-emerald-400" />
          <span>{channel.name}</span>
        </span>
      </div>

      {/* Click-to-Unmute Pill (ONLY shown when video is actively playing & muted by browser autoplay) */}
      {!isBuffering && !playerError && hasStarted && isAutoplayMuted && (
        <button
          onClick={handleUnmutePill}
          className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/95 hover:bg-red-500 text-white text-xs font-bold shadow-xl shadow-red-900/40 border border-white/20 backdrop-blur-md transition transform hover:scale-105 animate-pulse"
        >
          <VolumeX className="w-3.5 h-3.5" />
          <span>সাউন্ড শুনতে ক্লিক করুন</span>
        </button>
      )}

      {/* Branded Channel Tune-In Splash (brief ~1s while first keyframe arrives) */}
      {isBuffering && !playerError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#0a0d14]/90 via-black/75 to-[#0a0d14]/90 backdrop-blur-sm">
          <div className="relative w-16 h-16 rounded-2xl bg-white/[0.07] border border-white/15 p-2 flex items-center justify-center shadow-2xl">
            {channel.logo && !logoFailed ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="max-w-full max-h-full object-contain"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <Tv className="w-7 h-7 text-slate-400" />
            )}
            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-black border border-white/15 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 text-cinema-red animate-spin" />
            </span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-white tracking-wide">
              Tuning {channel.name}...
            </p>
            <p className="text-[10px] text-slate-400">
              {channel.category} • Low-Latency BDIX Feed
            </p>
          </div>
        </div>
      )}

      {/* Error / Timeout Recovery Overlay */}
      {playerError && (
        <div className="absolute inset-0 bg-[#080b10]/94 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Stream Offline / Timed Out
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
            {playerError}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={handleRetry}
              className="inline-flex items-center space-x-1.5 bg-cinema-red hover:bg-cinema-red-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-red-900/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Stream</span>
            </button>
            {channel.backupUrl && onToggleBackup && (
              <button
                onClick={onToggleBackup}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                {isUsingBackup ? "Use Primary Stream" : "Switch to Backup Stream"}
              </button>
            )}
            {onNextChannel && (
              <button
                onClick={onNextChannel}
                className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                <span>Next Channel</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sleek Single-Row Live Control Bar with Glassmorphic Sound Pill */}
      {!playerError && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 px-3.5 sm:px-4 pt-8 pb-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between gap-2 transition-opacity duration-200 ${
            !isPlaying || isBuffering
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {/* Left Controls: Play/Pause, Sound Pill, LIVE Edge */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={togglePlayPause}
              title={isPlaying ? "Pause" : "Play"}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Glassmorphic Gradient Sound Pill */}
            <div
              ref={volumePillRef}
              className="flex items-center gap-2 h-8 px-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-cyan-400/50 backdrop-blur-md transition"
              title="Scroll mouse wheel to adjust volume"
            >
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="text-white hover:text-cyan-300 transition flex items-center justify-center"
              >
                {volumePct === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volumePct < 50 ? (
                  <Volume1 className="w-4 h-4 text-cyan-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-300" />
                )}
              </button>

              <div className="hidden sm:flex relative w-16 h-1.5 rounded-full bg-white/20 items-center">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-rose-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  style={{ width: `${volumePct}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeSlider}
                  aria-label="Volume slider"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <span className="hidden sm:inline-block text-[11px] font-bold tabular-nums text-slate-200 min-w-[30px] text-right">
                {volumePct}%
              </span>
            </div>

            {/* Compact LIVE Pill */}
            <button
              onClick={jumpToLiveEdge}
              title="Sync to Live Edge"
              className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-red-600/20 border border-red-500/45 text-[10px] font-extrabold uppercase tracking-wider text-red-300 hover:bg-red-600/35 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE</span>
            </button>
          </div>

          {/* Right Controls: PiP & Fullscreen */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePiP}
              title="Picture-in-Picture"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
