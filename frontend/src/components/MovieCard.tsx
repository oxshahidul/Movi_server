"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Star, Plus, Check } from "lucide-react";
import { Movie } from "../types";
import { useAuthStore } from "../store/useAuthStore";
import { fetchApi } from "../lib/api";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { user, openAuthModal } = useAuthStore();
  const [isWatchlisted, setIsWatchlisted] = useState(movie.userState?.isWatchlisted || false);
  const [isToggling, setIsToggling] = useState(false);

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const posterUrl =
    movie.poster ||
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80";

  return (
    <div className="group relative flex-none w-36 sm:w-44 md:w-52 select-none">
      <Link href={`/movie/${movie.slug}`} className="block">
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-cinema-900 border border-cinema-700/50 shadow-md group-hover:shadow-2xl group-hover:border-cinema-600 transition-all duration-300 transform group-hover:-translate-y-1.5">
          {/* Poster Image */}
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            {movie.rating ? (
              <span className="flex items-center space-x-1 bg-black/60 backdrop-blur-md text-amber-300 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-white/10">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{movie.rating}</span>
              </span>
            ) : <span />}
            <span className="bg-cinema-red/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
              HD
            </span>
          </div>

          {/* Hover Overlay with Quick Play */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Link
                href={`/watch/movie/${movie.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-cinema-red hover:bg-cinema-red-hover flex items-center justify-center text-white shadow-lg transition transform hover:scale-110"
              >
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </Link>
              <button
                onClick={handleWatchlist}
                disabled={isToggling}
                title={isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
                className={`w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition ${
                  isWatchlisted
                    ? "bg-emerald-500/30 border-emerald-500 text-emerald-300"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
              >
                {isWatchlisted ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] font-medium text-slate-300 truncate">
              {movie.genres.map((g) => g.name).join(", ")}
            </p>
          </div>
        </div>

        {/* Card Title & Meta below poster */}
        <div className="mt-2.5 space-y-0.5">
          <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cinema-red transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center space-x-2 text-[11px] text-cinema-muted">
            {movie.releaseYear && <span>{movie.releaseYear}</span>}
            {movie.runtime && (
              <>
                <span>•</span>
                <span>{movie.runtime}m</span>
              </>
            )}
            {movie.language && (
              <>
                <span>•</span>
                <span className="text-[10px] uppercase">{movie.language}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
