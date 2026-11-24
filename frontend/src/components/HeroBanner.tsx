"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Plus, Check, Star, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "../types";
import { useAuthStore } from "../store/useAuthStore";
import { fetchApi } from "../lib/api";

interface HeroBannerProps {
  movies: Movie[];
}

export default function HeroBanner({ movies }: HeroBannerProps) {
  const { user, openAuthModal } = useAuthStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const playlist = movies && movies.length > 0 ? movies.slice(0, 5) : [];
  const currentMovie = playlist[activeIndex] || playlist[0];

  useEffect(() => {
    if (currentMovie) {
      setIsWatchlisted(Boolean(currentMovie.userState?.isWatchlisted));
    }
  }, [currentMovie]);

  // Auto slide every 7 seconds
  useEffect(() => {
    if (playlist.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % playlist.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [playlist.length]);

  if (!currentMovie) return null;

  const handleWatchlistToggle = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    try {
      setIsToggling(true);
      const res = await fetchApi("/library/watchlist/toggle", {
        method: "POST",
        body: JSON.stringify({ contentId: currentMovie.id, contentType: "MOVIE" }),
      });
      setIsWatchlisted(res.isWatchlisted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const backdropUrl =
    currentMovie.backdrop ||
    currentMovie.poster ||
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80";

  return (
    <div className="relative w-full h-[72vh] sm:h-[82vh] min-h-[580px] overflow-hidden select-none bg-neutral-950">
      {/* Background Backdrop Image with smooth fade on slide change */}
      <div
        key={currentMovie.id}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105 animate-in fade-in"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      />

      {/* iScreen-Inspired Vignette Overlays: bottom deep dark & left subtle spotlight */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent w-full md:w-3/4" />

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-14 sm:pb-20 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="bg-[#e50914] px-3 py-0.5 rounded-full font-black text-white uppercase tracking-wider text-[10px] shadow-sm">
              Spotlight
            </span>
            {currentMovie.rating && (
              <span className="flex items-center space-x-1 bg-black/60 backdrop-blur-md text-amber-300 border border-white/10 px-2 py-0.5 rounded-md font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentMovie.rating}</span>
              </span>
            )}
            {currentMovie.releaseYear && (
              <span className="bg-white/10 backdrop-blur-md text-slate-200 px-2 py-0.5 rounded-md font-medium">
                {currentMovie.releaseYear}
              </span>
            )}
            <span className="border border-[#00c853]/60 text-[#00c853] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#00c853]/10">
              4K ULTRA HD
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {currentMovie.title}
          </h1>

          {/* Genres / Tags */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
            {currentMovie.genres?.map((g) => (
              <span key={g.id} className="text-slate-300">
                • {g.name}
              </span>
            ))}
            {currentMovie.language && (
              <span className="text-slate-400">• {currentMovie.language}</span>
            )}
          </div>

          {/* Overview */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            {currentMovie.description}
          </p>

          {/* iScreen-Inspired Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href={`/watch/movie/${currentMovie.slug}`}
              className="flex items-center space-x-2 bg-[#e50914] hover:bg-[#b80710] text-white font-black text-sm uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-lg shadow-[#e50914]/40 transition transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>PLAY</span>
            </Link>

            <button
              onClick={handleWatchlistToggle}
              disabled={isToggling}
              aria-label="Add to Watchlist"
              className={`w-12 h-12 rounded-xl flex items-center justify-center border backdrop-blur-md transition ${
                isWatchlisted
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              {isWatchlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>

            <Link
              href={`/movie/${currentMovie.slug}`}
              aria-label="Movie details"
              className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition backdrop-blur-md"
            >
              <Info className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* iScreen-Style Bottom Right Slider Indicator Dashes */}
        {playlist.length > 1 && (
          <div className="absolute bottom-6 right-6 sm:right-10 flex items-center space-x-2 z-20">
            {playlist.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 h-1.5 rounded-full ${
                  idx === activeIndex
                    ? "w-8 bg-[#e50914] shadow-[0_0_8px_#e50914]"
                    : "w-4 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
