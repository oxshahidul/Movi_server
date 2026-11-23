"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Plus, Check, Star, Clock, Info } from "lucide-react";
import { Movie } from "../types";
import { useAuthStore } from "../store/useAuthStore";
import { fetchApi } from "../lib/api";

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const { user, openAuthModal } = useAuthStore();
  const [isWatchlisted, setIsWatchlisted] = useState(movie.userState?.isWatchlisted || false);
  const [isToggling, setIsToggling] = useState(false);

  const handleWatchlistToggle = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    try {
      setIsToggling(true);
      const res = await fetchApi("/library/watchlist/toggle", {
        method: "POST",
        body: JSON.stringify({ contentId: movie.id, contentType: "MOVIE" }),
      });
      setIsWatchlisted(res.isWatchlisted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const backdropUrl =
    movie.backdrop ||
    movie.poster ||
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80";

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] min-h-[550px] overflow-hidden">
      {/* Background Backdrop Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      />

      {/* Cinematic Vignettes & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/70 to-transparent w-full md:w-3/4" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16 sm:pb-24 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="bg-cinema-red px-2.5 py-0.5 rounded-full font-bold text-white uppercase tracking-wider text-[10px]">
              Spotlight
            </span>
            {movie.rating && (
              <span className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{movie.rating}</span>
              </span>
            )}
            {movie.releaseYear && (
              <span className="bg-cinema-800/80 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                {movie.releaseYear}
              </span>
            )}
            {movie.runtime && (
              <span className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{movie.runtime} min</span>
              </span>
            )}
            <span className="border border-cinema-cyan/40 text-cinema-cyan text-[10px] font-bold px-1.5 py-0.5 rounded">
              4K ULTRA HD
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {movie.title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 text-xs text-cinema-muted">
            {movie.genres.map((g) => (
              <span key={g.id} className="text-slate-300">
                • {g.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed drop-shadow">
            {movie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/watch/movie/${movie.slug}`}
              className="flex items-center space-x-2 bg-cinema-red hover:bg-cinema-red-hover text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-cinema-red/40 transition transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white text-white" />
              <span>Watch Now</span>
            </Link>

            <button
              onClick={handleWatchlistToggle}
              disabled={isToggling}
              className={`flex items-center space-x-2 px-5 py-3 rounded-full border text-sm font-semibold transition backdrop-blur-md ${
                isWatchlisted
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-cinema-850/70 border-cinema-700/80 text-white hover:bg-cinema-800"
              }`}
            >
              {isWatchlisted ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isWatchlisted ? "In Watchlist" : "Watchlist"}</span>
            </button>

            <Link
              href={`/movie/${movie.slug}`}
              className="flex items-center space-x-2 px-4 py-3 rounded-full bg-cinema-800/60 hover:bg-cinema-800 border border-cinema-700/60 text-slate-300 hover:text-white transition"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
