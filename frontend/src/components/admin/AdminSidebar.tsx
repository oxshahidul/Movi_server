"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Tv,
  Film,
  Bot,
  CreditCard,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext";

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  onSelectSection: (section: string) => void;
  badges?: {
    channels?: number;
    movies?: number;
    series?: number;
    plans?: number;
    adPlacements?: number;
    categories?: number;
    blogPosts?: number;
    faqs?: number;
    settings?: number;
    users?: number;
  };
}

export default function AdminSidebar({
  isOpen,
  activeSection,
  onSelectSection,
  badges = {
    channels: 179,
    movies: 144,
    series: 52,
    plans: 3,
    adPlacements: 0,
    categories: 24,
    blogPosts: 2,
    faqs: 5,
    settings: 22,
    users: 3,
  },
}: SidebarProps) {
  const { isDark } = useAdminTheme();

  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    livetv: true,
    vod: true,
    automation: true,
    monetization: true,
    community: true,
    settings: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`w-64 shrink-0 h-full flex flex-col select-none transition-colors duration-200 border-r z-30 ${
        isDark
          ? "bg-[#0f141c] border-slate-800/90 text-slate-300"
          : "bg-white border-slate-200/80 text-slate-700"
      }`}
    >
      {/* 1. FIXED TOP HEADER: Prominent "Dashboard" Title */}
      <div
        className={`shrink-0 px-4 py-2.5 border-b flex items-center justify-between transition-colors ${
          isDark ? "border-slate-800/90 bg-[#0f141c]" : "border-slate-100 bg-white"
        }`}
      >
        <button
          onClick={() => {
            onSelectSection("dashboard");
          }}
          className="flex items-center gap-2.5 text-left group transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span
            className={`text-xl sm:text-2xl font-black tracking-tight transition-colors ${
              isDark
                ? "text-white group-hover:text-red-400"
                : "text-slate-900 group-hover:text-red-600"
            }`}
          >
            Dashboard
          </span>
        </button>
      </div>

      {/* 2. SCROLLABLE MIDDLE: Only Category Groups Scroll */}
      <div className="flex-1 admin-sidebar-scroll px-3 py-2 space-y-3 overscroll-contain">
        {/* SECTION: Live TV & Streams */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup("livetv")}
            className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-2 py-1 transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Tv className="w-3.5 h-3.5 text-emerald-500" />
              <span>Live TV & Streams</span>
            </div>
            {openGroups.livetv ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {openGroups.livetv && (
            <div
              className={`ml-2 pl-2.5 border-l-2 space-y-0.5 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              {/* Channels */}
              <button
                onClick={() => onSelectSection("channels")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "channels"
                    ? isDark
                      ? "bg-gradient-to-r from-emerald-600/25 to-emerald-600/5 text-emerald-400 border-l-3 border-emerald-500"
                      : "bg-emerald-50 text-emerald-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Channels</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                      : "text-emerald-700 bg-emerald-50 border-emerald-100"
                  }`}
                >
                  {badges.channels ?? 179}
                </span>
              </button>

              {/* M3U IPTV Importer */}
              <button
                onClick={() => onSelectSection("m3u-sync")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "m3u-sync"
                    ? isDark
                      ? "bg-red-500/20 text-red-400 border-l-3 border-red-500"
                      : "bg-red-50 text-red-600 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-red-400" />
                  <span>M3U IPTV Importer</span>
                </div>
              </button>

              {/* Stream Diagnostics */}
              <button
                onClick={() => onSelectSection("diagnostics")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "diagnostics"
                    ? isDark
                      ? "bg-cyan-500/20 text-cyan-400 border-l-3 border-cyan-500"
                      : "bg-cyan-50 text-cyan-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-cyan-400" />
                  <span>Stream Diagnostics</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Video On Demand */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup("vod")}
            className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-2 py-1 transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>Video On Demand</span>
            </div>
            {openGroups.vod ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {openGroups.vod && (
            <div
              className={`ml-2 pl-2.5 border-l-2 space-y-0.5 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              {/* Movies */}
              <button
                onClick={() => onSelectSection("movies")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "movies"
                    ? isDark
                      ? "bg-gradient-to-r from-red-600/25 to-red-600/5 text-red-400 border-l-3 border-red-500"
                      : "bg-red-50 text-red-600 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Movies</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-red-950/80 text-red-400 border-red-800/80"
                      : "text-red-600 bg-red-50 border-red-100"
                  }`}
                >
                  {badges.movies ?? 144}
                </span>
              </button>

              {/* Series */}
              <button
                onClick={() => onSelectSection("series")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "series"
                    ? isDark
                      ? "bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-blue-400 border-l-3 border-blue-500"
                      : "bg-blue-50 text-blue-600 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Series</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-blue-950/80 text-blue-400 border-blue-800/80"
                      : "text-blue-600 bg-blue-50 border-blue-100"
                  }`}
                >
                  {badges.series ?? 52}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Content Automation Hub */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup("automation")}
            className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-2 py-1 transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-sky-500" />
              <span>Content Automation Hub</span>
            </div>
            {openGroups.automation ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {openGroups.automation && (
            <div
              className={`ml-2 pl-2.5 border-l-2 space-y-0.5 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <button
                onClick={() => onSelectSection("telegram")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "telegram"
                    ? isDark
                      ? "bg-sky-500/20 text-sky-400 border-l-3 border-sky-500"
                      : "bg-sky-50 text-sky-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-sky-400" />
                  <span>Telegram Movie Importer</span>
                </div>
              </button>

              <button
                onClick={() => onSelectSection("drive")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "drive"
                    ? isDark
                      ? "bg-teal-500/20 text-teal-400 border-l-3 border-teal-500"
                      : "bg-teal-50 text-teal-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-teal-400" />
                  <span>Google Drive & TeraBox</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Monetization & Plans */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup("monetization")}
            className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-2 py-1 transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-orange-500" />
              <span>Monetization & Plans</span>
            </div>
            {openGroups.monetization ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {openGroups.monetization && (
            <div
              className={`ml-2 pl-2.5 border-l-2 space-y-0.5 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <button
                onClick={() => onSelectSection("plans")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "plans"
                    ? isDark
                      ? "bg-orange-500/20 text-orange-400 border-l-3 border-orange-500"
                      : "bg-orange-50 text-orange-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-orange-400" />
                  <span>Subscription Plans</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-orange-950/80 text-orange-400 border-orange-800/80"
                      : "text-orange-600 bg-orange-50 border-orange-100"
                  }`}
                >
                  {badges.plans ?? 3}
                </span>
              </button>

              <button
                onClick={() => onSelectSection("ads")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "ads"
                    ? isDark
                      ? "bg-amber-500/20 text-amber-400 border-l-3 border-amber-500"
                      : "bg-amber-50 text-amber-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-amber-400" />
                  <span>Ad Placements</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-amber-950/80 text-amber-400 border-amber-800/80"
                      : "text-amber-700 bg-amber-50 border-amber-100"
                  }`}
                >
                  {badges.adPlacements ?? 0}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Content & Community */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup("community")}
            className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-2 py-1 transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Content & Community</span>
            </div>
            {openGroups.community ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {openGroups.community && (
            <div
              className={`ml-2 pl-2.5 border-l-2 space-y-0.5 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <button
                onClick={() => onSelectSection("categories")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "categories"
                    ? isDark
                      ? "bg-indigo-500/20 text-indigo-400 border-l-3 border-indigo-500"
                      : "bg-indigo-50 text-indigo-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-indigo-400" />
                  <span>Categories</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-indigo-950/80 text-indigo-400 border-indigo-800/80"
                      : "text-indigo-600 bg-indigo-50 border-indigo-100"
                  }`}
                >
                  {badges.categories ?? 24}
                </span>
              </button>

              <button
                onClick={() => onSelectSection("blogs")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "blogs"
                    ? isDark
                      ? "bg-slate-700/40 text-white border-l-3 border-red-500"
                      : "bg-red-50 text-red-600 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Blog Posts</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "text-red-600 bg-red-50 border-red-100"
                  }`}
                >
                  {badges.blogPosts ?? 2}
                </span>
              </button>

              <button
                onClick={() => onSelectSection("faqs")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "faqs"
                    ? isDark
                      ? "bg-slate-700/40 text-white border-l-3 border-red-500"
                      : "bg-red-50 text-red-600 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Faqs</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "text-red-600 bg-red-50 border-red-100"
                  }`}
                >
                  {badges.faqs ?? 5}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Settings & Access */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup("settings")}
            className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-2 py-1 transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-blue-500" />
              <span>Settings & Access</span>
            </div>
            {openGroups.settings ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {openGroups.settings && (
            <div
              className={`ml-2 pl-2.5 border-l-2 space-y-0.5 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <button
                onClick={() => onSelectSection("customizer")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "customizer"
                    ? isDark
                      ? "bg-rose-500/20 text-rose-400 border-l-3 border-rose-500"
                      : "bg-rose-50 text-rose-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-rose-400" />
                  <span>Frontend Customizer</span>
                </div>
              </button>

              <button
                onClick={() => onSelectSection("analytics")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "analytics"
                    ? isDark
                      ? "bg-blue-500/20 text-blue-400 border-l-3 border-blue-500"
                      : "bg-blue-50 text-blue-700 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-blue-400" />
                  <span>Google Analytics</span>
                </div>
              </button>

              <button
                onClick={() => onSelectSection("settings")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "settings"
                    ? isDark
                      ? "bg-slate-700/40 text-white border-l-3 border-red-500"
                      : "bg-red-50 text-red-600 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Settings</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "text-red-600 bg-red-50 border-red-100"
                  }`}
                >
                  {badges.settings ?? 22}
                </span>
              </button>

              <button
                onClick={() => onSelectSection("users")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  activeSection === "users"
                    ? isDark
                      ? "bg-slate-700/40 text-white border-l-3 border-red-500"
                      : "bg-red-50 text-red-600 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Users</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "text-red-600 bg-red-50 border-red-100"
                  }`}
                >
                  {badges.users ?? 3}
                </span>
              </button>

              <Link
                href="/"
                target="_blank"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 group ${
                  isDark
                    ? "text-slate-400 hover:text-red-400 hover:bg-slate-800/60"
                    : "text-slate-500 hover:text-red-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-red-500" />
                  <span>View Live Web App</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. FIXED FOOTER */}
      <div
        className={`shrink-0 p-3 border-t text-[11px] flex items-center justify-between font-semibold transition-colors ${
          isDark
            ? "border-slate-800/90 text-slate-500 bg-[#0f141c]"
            : "border-slate-100 text-slate-400 bg-white"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>NexFlix v2.4</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </aside>
  );
}
