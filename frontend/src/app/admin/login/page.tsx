"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Sun, Moon } from "lucide-react";
import { fetchApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/useAuthStore";
import { useAdminTheme } from "../../../context/AdminThemeContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { isDark, toggleTheme } = useAdminTheme();

  const [email, setEmail] = useState("shahidulcse21@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetchApi<{
        user: { id: string; name: string; email: string; role: string; avatar?: string };
        token: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.success || !res.user) {
        throw new Error(res.message || "Failed to authenticate admin");
      }

      const adminRoles = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"];
      if (!adminRoles.includes(res.user.role)) {
        throw new Error("Access denied: You do not have administrator permissions.");
      }

      setUser(res.user as any);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#0b0f17] text-white"
          : "bg-gradient-to-br from-slate-50 via-slate-100/90 to-red-50/20 text-slate-900"
      }`}
    >
      {/* Ambient background glows */}
      <div
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? "bg-red-600/10" : "bg-red-500/5"
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? "bg-blue-600/10" : "bg-blue-500/5"
        }`}
      />

      {/* Top Left Return to Site */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border backdrop-blur-md transition-all shadow-xs ${
            isDark
              ? "text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border-slate-800"
              : "text-slate-500 hover:text-red-600 bg-white/80 hover:bg-white border-slate-200"
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to NexFlix Cinema</span>
        </Link>
      </div>

      {/* Top Right Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
            isDark
              ? "bg-slate-900/90 hover:bg-slate-800 text-amber-400 border-slate-800 shadow-xs"
              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs"
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="text-slate-700 text-[11px]">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Centered Admin Login Card */}
      <div
        className={`w-full max-w-[450px] rounded-3xl p-8 sm:p-10 relative z-10 transition-all border ${
          isDark
            ? "bg-[#0f141c] border-slate-800/90 shadow-2xl shadow-black/80 text-white"
            : "bg-white border-slate-200/80 shadow-xl shadow-slate-200/50 text-slate-900"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#f40638] to-[#ff2b58] flex items-center justify-center shadow-md shadow-red-500/20">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#f40638] text-lg tracking-tight">BD</span>
              <span className="text-[10px] font-bold text-[#f40638] border border-red-200 bg-red-50/90 px-1.5 py-0.5 rounded leading-none uppercase tracking-wide">
                PRO
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 tracking-tight">
              Admin Control Hub
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Sign in
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access enterprise telemetry & content management
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in border ${
              isDark
                ? "bg-rose-950/80 text-rose-300 border-rose-800"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Email address<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nexflix.com"
              className={`w-full px-4 py-3 text-sm rounded-xl border focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all font-medium ${
                isDark
                  ? "bg-slate-900 text-white border-slate-800 placeholder-slate-500"
                  : "bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border-slate-200 placeholder-slate-400"
              }`}
            />
          </div>

          {/* Password field */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className={`w-full px-4 py-3 text-sm rounded-xl border focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all font-medium pr-11 ${
                  isDark
                    ? "bg-slate-900 text-white border-slate-800 placeholder-slate-500"
                    : "bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border-slate-200 placeholder-slate-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none p-1 rounded-md"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-400 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-700 cursor-pointer accent-[#f40638]"
              />
              <span>Remember me</span>
            </label>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 256-bit</span>
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#f40638] hover:bg-[#dc0532] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Footer Meta */}
        <div
          className={`mt-8 pt-4 border-t flex items-center justify-between text-[11px] text-slate-400 font-medium ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <span>NexFlix v2.4</span>
          <span>BDIX & OTT Enterprise Core</span>
        </div>
      </div>
    </div>
  );
}
