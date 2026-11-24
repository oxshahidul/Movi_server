"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useAdminTheme } from "../../context/AdminThemeContext";
import { useRouter } from "next/navigation";

interface AdminTopNavProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function AdminTopNav({ sidebarOpen, onToggleSidebar }: AdminTopNavProps) {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useAdminTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "S";

  return (
    <header
      className={`shrink-0 z-40 w-full h-16 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-xs select-none transition-colors duration-300 ${
        isDark
          ? "bg-[#0f141c]/95 border-b border-slate-800/90 text-white shadow-lg shadow-black/20"
          : "bg-white/95 border-b border-slate-200/80 text-slate-900"
      }`}
    >
      {/* Left branding & collapse toggle */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-800/80 border-slate-800"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 border-transparent hover:border-slate-200"
          }`}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f40638] to-[#ff2b58] flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span
                className={`font-bold text-sm tracking-tight transition-colors ${
                  isDark ? "text-white group-hover:text-red-400" : "text-slate-900 group-hover:text-red-600"
                }`}
              >
                NexFlix
              </span>
              <span className="font-extrabold text-[#f40638] text-sm">BD</span>
              <span className="text-[9px] font-bold text-[#f40638] border border-red-200 bg-red-50/80 px-1.5 py-0.5 rounded leading-none uppercase tracking-wide">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold tracking-tight mt-1">
              Admin Control Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Center live badge */}
      <div
        className={`hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-slate-300"
            : "bg-slate-50 border-slate-200 text-slate-600"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>BDIX Core Online</span>
        <span className="text-slate-500">•</span>
        <span className="text-emerald-400 font-mono text-[11px] font-bold">99.8% Uptime</span>
      </div>

      {/* Right controls: Theme Switcher, Live App link, User Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* 1-Click Light/Dark Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
            isDark
              ? "bg-slate-900/90 hover:bg-slate-800 text-amber-400 border-slate-800 shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-xs"
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
              <span className="hidden sm:inline text-amber-300 text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-300" />
              <span className="hidden sm:inline text-slate-700 text-[11px]">Dark</span>
            </>
          )}
        </button>

        {/* Live Web App link */}
        <Link
          href="/"
          target="_blank"
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all shadow-xs active:scale-95 ${
            isDark
              ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700"
              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          <span>Live Web App</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Profile Avatar with dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-xl border transition-all active:scale-95 ${
              isDark
                ? "hover:bg-slate-850 border-transparent hover:border-slate-800"
                : "hover:bg-slate-50 border-transparent hover:border-slate-200"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {initial}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span
                className={`text-xs font-bold truncate max-w-[110px] leading-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {user?.name || "Administrator"}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 leading-none">
                {user?.role || "SUPER_ADMIN"}
              </span>
            </div>
          </button>

          {menuOpen && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl py-2 z-50 border animate-in fade-in zoom-in-95 ${
                isDark
                  ? "bg-[#161b22] border-slate-800 text-white shadow-black/60"
                  : "bg-white border-slate-200 text-slate-900 shadow-slate-200/60"
              }`}
            >
              <div className={`px-4 py-2.5 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <p className="text-xs font-bold truncate">{user?.name || "Administrator"}</p>
                <p className="text-[11px] text-slate-400 truncate font-medium">{user?.email || "admin@nexflix.com"}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{user?.role || "SUPER_ADMIN"}</span>
                </div>
              </div>

              <div className="p-1.5">
                <Link
                  href="/"
                  target="_blank"
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    isDark ? "text-slate-300 hover:text-white hover:bg-slate-800/80" : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Open Client Website</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg text-left transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
