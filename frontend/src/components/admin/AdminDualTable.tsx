"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Edit2,
  Tv,
  Film,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  X,
  Radio,
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext";

export interface ChannelItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  category: string;
  serversCount: number;
  isActive: boolean;
  status: string;
}

export interface MovieItem {
  id: string;
  title: string;
  slug: string;
  poster: string | null;
  rating: string;
  views: number;
  isPublished: boolean;
  status: string;
}

interface DualTableProps {
  channels: ChannelItem[];
  movies: MovieItem[];
  channelsLoading: boolean;
  moviesLoading: boolean;
  channelSearch: string;
  movieSearch: string;
  onChannelSearchChange: (val: string) => void;
  onMovieSearchChange: (val: string) => void;
  onToggleChannel: (id: string) => Promise<void>;
  onToggleMovie: (id: string) => Promise<void>;
  channelPage: number;
  channelTotalPages: number;
  onChannelPageChange: (page: number) => void;
  moviePage: number;
  movieTotalPages: number;
  onMoviePageChange: (page: number) => void;
  onEditChannel?: (channel: ChannelItem) => void;
}

export default function AdminDualTable({
  channels,
  movies,
  channelsLoading,
  moviesLoading,
  channelSearch,
  movieSearch,
  onChannelSearchChange,
  onMovieSearchChange,
  onToggleChannel,
  onToggleMovie,
  channelPage,
  channelTotalPages,
  onChannelPageChange,
  moviePage,
  movieTotalPages,
  onMoviePageChange,
  onEditChannel,
}: DualTableProps) {
  const { isDark } = useAdminTheme();
  const [togglingChannelId, setTogglingChannelId] = useState<string | null>(null);
  const [togglingMovieId, setTogglingMovieId] = useState<string | null>(null);

  // Optimistic local toggle states
  const [localChannelOverrides, setLocalChannelOverrides] = useState<{ [id: string]: boolean }>({});
  const [localMovieOverrides, setLocalMovieOverrides] = useState<{ [id: string]: boolean }>({});

  const handleChannelToggle = async (id: string, currentState: boolean) => {
    // Instant optimistic UI switch
    setLocalChannelOverrides((prev) => ({ ...prev, [id]: !currentState }));
    setTogglingChannelId(id);
    try {
      await onToggleChannel(id);
    } catch {
      // Revert if failed
      setLocalChannelOverrides((prev) => ({ ...prev, [id]: currentState }));
    } finally {
      setTogglingChannelId(null);
    }
  };

  const handleMovieToggle = async (id: string, currentState: boolean) => {
    // Instant optimistic UI switch
    setLocalMovieOverrides((prev) => ({ ...prev, [id]: !currentState }));
    setTogglingMovieId(id);
    try {
      await onToggleMovie(id);
    } catch {
      // Revert if failed
      setLocalMovieOverrides((prev) => ({ ...prev, [id]: currentState }));
    } finally {
      setTogglingMovieId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 select-none">
      {/* =========================================
          LEFT TABLE: LIVE CHANNELS
      ========================================= */}
      <div
        className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
          isDark
            ? "bg-[#0f141c] border-slate-800/90 text-white shadow-lg shadow-black/20"
            : "bg-white border-slate-200/80 text-slate-900 shadow-xs"
        }`}
      >
        <div>
          {/* Header & Search Bar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-emerald-950/60 border-emerald-900/60"
                    : "bg-emerald-50 border-emerald-100"
                }`}
              >
                <Tv className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Live Channels
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">BDIX stream toggle & routing</p>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative w-full max-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={channelSearch}
                onChange={(e) => onChannelSearchChange(e.target.value)}
                placeholder="Search..."
                className={`w-full pl-8 pr-7 py-1.5 text-xs font-medium rounded-xl border focus:outline-none transition-all ${
                  isDark
                    ? "bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-850 text-white border-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 placeholder-slate-500"
                    : "bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 placeholder-slate-400"
                }`}
              />
              {channelSearch && (
                <button
                  onClick={() => onChannelSearchChange("")}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 transition-colors ${
                    isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr
                  className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-400"
                  }`}
                >
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-2 text-center">Servers</th>
                  <th className="py-2.5 px-3 text-center">Active</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-50"}`}>
                {channelsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#f40638] mb-1.5" />
                      Loading live channels...
                    </td>
                  </tr>
                ) : channels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No channels found matching &quot;{channelSearch}&quot;
                    </td>
                  </tr>
                ) : (
                  channels.map((ch) => {
                    const isActive =
                      localChannelOverrides[ch.id] !== undefined
                        ? localChannelOverrides[ch.id]
                        : ch.isActive;
                    const isToggling = togglingChannelId === ch.id;

                    return (
                      <tr
                        key={ch.id}
                        className={`transition-colors group ${
                          isDark ? "hover:bg-slate-900/60" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Channel logo & name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border ${
                                isDark
                                  ? "bg-slate-900 border-slate-800"
                                  : "bg-slate-50 border-slate-200/60"
                              }`}
                            >
                              {ch.logo ? (
                                <img
                                  src={ch.logo}
                                  alt={ch.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <Tv className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <span
                              className={`font-bold transition-colors truncate max-w-[130px] sm:max-w-[160px] ${
                                isDark
                                  ? "text-white group-hover:text-red-400"
                                  : "text-slate-900 group-hover:text-red-600"
                              }`}
                            >
                              {ch.name}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border truncate max-w-[100px] ${
                              isDark
                                ? "text-rose-400 bg-rose-950/60 border-rose-900/60"
                                : "text-[#f40638] bg-red-50/80 border-red-100/80"
                            }`}
                          >
                            {ch.category}
                          </span>
                        </td>

                        {/* Servers count */}
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border font-mono ${
                              isDark
                                ? "text-emerald-400 bg-emerald-950/60 border-emerald-900/60"
                                : "text-emerald-700 bg-emerald-50 border-emerald-100"
                            }`}
                          >
                            {ch.serversCount}
                          </span>
                        </td>

                        {/* Active toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleChannelToggle(ch.id, isActive)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                              isActive
                                ? "bg-[#f40638] shadow-xs"
                                : isDark
                                ? "bg-slate-800"
                                : "bg-slate-200"
                            } disabled:opacity-70`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-0.5 ${
                                isActive ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-slate-400">
                            <Link
                              href={`/live?channel=${ch.slug}`}
                              target="_blank"
                              title="Preview Live Stream"
                              className={`p-1 rounded-lg transition-colors ${
                                isDark
                                  ? "hover:text-red-400 hover:bg-slate-800"
                                  : "hover:text-red-600 hover:bg-slate-100"
                              }`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => onEditChannel?.(ch)}
                              title="Edit Channel Details"
                              className={`p-1 rounded-lg transition-colors ${
                                isDark
                                  ? "hover:text-white hover:bg-slate-800"
                                  : "hover:text-slate-800 hover:bg-slate-100"
                              }`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Channels Pagination */}
        <div
          className={`mt-4 pt-3.5 border-t flex items-center justify-between text-xs font-medium ${
            isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
          }`}
        >
          <span>
            Page <strong className={isDark ? "text-white" : "text-slate-800"}>{channelPage}</strong> of {channelTotalPages || 1}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChannelPageChange(channelPage - 1)}
              disabled={channelPage <= 1}
              className={`p-1.5 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                isDark
                  ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChannelPageChange(channelPage + 1)}
              disabled={channelPage >= channelTotalPages}
              className={`p-1.5 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                isDark
                  ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT TABLE: VOD MOVIES
      ========================================= */}
      <div
        className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
          isDark
            ? "bg-[#0f141c] border-slate-800/90 text-white shadow-lg shadow-black/20"
            : "bg-white border-slate-200/80 text-slate-900 shadow-xs"
        }`}
      >
        <div>
          {/* Header & Search Bar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                  isDark ? "bg-rose-950/60 border-rose-900/60" : "bg-red-50 border-red-100"
                }`}
              >
                <Film className="w-4 h-4 text-[#f40638]" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  VOD Movies
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Catalog publication & rating</p>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative w-full max-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={movieSearch}
                onChange={(e) => onMovieSearchChange(e.target.value)}
                placeholder="Search..."
                className={`w-full pl-8 pr-7 py-1.5 text-xs font-medium rounded-xl border focus:outline-none transition-all ${
                  isDark
                    ? "bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-850 text-white border-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 placeholder-slate-500"
                    : "bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 placeholder-slate-400"
                }`}
              />
              {movieSearch && (
                <button
                  onClick={() => onMovieSearchChange("")}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 transition-colors ${
                    isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr
                  className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-400"
                  }`}
                >
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Views</th>
                  <th className="py-2.5 px-3 text-center">Published</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-50"}`}>
                {moviesLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#f40638] mb-1.5" />
                      Loading movies...
                    </td>
                  </tr>
                ) : movies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No movies found matching &quot;{movieSearch}&quot;
                    </td>
                  </tr>
                ) : (
                  movies.map((m) => {
                    const isPublished =
                      localMovieOverrides[m.id] !== undefined
                        ? localMovieOverrides[m.id]
                        : m.isPublished;
                    const isToggling = togglingMovieId === m.id;

                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors group ${
                          isDark ? "hover:bg-slate-900/60" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Poster & title */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-10 rounded-md overflow-hidden shrink-0 shadow-2xs border ${
                                isDark
                                  ? "bg-slate-900 border-slate-800"
                                  : "bg-slate-100 border-slate-200/60"
                              }`}
                            >
                              {m.poster ? (
                                <img
                                  src={m.poster}
                                  alt={m.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <Film className="w-3.5 h-3.5 text-slate-400 m-auto mt-3" />
                              )}
                            </div>
                            <span
                              className={`font-bold transition-colors truncate max-w-[130px] sm:max-w-[180px] ${
                                isDark
                                  ? "text-white group-hover:text-red-400"
                                  : "text-slate-900 group-hover:text-red-600"
                              }`}
                            >
                              {m.title}
                            </span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 font-bold text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{m.rating}</span>
                          </div>
                        </td>

                        {/* Views */}
                        <td
                          className={`py-3 px-3 font-bold font-mono ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          <span>{m.views}</span>
                        </td>

                        {/* Published toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleMovieToggle(m.id, isPublished)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                              isPublished
                                ? "bg-[#f40638] shadow-xs"
                                : isDark
                                ? "bg-slate-800"
                                : "bg-slate-200"
                            } disabled:opacity-70`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-0.5 ${
                                isPublished ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-2 text-right">
                          <Link
                            href={`/movie/${m.slug}`}
                            target="_blank"
                            title="Preview Movie Page"
                            className={`p-1 inline-block rounded-lg transition-colors ${
                              isDark
                                ? "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                : "text-slate-400 hover:text-red-600 hover:bg-slate-100"
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movies Pagination */}
        <div
          className={`mt-4 pt-3.5 border-t flex items-center justify-between text-xs font-medium ${
            isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
          }`}
        >
          <span>
            Page <strong className={isDark ? "text-white" : "text-slate-800"}>{moviePage}</strong> of {movieTotalPages || 1}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onMoviePageChange(moviePage - 1)}
              disabled={moviePage <= 1}
              className={`p-1.5 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                isDark
                  ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoviePageChange(moviePage + 1)}
              disabled={moviePage >= movieTotalPages}
              className={`p-1.5 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                isDark
                  ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
