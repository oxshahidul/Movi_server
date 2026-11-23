"use client";

import React from "react";
import Link from "next/link";
import { Play, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../lib/api";
import { WatchHistoryItem } from "../types";
import { useAuthStore } from "../store/useAuthStore";

export default function ContinueWatchingRow() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: historyItems } = useQuery<WatchHistoryItem[]>({
    queryKey: ["continue-watching"],
    queryFn: async () => {
      const res = await fetchApi("/watch-history/continue-watching");
      return res.data || [];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetchApi(`/watch-history/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["continue-watching"] });
    },
  });

  if (!user || !historyItems || historyItems.length === 0) {
    return null;
  }

  return (
    <section className="relative my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 mb-4">
        <span className="w-1.5 h-6 bg-cinema-cyan rounded-full inline-block" />
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Continue Watching
        </h2>
      </div>

      <div className="flex items-start space-x-4 sm:space-x-5 overflow-x-auto no-scrollbar scroll-smooth py-2">
        {historyItems.map((item) => {
          if (!item.media) return null;
          const percentage = item.durationSeconds
            ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
            : 0;

          const watchHref =
            item.contentType === "MOVIE"
              ? `/watch/movie/${item.media.slug}?resume=${item.progressSeconds}`
              : `/watch/series/${item.media.slug}?episode=${item.episodeId}&resume=${item.progressSeconds}`;

          const image = item.media.backdrop || item.media.poster || "";

          return (
            <div
              key={item.id}
              className="group relative flex-none w-56 sm:w-64 rounded-2xl overflow-hidden bg-cinema-900 border border-cinema-700/60 shadow-lg select-none"
            >
              <Link href={watchHref} className="block">
                {/* Backdrop Thumbnail */}
                <div className="relative aspect-video w-full bg-cinema-950 overflow-hidden">
                  <img
                    src={image}
                    alt={item.media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-cinema-red flex items-center justify-center text-white shadow-xl">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteMutation.mutate(item.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white transition"
                    title="Remove from history"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-cinema-red transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cinema-cyan transition">
                    {item.media.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-cinema-muted">
                    <span>
                      {item.contentType === "SERIES" && item.media.episode
                        ? `Ep ${item.media.episode.episodeNumber}`
                        : "Movie"}
                    </span>
                    <span>{percentage}% watched</span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
