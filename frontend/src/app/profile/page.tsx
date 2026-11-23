"use client";

import React, { useState, useEffect } from "react";
import { User, Settings, Lock, CheckCircle, AlertCircle, Shield, Globe, Sliders } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { fetchApi } from "../../lib/api";

export default function ProfilePage() {
  const { user, openAuthModal, checkAuth } = useAuthStore();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Settings State
  const [autoplay, setAutoplay] = useState(true);
  const [preferredQuality, setPreferredQuality] = useState("1080p");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [subtitleLanguage, setSubtitleLanguage] = useState("English");

  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [settingsMsg, setSettingsMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-cinema-red/20 text-cinema-red mx-auto flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Sign In to Manage Your Profile</h1>
        <p className="text-xs text-cinema-muted">
          Access your streaming preferences, saved profile, and playback settings.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="bg-cinema-red hover:bg-cinema-red-hover text-white font-semibold text-xs px-6 py-3 rounded-full transition shadow-lg shadow-cinema-red/30"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    try {
      const res = await fetchApi("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name,
          avatar: avatar.trim() || null,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });

      if (res.success) {
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        await checkAuth();
      }
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);
    setIsSavingSettings(true);

    try {
      const res = await fetchApi("/auth/settings", {
        method: "PUT",
        body: JSON.stringify({
          autoplay,
          preferredQuality,
          preferredLanguage,
          subtitleLanguage,
        }),
      });

      if (res.success) {
        setSettingsMsg({ type: "success", text: "Playback settings saved successfully!" });
      }
    } catch (err: any) {
      setSettingsMsg({ type: "error", text: err.message || "Failed to save settings" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="flex items-center space-x-4 pb-6 border-b border-cinema-700/60">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-3xl object-cover border-2 border-cinema-red"
          />
        ) : (
          <div className="w-16 h-16 rounded-3xl bg-cinema-850 text-cinema-red border border-cinema-700 flex items-center justify-center font-bold text-2xl">
            {user.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cinema-red/20 text-cinema-red border border-cinema-red/30">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-cinema-muted mt-0.5">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Account & Profile Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cinema-900/80 border border-cinema-700/60 space-y-6">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <User className="w-5 h-5 text-cinema-red" />
            <span>Profile Details</span>
          </div>

          {profileMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                profileMsg.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              {profileMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cinema-muted mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cinema-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cinema-muted mb-1.5">Avatar Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cinema-red"
              />
            </div>

            <div className="pt-2 border-t border-cinema-800 space-y-3">
              <span className="block text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-cinema-muted" />
                <span>Change Password (optional)</span>
              </span>

              <div>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2 text-sm text-white mb-2"
                />
                <input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-3 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white text-xs font-bold transition shadow-lg shadow-cinema-red/30 disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Save Profile Changes"}
            </button>
          </form>
        </div>

        {/* Section 2: Playback & Streaming Settings */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cinema-900/80 border border-cinema-700/60 space-y-6">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <Sliders className="w-5 h-5 text-cinema-cyan" />
            <span>Streaming Preferences</span>
          </div>

          {settingsMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                settingsMsg.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              {settingsMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{settingsMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateSettings} className="space-y-4">
            {/* Autoplay Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-cinema-950 border border-cinema-800">
              <div>
                <p className="text-xs font-semibold text-white">Autoplay Next Episode</p>
                <p className="text-[11px] text-cinema-muted">Automatically starts next episode when playing series</p>
              </div>
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                className="w-4 h-4 text-cinema-red rounded focus:ring-0 accent-cinema-red cursor-pointer"
              />
            </div>

            {/* Preferred Quality */}
            <div>
              <label className="block text-xs font-semibold text-cinema-muted mb-1.5">Default Streaming Quality</label>
              <select
                value={preferredQuality}
                onChange={(e) => setPreferredQuality(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cinema-cyan"
              >
                <option value="Auto">Auto (Adaptive BDIX Bitrate)</option>
                <option value="1080p">1080p (Full High Definition)</option>
                <option value="720p">720p (High Definition)</option>
                <option value="4K">4K Ultra HD</option>
              </select>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-semibold text-cinema-muted mb-1.5">Preferred Audio Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cinema-cyan"
              >
                <option value="English">English</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Japanese">Japanese (Original Audio)</option>
              </select>
            </div>

            {/* Subtitle Language */}
            <div>
              <label className="block text-xs font-semibold text-cinema-muted mb-1.5">Default Subtitle Track</label>
              <select
                value={subtitleLanguage}
                onChange={(e) => setSubtitleLanguage(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cinema-cyan"
              >
                <option value="English">English</option>
                <option value="Bengali">Bengali</option>
                <option value="Off">Subtitles Off</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full py-3 rounded-xl bg-cinema-cyan hover:bg-cyan-500 text-black text-xs font-bold transition shadow-lg shadow-cinema-cyan/20 disabled:opacity-50"
            >
              {isSavingSettings ? "Saving..." : "Save Playback Preferences"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
