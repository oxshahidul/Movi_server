"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Star, Plus, Check } from "lucide-react";
import { Series } from "../types";
import { useAuthStore } from "../store/useAuthStore";
import { fetchApi } from "../lib/api";

interface SeriesCardProps {
  series: Series;
}

export default function SeriesCard({ series }: SeriesCardProps) {
  const { user, openAuthModal } = useAuthStore();
  const [isWatchlisted, setIsWatchlisted] = useState(series.userState?.isWatchlisted || false);
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
        body: JSON.stringify({ contentId: series.id, contentType: "SERIES" }),
      });
      setIsWatchlisted(res.isWatchlisted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const posterUrl =
    series.poster ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";

  return (
    <div className="group relative flex-none w-36 sm:w-44 md:w-52 select-none">
      <Link href={`/series/${series.slug}`} className="block">
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-cinema-900 border border-cinema-700/50 shadow-md group-hover:shadow-2xl group-hover:border-cinema-600 transition-all duration-300 transform group-hover:-translate-y-1.5">
          <img
            src={posterUrl}
            alt={series.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            {series.rating ? (
              <span className="flex items-center space-x-1 bg-black/60 backdrop-blur-md text-amber-300 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-white/10">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{series.rating}</span>
              </span>
            ) : <span />}
            <span className="bg-cinema-cyan/90 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
              SERIES
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-cinema-red hover:bg-cinema-red-hover flex items-center justify-center text-white shadow-lg transition transform hover:scale-110">
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </div>
              <button
                onClick={handleWatchlist}
                disabled={isToggling}
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
              {series.genres.map((g) => g.name).join(", ")}
            </p>
          </div>
        </div>

        <div className="mt-2.5 space-y-0.5">
          <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cinema-cyan transition-colors">
            {series.title}
          </h3>
          <div className="flex items-center space-x-2 text-[11px] text-cinema-muted">
            {series.releaseYear && <span>{series.releaseYear}</span>}
            {series.totalSeasons && (
              <>
                <span>•</span>
                <span>{series.totalSeasons} Season{series.totalSeasons > 1 ? "s" : ""}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
