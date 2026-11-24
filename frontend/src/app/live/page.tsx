"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Tv,
  Search,
  RefreshCw,
  Loader2,
  Star,
  LayoutGrid,
  List,
  Share2,
  Maximize2,
  Columns2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Radio,
  Zap,
  History,
  ArrowLeft,
} from "lucide-react";
import { LiveTvChannel, LiveCategory } from "../../types";

const LivePlayer = dynamic(() => import("../../components/LivePlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black rounded-2xl flex items-center justify-center text-cinema-muted">
      <Loader2 className="w-8 h-8 animate-spin text-cinema-red" />
    </div>
  ),
});

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const FAV_STORAGE_KEY = "screenbox_live_favorites";
const RECENT_STORAGE_KEY = "screenbox_live_recents";

function LiveEqualizer() {
  return (
    <span
      className="inline-flex items-end gap-[2px] h-3 shrink-0"
      aria-label="Playing live"
    >
      <span className="live-eq-bar" style={{ animationDelay: "0ms" }} />
      <span className="live-eq-bar" style={{ animationDelay: "180ms" }} />
      <span className="live-eq-bar" style={{ animationDelay: "360ms" }} />
    </span>
  );
}

function LiveTvStudioContent() {
  const searchParams = useSearchParams();
  const initialChannelRef = useRef<string | null>(searchParams.get("channel"));

  const [channels, setChannels] = useState<LiveTvChannel[]>([]);
  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  const [activeChannel, setActiveChannel] = useState<LiveTvChannel | null>(null);
  const [isUsingBackup, setIsUsingBackup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const playerStageRef = useRef<HTMLDivElement>(null);
  const catStripRef = useRef<HTMLDivElement>(null);

  // Hydrate favorites & recent channels from localStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem(FAV_STORAGE_KEY);
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedRecents = localStorage.getItem(RECENT_STORAGE_KEY);
      if (savedRecents) setRecentIds(JSON.parse(savedRecents));
    } catch {
      // ignore storage errors
    }
  }, []);

  // Load initial channel & category directory
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [channelsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/live-tv`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/live-tv/categories`).then((r) => r.json()),
        ]);

        const loadedChannels: LiveTvChannel[] =
          channelsRes?.data?.channels || [];
        const loadedCategories: LiveCategory[] = categoriesRes?.data || [];

        setChannels(loadedChannels);
        setCategories(loadedCategories);

        if (loadedChannels.length > 0) {
          let initial: LiveTvChannel | undefined;
          const targetSlug = initialChannelRef.current;
          if (targetSlug) {
            initial = loadedChannels.find(
              (c) => c.slug === targetSlug || c.id === targetSlug
            );
          }
          if (!initial) {
            initial =
              loadedChannels.find(
                (c) =>
                  c.category === "Sports" &&
                  c.name.toLowerCase().includes("t sports")
              ) ||
              loadedChannels.find((c) => c.category === "Bangladesh") ||
              loadedChannels[0];
          }
          setActiveChannel(initial);
        }
      } catch (err) {
        console.error("Failed to load live channels:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Smooth horizontal wheel scroll on category pills
  useEffect(() => {
    const el = catStripRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (
        Math.abs(e.deltaY) > Math.abs(e.deltaX) &&
        el.scrollWidth > el.clientWidth
      ) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.25;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [categories.length]);

  const recordRecent = (channelId: string) => {
    setRecentIds((prev) => {
      const next = [channelId, ...prev.filter((id) => id !== channelId)].slice(
        0,
        12
      );
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleChannelSelect = (channel: LiveTvChannel) => {
    setIsUsingBackup(false);
    setActiveChannel(channel);
    recordRecent(channel.id);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("channel", channel.slug);
      window.history.replaceState({}, "", url.toString());

      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 72, behavior: "smooth" });
      }
    }
  };

  const toggleFavorite = (channelId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setFavorites((prev) => {
      const next = prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [channelId, ...prev];
      try {
        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const filteredChannels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return channels.filter((ch) => {
      const matchesCategory =
        selectedCategory === "All"
          ? true
          : selectedCategory === "Favorites"
          ? favorites.includes(ch.id)
          : ch.category === selectedCategory;

      const matchesSearch =
        !q ||
        ch.name.toLowerCase().includes(q) ||
        ch.category.toLowerCase().includes(q) ||
        (ch.channelNumber && String(ch.channelNumber).includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [channels, selectedCategory, searchQuery, favorites]);

  // Quick-zap previous/next channel within current filtered list (or all channels)
  const zapList = filteredChannels.length > 1 ? filteredChannels : channels;
  const handleZap = (dir: "prev" | "next") => {
    if (!activeChannel || zapList.length === 0) return;
    const idx = zapList.findIndex((c) => c.id === activeChannel.id);
    const nextIdx =
      idx === -1
        ? 0
        : dir === "next"
        ? (idx + 1) % zapList.length
        : (idx - 1 + zapList.length) % zapList.length;
    handleChannelSelect(zapList[nextIdx]);
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = activeChannel
      ? `${window.location.origin}/live?channel=${activeChannel.slug}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handlePlayerFullscreen = () => {
    const el = playerStageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  };

  const quickStripChannels = useMemo(() => {
    const recentChannels = recentIds
      .map((id) => channels.find((c) => c.id === id))
      .filter((c): c is LiveTvChannel => !!c);

    if (recentChannels.length >= 6) return recentChannels;

    const featured = channels.filter(
      (c) =>
        (c.isFeatured || c.category === "Sports" || c.category === "Bangladesh") &&
        !recentChannels.some((r) => r.id === c.id)
    );
    return [...recentChannels, ...featured].slice(0, 14);
  }, [channels, recentIds]);

  const markLogoFailed = (id: string) => {
    setFailedLogos((prev) => ({ ...prev, [id]: true }));
  };

  const isActiveFav = activeChannel ? favorites.includes(activeChannel.id) : false;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07090e] pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      {/* 1. Studio Header Bar */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>BDIX Live Broadcast</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {channels.length} Channels Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-cinema-red" />
            <span>Live TV Studio</span>
          </h1>
        </div>

        {/* Studio Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              isTheaterMode
                ? "bg-cinema-cyan/15 border-cinema-cyan/50 text-cinema-cyan"
                : "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200"
            }`}
          >
            {isTheaterMode ? (
              <>
                <Columns2 className="w-3.5 h-3.5" />
                <span>Split View</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Theater Mode</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 transition"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={handlePlayerFullscreen}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* 2. Adaptive Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT STAGE: Cinema Player + Now Playing Broadcast Dock */}
        <div
          className={`min-w-0 ${
            isTheaterMode ? "lg:col-span-12" : "lg:col-span-8"
          } space-y-4`}
        >
          {/* Ambient Glow Player Frame */}
          <div ref={playerStageRef} className="relative group">
            <div className="pointer-events-none absolute -inset-2 bg-gradient-to-tr from-red-600/15 via-transparent to-cyan-500/10 rounded-3xl blur-2xl opacity-60" />

            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              {activeChannel ? (
                <LivePlayer
                  channel={activeChannel}
                  isUsingBackup={isUsingBackup}
                  onToggleBackup={() => setIsUsingBackup(!isUsingBackup)}
                  onNextChannel={() => handleZap("next")}
                />
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-cinema-red" />
                  <span className="text-xs font-medium">
                    Tuning broadcast feed...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Now Playing Broadcast Dock */}
          {activeChannel && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e121b]/95 border border-slate-800/90 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              {/* Left Channel Identity */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-white/10 p-1.5 flex items-center justify-center shadow-inner">
                  {activeChannel.logo && !failedLogos[activeChannel.id] ? (
                    <img
                      src={activeChannel.logo}
                      alt={activeChannel.name}
                      className="w-full h-full object-contain"
                      onError={() => markLogoFailed(activeChannel.id)}
                    />
                  ) : (
                    <Tv className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
                      {activeChannel.name}
                    </h2>
                    {activeChannel.channelNumber && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        CH #{activeChannel.channelNumber}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {activeChannel.quality || "HD 1080p"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-red-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>LIVE ON AIR</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-medium">
                      {activeChannel.category}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      HLS BDIX Ultra-Low Latency
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Broadcast Action Controls */}
              <div className="w-full xl:w-auto flex flex-wrap items-center gap-2">
                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(activeChannel.id, e)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    isActiveFav
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300"
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isActiveFav ? "fill-amber-400 text-amber-400" : ""
                    }`}
                  />
                  <span>{isActiveFav ? "Saved" : "Favorite"}</span>
                </button>

                {/* Prev / Next Channel Zap */}
                <div className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden">
                  <button
                    onClick={() => handleZap("prev")}
                    title="Previous Channel"
                    className="px-2.5 py-2 hover:bg-slate-800 text-slate-200 transition flex items-center gap-1 text-xs font-bold border-r border-slate-800"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    onClick={() => handleZap("next")}
                    title="Next Channel"
                    className="px-2.5 py-2 hover:bg-slate-800 text-slate-200 transition flex items-center gap-1 text-xs font-bold"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary / Backup Stream Switch */}
                {activeChannel.backupUrl ? (
                  <button
                    onClick={() => setIsUsingBackup(!isUsingBackup)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      isUsingBackup
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {isUsingBackup
                        ? "Server 2 (Backup)"
                        : "Server 1 (Primary)"}
                    </span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Server 1 (BDIX)</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT STAGE: Broadcast Channel Guide Panel */}
        <aside
          className={`min-w-0 ${
            isTheaterMode
              ? "lg:col-span-12"
              : "lg:col-span-4 lg:h-[560px] xl:h-[622px]"
          } rounded-2xl bg-[#0d111a]/95 border border-slate-800/90 shadow-2xl flex flex-col overflow-hidden`}
        >
          {/* Guide Header */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-800/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Channel Guide
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {filteredChannels.length}
                </span>
              </div>

              {/* Cards / EPG List View Toggle */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Visual Guide Cards"
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-cinema-red text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  title="EPG List View"
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-cinema-red text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={`Filter ${channels.length} channels by name or #...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070a10] border border-slate-800 focus:border-cinema-red/70 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Horizontally Scrollable Category Filter Strip */}
            <div
              ref={catStripRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 select-none"
            >
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                  selectedCategory === "All"
                    ? "bg-cinema-red text-white shadow-md shadow-red-900/30"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                All ({channels.length})
              </button>

              <button
                onClick={() => setSelectedCategory("Favorites")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition inline-flex items-center gap-1 ${
                  selectedCategory === "Favorites"
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-slate-900 text-amber-300/80 hover:text-amber-300 border border-slate-800"
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Favorites ({favorites.length})</span>
              </button>

              {categories.map((cat) => {
                const active = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                      active
                        ? "bg-cinema-red text-white shadow-md shadow-red-900/30"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Channel Guide Body */}
          <div className="flex-1 admin-sidebar-scroll p-3.5">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl bg-slate-900/70 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6">
                <Tv className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-300">
                  {selectedCategory === "Favorites"
                    ? "No favorite channels saved yet"
                    : "No channels match your filter"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedCategory === "Favorites"
                    ? "Click the ★ icon on any channel to pin it here."
                    : "Try clearing the search box or choosing All categories."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div
                className={`grid gap-2.5 ${
                  isTheaterMode
                    ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {filteredChannels.map((ch) => {
                  const isPlaying = activeChannel?.id === ch.id;
                  const isFav = favorites.includes(ch.id);

                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleChannelSelect(ch)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleChannelSelect(ch);
                        }
                      }}
                      className={`group relative rounded-xl p-2.5 cursor-pointer border transition-all duration-150 flex flex-col justify-between ${
                        isPlaying
                          ? "bg-red-950/30 border-red-500/80 ring-1 ring-red-500/40 shadow-lg shadow-red-950/30"
                          : "bg-[#131824] hover:bg-[#192030] border-slate-800/90 hover:border-slate-600"
                      }`}
                    >
                      {/* Top row: Channel # / Playing Eq / Favorite Star */}
                      <div className="flex items-center justify-between mb-1.5">
                        {isPlaying ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-400">
                            <LiveEqualizer />
                            <span>LIVE</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">
                            {ch.channelNumber ? `#${ch.channelNumber}` : "HD"}
                          </span>
                        )}

                        <button
                          onClick={(e) => toggleFavorite(ch.id, e)}
                          title={isFav ? "Remove favorite" : "Pin to favorites"}
                          className={`p-0.5 rounded transition ${
                            isFav
                              ? "text-amber-400 opacity-100"
                              : "text-slate-500 opacity-0 group-hover:opacity-100 hover:text-amber-300"
                          }`}
                        >
                          <Star
                            className={`w-3 h-3 ${isFav ? "fill-amber-400" : ""}`}
                          />
                        </button>
                      </div>

                      {/* Balanced Contrast Logo Container */}
                      <div className="w-full h-12 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08] p-1.5 flex items-center justify-center mb-2">
                        {ch.logo && !failedLogos[ch.id] ? (
                          <img
                            src={ch.logo}
                            alt={ch.name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain"
                            onError={() => markLogoFailed(ch.id)}
                          />
                        ) : (
                          <Tv className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      {/* Channel Name & Category */}
                      <div className="min-w-0 text-center">
                        <p
                          className={`text-[11px] font-bold truncate ${
                            isPlaying
                              ? "text-white"
                              : "text-slate-200 group-hover:text-white"
                          }`}
                        >
                          {ch.name}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">
                          {ch.category}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* EPG Compact List Mode */
              <div className="space-y-1.5">
                {filteredChannels.map((ch) => {
                  const isPlaying = activeChannel?.id === ch.id;
                  const isFav = favorites.includes(ch.id);

                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleChannelSelect(ch)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleChannelSelect(ch);
                        }
                      }}
                      className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer border transition-all duration-150 ${
                        isPlaying
                          ? "bg-red-950/30 border-red-500/80 ring-1 ring-red-500/40"
                          : "bg-[#131824] hover:bg-[#192030] border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 text-[10px] font-mono font-bold text-slate-500 text-center shrink-0">
                          {ch.channelNumber || "—"}
                        </span>
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10 p-1 flex items-center justify-center">
                          {ch.logo && !failedLogos[ch.id] ? (
                            <img
                              src={ch.logo}
                              alt={ch.name}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain"
                              onError={() => markLogoFailed(ch.id)}
                            />
                          ) : (
                            <Tv className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              isPlaying ? "text-white" : "text-slate-200"
                            }`}
                          >
                            {ch.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {ch.category} • {ch.quality || "HD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isPlaying && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-[10px] font-bold text-red-400">
                            <LiveEqualizer />
                            <span>ON AIR</span>
                          </span>
                        )}
                        <button
                          onClick={(e) => toggleFavorite(ch.id, e)}
                          className={`p-1 rounded-lg transition ${
                            isFav
                              ? "text-amber-400"
                              : "text-slate-500 hover:text-amber-300"
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              isFav ? "fill-amber-400" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. Quick Switch / Recently Watched Horizontal Strip */}
      {quickStripChannels.length > 0 && (
        <section className="mt-8 pt-6 border-t border-white/[0.07]">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cinema-cyan" />
              <span>
                {recentIds.length > 0
                  ? "Quick Switch & Recently Watched"
                  : "Featured Live Channels"}
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">
              1-click instant stream switch
            </span>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-2">
            {quickStripChannels.map((ch) => {
              const isPlaying = activeChannel?.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSelect(ch)}
                  className={`flex-none w-44 p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                    isPlaying
                      ? "bg-red-950/30 border-red-500/80 ring-1 ring-red-500/30"
                      : "bg-[#0e121b] hover:bg-[#151b28] border-slate-800/90 hover:border-slate-600"
                  }`}
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10 p-1 flex items-center justify-center">
                    {ch.logo && !failedLogos[ch.id] ? (
                      <img
                        src={ch.logo}
                        alt={ch.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                        onError={() => markLogoFailed(ch.id)}
                      />
                    ) : (
                      <Tv className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {ch.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {ch.category}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function LiveTvPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-cinema-red animate-spin" />
        </div>
      }
    >
      <LiveTvStudioContent />
    </Suspense>
  );
}
