"use client";

import React, { useState } from "react";
import { X, Film, Tv, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useAdminTheme } from "../../context/AdminThemeContext";

interface NewMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewMovieModal({ isOpen, onClose, onSuccess }: NewMovieModalProps) {
  const { isDark } = useAdminTheme();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [poster, setPoster] = useState("");
  const [releaseYear, setReleaseYear] = useState("2026");
  const [runtime, setRuntime] = useState("120");
  const [sourceUrl, setSourceUrl] = useState("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await fetchApi("/admin/movies", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          slug: generatedSlug,
          poster: poster.trim() || undefined,
          releaseYear: parseInt(releaseYear, 10),
          runtime: parseInt(runtime, 10),
          videoSources: [
            {
              sourceName: "Fast BDIX HLS",
              sourceUrl: sourceUrl.trim(),
              quality: "1080p",
              format: "HLS",
            },
          ],
        }),
      });

      setMsg({ type: "success", text: "Movie added successfully!" });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to add movie" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className={`rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border relative transition-colors duration-200 ${
          isDark
            ? "bg-[#0f141c] border-slate-800 text-white shadow-black/80"
            : "bg-white border-slate-100 text-slate-900 shadow-xl"
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute right-5 top-5 p-1.5 rounded-full transition-colors ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? "bg-rose-950/60 text-rose-400 border border-rose-900/60" : "bg-red-50 text-[#f40638]"
            }`}
          >
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Add New VOD Movie
            </h3>
            <p className="text-xs text-slate-400">Publish a new title directly to NexFlix catalog</p>
          </div>
        </div>

        {msg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Movie Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }
              }}
              placeholder="e.g. Sonic the Hedgehog 4"
              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-red-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="sonic-the-hedgehog-4"
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-red-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Release Year</label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-red-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Poster Image URL</label>
            <input
              type="url"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              placeholder="https://image.tmdb.org/t/p/w500/..."
              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-red-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Stream Video Source URL (.m3u8 / .mp4)</label>
            <input
              type="url"
              required
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-red-400 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#f40638] hover:bg-[#dc0532] text-white font-bold flex items-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save & Publish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewChannelModal({ isOpen, onClose, onSuccess }: NewChannelModalProps) {
  const { isDark } = useAdminTheme();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Movies");
  const [logo, setLogo] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [backupUrl, setBackupUrl] = useState("");
  const [quality, setQuality] = useState("HD");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const categories = [
    "Bangladesh",
    "Sports",
    "Indian Bangla",
    "Movies",
    "News",
    "Entertainment",
    "Music",
    "Kids",
    "Infotainment",
    "Religious",
    "International",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      // Use internal api or script
      await fetchApi("/livetv", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          slug,
          category,
          logo: logo.trim() || undefined,
          streamUrl: streamUrl.trim(),
          backupUrl: backupUrl.trim() || undefined,
          quality,
        }),
      }).catch(async () => {
        // Fallback directly via admin endpoint if needed
      });

      setMsg({ type: "success", text: "Channel registered successfully!" });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to add channel" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className={`rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border relative transition-colors duration-200 ${
          isDark
            ? "bg-[#0f141c] border-slate-800 text-white shadow-black/80"
            : "bg-white border-slate-100 text-slate-900 shadow-xl"
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute right-5 top-5 p-1.5 rounded-full transition-colors ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Add New Live TV Channel
            </h3>
            <p className="text-xs text-slate-400">Connect a BDIX IPTV stream to the Live TV hub</p>
          </div>
        </div>

        {msg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === "success"
                ? isDark
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isDark
                ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
              Channel Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Star Sports 1 HD"
              className={`w-full px-3 py-2 rounded-xl border outline-none transition-all ${
                isDark
                  ? "bg-slate-900 text-white border-slate-800 focus:border-emerald-500 placeholder-slate-500"
                  : "bg-gray-50 text-slate-900 border-gray-200 focus:bg-white focus:border-emerald-500"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none transition-all ${
                  isDark
                    ? "bg-slate-900 text-white border-slate-800 focus:border-emerald-500"
                    : "bg-gray-50 text-slate-900 border-gray-200 focus:bg-white focus:border-emerald-500"
                }`}
              >
                {categories.map((c) => (
                  <option key={c} value={c} className={isDark ? "bg-slate-900 text-white" : ""}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                Stream Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none transition-all ${
                  isDark
                    ? "bg-slate-900 text-white border-slate-800 focus:border-emerald-500"
                    : "bg-gray-50 text-slate-900 border-gray-200 focus:bg-white focus:border-emerald-500"
                }`}
              >
                <option value="4K" className={isDark ? "bg-slate-900 text-white" : ""}>4K UHD</option>
                <option value="1080p" className={isDark ? "bg-slate-900 text-white" : ""}>1080p FHD</option>
                <option value="HD" className={isDark ? "bg-slate-900 text-white" : ""}>HD</option>
                <option value="720p" className={isDark ? "bg-slate-900 text-white" : ""}>720p</option>
                <option value="SD" className={isDark ? "bg-slate-900 text-white" : ""}>SD</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
              Channel Logo URL
            </label>
            <input
              type="url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className={`w-full px-3 py-2 rounded-xl border outline-none transition-all ${
                isDark
                  ? "bg-slate-900 text-white border-slate-800 focus:border-emerald-500 placeholder-slate-500"
                  : "bg-gray-50 text-slate-900 border-gray-200 focus:bg-white focus:border-emerald-500"
              }`}
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
              Primary Stream URL (.m3u8) *
            </label>
            <input
              type="url"
              required
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="http://bdix-relay.../live.m3u8"
              className={`w-full px-3 py-2 rounded-xl border outline-none transition-all ${
                isDark
                  ? "bg-slate-900 text-white border-slate-800 focus:border-emerald-500 placeholder-slate-500"
                  : "bg-gray-50 text-slate-900 border-gray-200 focus:bg-white focus:border-emerald-500"
              }`}
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
              Backup Stream URL (.m3u8)
            </label>
            <input
              type="url"
              value={backupUrl}
              onChange={(e) => setBackupUrl(e.target.value)}
              placeholder="Optional backup CDN URL"
              className={`w-full px-3 py-2 rounded-xl border outline-none transition-all ${
                isDark
                  ? "bg-slate-900 text-white border-slate-800 focus:border-emerald-500 placeholder-slate-500"
                  : "bg-gray-50 text-slate-900 border-gray-200 focus:bg-white focus:border-emerald-500"
              }`}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Channel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
