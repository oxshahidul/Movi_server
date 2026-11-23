"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Heart, Film, ArrowRight } from "lucide-react";
import MovieCard from "../../components/MovieCard";
import SeriesCard from "../../components/SeriesCard";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";
import { Movie, Series } from "../../types";

export default function LibraryPage() {
  const { user, openAuthModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"watchlist" | "favorites">("watchlist");

  const { data: watchlistItems, isLoading: loadingWatchlist } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetchApi("/library/watchlist");
      return (res.data || []) as Array<{ id: string; contentType: string; media: Movie | Series }>;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-cinema-red/20 text-cinema-red mx-auto flex items-center justify-center">
          <Bookmark className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your Personal Streaming Library</h1>
        <p className="text-sm text-cinema-muted">
          Sign in to save movies and TV shows to your personal Watchlist and track your viewing across all your devices.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="bg-cinema-red hover:bg-cinema-red-hover text-white font-semibold text-sm px-6 py-3 rounded-full shadow-lg shadow-cinema-red/30 transition transform hover:scale-105"
        >
          Sign In to Access Library
        </button>
      </div>
    );
  }

  const items = watchlistItems || [];

  return (
    <div className="pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-cinema-700/60 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-2">
            <span className="w-2 h-7 bg-cinema-red rounded-full inline-block" />
            <span>My Library</span>
          </h1>
          <p className="text-sm text-cinema-muted mt-1">
            Manage your saved titles and favorites
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2 bg-cinema-900 p-1.5 rounded-2xl border border-cinema-700">
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "watchlist"
                ? "bg-cinema-red text-white shadow"
                : "text-cinema-muted hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watchlist ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {items.map((item) => {
            if (!item.media) return null;
            if (item.contentType === "MOVIE") {
              return <MovieCard key={item.id} movie={item.media as Movie} />;
            } else {
              return <SeriesCard key={item.id} series={item.media as Series} />;
            }
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-cinema-900/40 rounded-3xl border border-cinema-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cinema-800 text-cinema-muted mx-auto flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Your watchlist is currently empty</p>
            <p className="text-xs text-cinema-muted mt-1">
              Explore our movies and series catalog and add titles to watch later.
            </p>
          </div>
          <a
            href="/movies"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-cinema-red hover:underline"
          >
            <span>Explore Movies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
