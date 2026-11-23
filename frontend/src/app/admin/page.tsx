"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Film,
  Tv,
  Users,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Play,
  FileText,
  Layers,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";
import { Genre, Movie, Series } from "../../types";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, openAuthModal } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"overview" | "movies" | "series" | "users">("overview");

  // Movie Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState("");
  const [backdrop, setBackdrop] = useState("");
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear().toString());
  const [runtime, setRuntime] = useState("120");
  const [rating, setRating] = useState("8.5");
  const [language, setLanguage] = useState("English");
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [sourceName, setSourceName] = useState("Fast BDIX HLS");
  const [sourceUrl, setSourceUrl] = useState("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Series Form State
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesSlug, setSeriesSlug] = useState("");
  const [seriesDescription, setSeriesDescription] = useState("");
  const [seriesPoster, setSeriesPoster] = useState("");
  const [seriesBackdrop, setSeriesBackdrop] = useState("");
  const [seriesYear, setSeriesYear] = useState(new Date().getFullYear().toString());
  const [seriesGenreIds, setSeriesGenreIds] = useState<number[]>([]);
  const [seriesMsg, setSeriesMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Season & Episode Form State
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("1");
  const [seasonTitle, setSeasonTitle] = useState("Season 1");
  const [epNumber, setEpNumber] = useState("1");
  const [epTitle, setEpTitle] = useState("");
  const [epSlug, setEpSlug] = useState("");
  const [epUrl, setEpUrl] = useState("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");

  // Queries
  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetchApi("/admin/stats");
      return res.data;
    },
    enabled: !!user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN"),
  });

  const { data: moviesList } = useQuery({
    queryKey: ["admin-movies"],
    queryFn: async () => {
      const res = await fetchApi("/movies?limit=50");
      return (res.data || []) as Movie[];
    },
    enabled: !!user,
  });

  const { data: seriesList } = useQuery({
    queryKey: ["admin-series"],
    queryFn: async () => {
      const res = await fetchApi("/series?limit=50");
      return (res.data || []) as Series[];
    },
    enabled: !!user,
  });

  const { data: genresList } = useQuery({
    queryKey: ["admin-genres"],
    queryFn: async () => {
      const res = await fetchApi("/genres");
      return (res.data || []) as Genre[];
    },
    enabled: !!user,
  });

  const { data: usersList } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetchApi("/admin/users");
      return res.data || [];
    },
    enabled: !!user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN"),
  });

  // Movie Mutations
  const createMovieMutation = useMutation({
    mutationFn: async () => {
      return await fetchApi("/admin/movies", {
        method: "POST",
        body: JSON.stringify({
          title,
          slug,
          description,
          poster,
          backdrop,
          releaseYear: parseInt(releaseYear, 10),
          runtime: parseInt(runtime, 10),
          rating: parseFloat(rating),
          language,
          genreIds: selectedGenreIds,
          videoSources: [{ sourceName, sourceUrl, quality: "1080p", format: "HLS" }],
        }),
      });
    },
    onSuccess: () => {
      setFormMsg({ type: "success", text: "Movie published successfully!" });
      setTitle("");
      setSlug("");
      setDescription("");
      setPoster("");
      setBackdrop("");
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: any) => {
      setFormMsg({ type: "error", text: err.message || "Failed to create movie" });
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetchApi(`/admin/movies/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  // Series Mutation
  const createSeriesMutation = useMutation({
    mutationFn: async () => {
      return await fetchApi("/admin/series", {
        method: "POST",
        body: JSON.stringify({
          title: seriesTitle,
          slug: seriesSlug,
          description: seriesDescription,
          poster: seriesPoster,
          backdrop: seriesBackdrop,
          releaseYear: parseInt(seriesYear, 10),
          rating: 8.5,
          genreIds: seriesGenreIds,
        }),
      });
    },
    onSuccess: () => {
      setSeriesMsg({ type: "success", text: "TV Series created successfully!" });
      setSeriesTitle("");
      setSeriesSlug("");
      setSeriesDescription("");
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: any) => {
      setSeriesMsg({ type: "error", text: err.message || "Failed to create series" });
    },
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetchApi(`/admin/series/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "CONTENT_MANAGER")) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Administrator Access Required</h1>
        <p className="text-xs text-cinema-muted">
          You must be signed in with an administrative account (<span className="text-white font-mono">admin@screenbox.com</span>) to view this dashboard.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-6 py-3 rounded-full transition shadow-lg shadow-amber-500/20"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cinema-700/60 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            ScreenBox Management
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-cinema-900 p-1.5 rounded-2xl border border-cinema-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "overview"
                ? "bg-amber-500 text-black shadow font-bold"
                : "text-cinema-muted hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("movies")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "movies"
                ? "bg-amber-500 text-black shadow font-bold"
                : "text-cinema-muted hover:text-white"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveTab("series")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "series"
                ? "bg-amber-500 text-black shadow font-bold"
                : "text-cinema-muted hover:text-white"
            }`}
          >
            TV Series
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "users"
                ? "bg-amber-500 text-black shadow font-bold"
                : "text-cinema-muted hover:text-white"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD & AUDIT LOGS */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-cinema-900/80 border border-cinema-700/60 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-cinema-red/20 text-cinema-red flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
              <p className="text-xs text-cinema-muted">Total Movies</p>
              <h3 className="text-3xl font-black text-white">{statsData?.totalMovies ?? "..."}</h3>
            </div>

            <div className="p-6 rounded-3xl bg-cinema-900/80 border border-cinema-700/60 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-cinema-cyan/20 text-cinema-cyan flex items-center justify-center">
                <Tv className="w-5 h-5" />
              </div>
              <p className="text-xs text-cinema-muted">TV Series</p>
              <h3 className="text-3xl font-black text-white">{statsData?.totalSeries ?? "..."}</h3>
            </div>

            <div className="p-6 rounded-3xl bg-cinema-900/80 border border-cinema-700/60 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs text-cinema-muted">Active Users</p>
              <h3 className="text-3xl font-black text-white">{statsData?.totalUsers ?? "..."}</h3>
            </div>

            <div className="p-6 rounded-3xl bg-cinema-900/80 border border-cinema-700/60 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <p className="text-xs text-cinema-muted">Streaming Views</p>
              <h3 className="text-3xl font-black text-white">{statsData?.totalViews ?? "..."}</h3>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="p-6 rounded-3xl bg-cinema-900/50 border border-cinema-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cinema-cyan" />
              <span>Recent Administrative Audit Logs</span>
            </h3>
            <div className="divide-y divide-cinema-800/80 text-xs">
              {statsData?.auditLogs && statsData.auditLogs.length > 0 ? (
                statsData.auditLogs.map((log: any) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-amber-400 font-semibold">{log.action}</span>
                      <span className="text-cinema-muted ml-2">{log.details || log.entityType}</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-cinema-muted py-2">No administrative actions logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIES */}
      {activeTab === "movies" && (
        <div className="space-y-10">
          <div className="p-6 sm:p-8 rounded-3xl bg-cinema-900/80 border border-cinema-700/60 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Add New Movie to ScreenBox</span>
            </h2>

            {formMsg && (
              <div
                className={`p-4 rounded-2xl flex items-center space-x-2 text-xs ${
                  formMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}
              >
                {formMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{formMsg.text}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMovieMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Movie Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gladiator II"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                    }}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    placeholder="gladiator-ii"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Storyline / Synopsis</label>
                <textarea
                  rows={3}
                  placeholder="Plot summary of the film..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={poster}
                    onChange={(e) => setPoster(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Backdrop Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={backdrop}
                    onChange={(e) => setBackdrop(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Release Year</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Runtime (min)</label>
                  <input
                    type="number"
                    value={runtime}
                    onChange={(e) => setRuntime(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Server Source Name</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Streaming Video URL (.m3u8 or .mp4)</label>
                  <input
                    type="url"
                    required
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              {genresList && (
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-semibold text-cinema-muted">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {genresList.map((g) => {
                      const selected = selectedGenreIds.includes(g.id);
                      return (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => {
                            if (selected) {
                              setSelectedGenreIds(selectedGenreIds.filter((id) => id !== g.id));
                            } else {
                              setSelectedGenreIds([...selectedGenreIds, g.id]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            selected
                              ? "bg-amber-500 text-black shadow"
                              : "bg-cinema-950 border border-cinema-700 text-cinema-muted hover:text-white"
                          }`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={createMovieMutation.isPending}
                className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {createMovieMutation.isPending ? "Publishing..." : "Save & Publish Movie"}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-3xl bg-cinema-900/60 border border-cinema-800 space-y-4">
            <h3 className="text-base font-bold text-white">Current Movie Catalog ({moviesList?.length || 0})</h3>
            <div className="divide-y divide-cinema-800">
              {moviesList?.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={m.poster || ""}
                      alt={m.title}
                      className="w-10 h-14 object-cover rounded-lg bg-cinema-950"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{m.title}</h4>
                      <p className="text-xs text-cinema-muted">
                        {m.releaseYear} • {m.language} • Rating: {m.rating}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={`/watch/movie/${m.slug}`}
                      className="p-2 rounded-lg bg-cinema-800 text-cinema-cyan hover:bg-cinema-700"
                      title="Test stream"
                    >
                      <Play className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deleteMovieMutation.mutate(m.id)}
                      className="p-2 rounded-lg bg-cinema-800 text-rose-400 hover:bg-rose-900/50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TV SERIES & SEASONS */}
      {activeTab === "series" && (
        <div className="space-y-10">
          <div className="p-6 sm:p-8 rounded-3xl bg-cinema-900/80 border border-cinema-700/60 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-cinema-cyan" />
              <span>Create TV Series</span>
            </h2>

            {seriesMsg && (
              <div
                className={`p-4 rounded-2xl flex items-center space-x-2 text-xs ${
                  seriesMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}
              >
                {seriesMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{seriesMsg.text}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSeriesMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Series Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dark Matter"
                    value={seriesTitle}
                    onChange={(e) => {
                      setSeriesTitle(e.target.value);
                      setSeriesSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                    }}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    placeholder="dark-matter"
                    value={seriesSlug}
                    onChange={(e) => setSeriesSlug(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Description / Overview</label>
                <textarea
                  rows={3}
                  value={seriesDescription}
                  onChange={(e) => setSeriesDescription(e.target.value)}
                  className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Poster URL</label>
                  <input
                    type="url"
                    value={seriesPoster}
                    onChange={(e) => setSeriesPoster(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Backdrop URL</label>
                  <input
                    type="url"
                    value={seriesBackdrop}
                    onChange={(e) => setSeriesBackdrop(e.target.value)}
                    className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createSeriesMutation.isPending}
                className="py-3 px-6 rounded-xl bg-cinema-cyan hover:bg-cyan-500 text-black font-bold text-sm transition disabled:opacity-50"
              >
                {createSeriesMutation.isPending ? "Creating..." : "Save TV Series"}
              </button>
            </form>
          </div>

          {/* Series Catalog */}
          <div className="p-6 rounded-3xl bg-cinema-900/60 border border-cinema-800 space-y-4">
            <h3 className="text-base font-bold text-white">Current TV Series ({seriesList?.length || 0})</h3>
            <div className="divide-y divide-cinema-800">
              {seriesList?.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={s.poster || ""}
                      alt={s.title}
                      className="w-10 h-14 object-cover rounded-lg bg-cinema-950"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{s.title}</h4>
                      <p className="text-xs text-cinema-muted">
                        {s.releaseYear} • {s.totalSeasons || 1} Season(s) • Rating: {s.rating}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteSeriesMutation.mutate(s.id)}
                      className="p-2 rounded-lg bg-cinema-800 text-rose-400 hover:bg-rose-900/50"
                      title="Delete Series"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USERS TABLE */}
      {activeTab === "users" && (
        <div className="p-6 rounded-3xl bg-cinema-900/60 border border-cinema-800 space-y-4">
          <h3 className="text-base font-bold text-white">Registered Users ({usersList?.length || 0})</h3>
          <div className="divide-y divide-cinema-800">
            {usersList?.map((u: any) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-cinema-muted">{u.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {u.role}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">{u.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
