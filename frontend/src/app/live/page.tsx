"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tv, Search, Play, RefreshCw, AlertCircle, Radio, Sparkles, Check, ChevronRight } from "lucide-react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { LiveTvChannel, LiveCategory } from "../../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function LiveTvPage() {
  const [channels, setChannels] = useState<LiveTvChannel[]>([]);
  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeChannel, setActiveChannel] = useState<LiveTvChannel | null>(null);
  const [isUsingBackup, setIsUsingBackup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Fetch initial channel & category list
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [channelsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/live-tv`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/live-tv/categories`).then((r) => r.json()),
        ]);

        const loadedChannels: LiveTvChannel[] = channelsRes?.data?.channels || [];
        const loadedCategories: LiveCategory[] = categoriesRes?.data || [];

        setChannels(loadedChannels);
        setCategories(loadedCategories);

        // Set default active channel (preferably Sports or Bangladesh)
        if (loadedChannels.length > 0) {
          const featured =
            loadedChannels.find((c) => c.category === "Sports" && c.name.toLowerCase().includes("t sports")) ||
            loadedChannels.find((c) => c.category === "Bangladesh") ||
            loadedChannels[0];
          setActiveChannel(featured);
        }
      } catch (err) {
        console.error("Failed to load live channels:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter channels based on category and search
  const filteredChannels = channels.filter((ch) => {
    const matchesCategory = selectedCategory === "All" || ch.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Switch stream source
  const currentStreamUrl = activeChannel
    ? isUsingBackup && activeChannel.backupUrl
      ? activeChannel.backupUrl
      : activeChannel.streamUrl
    : "";

  // Initialize or update Video.js player
  useEffect(() => {
    if (!videoRef.current || !activeChannel || !currentStreamUrl) return;

    setPlayerError(null);

    // If player exists, update source
    if (playerRef.current) {
      playerRef.current.src({
        src: currentStreamUrl,
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
            src: currentStreamUrl,
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
      console.warn("Video.js playback error:", err);
      if (!isUsingBackup && activeChannel.backupUrl) {
        setIsUsingBackup(true);
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
  }, [activeChannel, isUsingBackup, currentStreamUrl]);

  const handleChannelSelect = (channel: LiveTvChannel) => {
    setIsUsingBackup(false);
    setPlayerError(null);
    setActiveChannel(channel);
    // Smooth scroll to player on mobile
    if (window.innerWidth < 768 && videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRetryStream = () => {
    setPlayerError(null);
    if (playerRef.current && currentStreamUrl) {
      playerRef.current.src({
        src: currentStreamUrl,
        type: "application/x-mpegURL",
      });
      playerRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cinema-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-red-600/10 border border-red-500/20 px-3 py-1 rounded-full mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">BDIX High-Speed IPTV</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Tv className="w-8 h-8 text-cinema-red" />
            Live TV Streaming
          </h1>
          <p className="text-cinema-muted text-sm mt-1">
            Stream over 170+ Bangladeshi, Sports, Movie & International TV channels with bufferless low latency.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search channel or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cinema-900 border border-cinema-700 text-sm text-white placeholder-cinema-muted rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cinema-red"
          />
          <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3" />
        </div>
      </div>

      {/* 2. Active Channel Stream Station */}
      {activeChannel && (
        <div className="mb-10 bg-cinema-900/90 border border-cinema-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Player Container */}
            <div className="lg:col-span-2 bg-black relative aspect-video flex items-center justify-center">
              <div ref={videoRef} className="w-full h-full" />

              {/* Error Overlay */}
              {playerError && (
                <div className="absolute inset-0 bg-cinema-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
                  <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">Stream Error</h3>
                  <p className="text-xs text-cinema-muted max-w-md mb-4">{playerError}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRetryStream}
                      className="inline-flex items-center space-x-1.5 bg-cinema-red hover:bg-cinema-red-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Playback</span>
                    </button>
                    {activeChannel.backupUrl && !isUsingBackup && (
                      <button
                        onClick={() => setIsUsingBackup(true)}
                        className="bg-cinema-800 hover:bg-cinema-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                      >
                        Try Backup Stream
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current Channel Info Sidebar */}
            <div className="p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-cinema-900 to-cinema-950 border-t lg:border-t-0 lg:border-l border-cinema-800">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center space-x-1.5 text-[11px] font-extrabold uppercase bg-red-600/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>LIVE ON AIR</span>
                  </span>
                  <span className="text-xs font-semibold text-cinema-muted bg-cinema-800 px-2 py-0.5 rounded">
                    {activeChannel.quality || "HD"}
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  {activeChannel.logo ? (
                    <img
                      src={activeChannel.logo}
                      alt={activeChannel.name}
                      className="w-16 h-16 object-contain rounded-xl bg-cinema-800/80 p-1.5 border border-cinema-700/60"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-cinema-800 flex items-center justify-center text-cinema-muted">
                      <Tv className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">{activeChannel.name}</h2>
                    <p className="text-xs text-cinema-red font-semibold">{activeChannel.category}</p>
                    {activeChannel.channelNumber && (
                      <p className="text-[11px] text-cinema-muted mt-0.5">CH #{activeChannel.channelNumber}</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-cinema-muted space-y-1.5 bg-cinema-900/60 p-3 rounded-xl border border-cinema-800/80">
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="text-white font-medium">HLS (.m3u8)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Stream:</span>
                    <span className="text-emerald-400 font-medium">
                      {isUsingBackup ? "Backup Server" : "Primary BDIX"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Stream Switcher Buttons */}
              <div className="mt-5 pt-4 border-t border-cinema-800/80 space-y-2">
                {activeChannel.backupUrl && (
                  <button
                    onClick={() => {
                      setIsUsingBackup(!isUsingBackup);
                      setPlayerError(null);
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-cinema-800 hover:bg-cinema-700 text-slate-200 transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isUsingBackup ? "Switch to Primary Stream" : "Switch to Backup Stream"}</span>
                  </button>
                )}
                <div className="text-[11px] text-cinema-muted text-center">
                  💡 Select any channel below to switch streams instantly.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Category Filter Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === "All"
              ? "bg-cinema-red text-white shadow-lg shadow-cinema-red/30"
              : "bg-cinema-900 text-cinema-muted hover:text-white hover:bg-cinema-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Channels ({channels.length})</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === cat.name
                ? "bg-cinema-red text-white shadow-lg shadow-cinema-red/30"
                : "bg-cinema-900 text-cinema-muted hover:text-white hover:bg-cinema-800"
            }`}
          >
            <span>{cat.name}</span>
            <span className="text-[10px] opacity-70">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* 4. Channel Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="h-32 bg-cinema-900/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredChannels.length === 0 ? (
        <div className="text-center py-16 bg-cinema-900/40 rounded-2xl border border-cinema-800">
          <Tv className="w-12 h-12 text-cinema-muted mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-white mb-1">No channels found</h3>
          <p className="text-xs text-cinema-muted">
            Try adjusting your category filter or search keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredChannels.map((channel) => {
            const isPlaying = activeChannel?.id === channel.id;
            return (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className={`group relative rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 border flex flex-col items-center text-center justify-between ${
                  isPlaying
                    ? "bg-cinema-red/10 border-cinema-red shadow-lg shadow-cinema-red/20 scale-[1.02]"
                    : "bg-cinema-900/70 hover:bg-cinema-800/80 border-cinema-800 hover:border-cinema-700"
                }`}
              >
                {/* Active Playing Badge */}
                {isPlaying && (
                  <div className="absolute top-2 right-2 flex items-center space-x-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>PLAYING</span>
                  </div>
                )}

                {/* Channel Logo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 mb-2 rounded-xl bg-cinema-950 flex items-center justify-center p-1.5 border border-cinema-800 group-hover:border-cinema-600 transition">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Tv className="w-6 h-6 text-cinema-muted" />
                  )}
                </div>

                {/* Channel Details */}
                <div className="w-full">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-cinema-red transition">
                    {channel.name}
                  </h4>
                  <p className="text-[10px] text-cinema-muted mt-0.5 truncate">{channel.category}</p>
                </div>

                {/* Hover Play Prompt */}
                <div className="mt-2 w-full pt-2 border-t border-cinema-800/60 flex items-center justify-center text-[11px] font-semibold text-cinema-muted group-hover:text-white transition">
                  <Play className="w-3 h-3 mr-1 fill-current text-cinema-red" />
                  <span>{isPlaying ? "Playing Now" : "Watch Live"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
