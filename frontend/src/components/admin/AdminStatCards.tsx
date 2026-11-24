"use client";

import React from "react";
import { Tv, Film, Video, Tag, TrendingUp, Users } from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext";

interface StatCardsProps {
  metrics?: {
    liveTv?: {
      total: number;
      active: number;
      servers: number;
      uptimePercent: number;
    };
    movies?: {
      total: number;
      published: number;
      featuredCount: number;
    };
    series?: {
      total: number;
      episodesTotal: number;
    };
    categories?: {
      total: number;
      subLabel: string;
    };
    views?: {
      total: number;
      formatted: string;
      subLabel: string;
    };
    users?: {
      total: number;
      subLabel: string;
    };
  };
}

export default function AdminStatCards({ metrics }: StatCardsProps) {
  const { isDark } = useAdminTheme();

  const cards = [
    {
      id: "channels",
      title: "Live TV Channels",
      value: (metrics?.liveTv?.total ?? 179).toLocaleString(),
      subtitle: `${metrics?.liveTv?.active ?? 179} Active Channels • ${metrics?.liveTv?.servers ?? 185} Servers (${metrics?.liveTv?.uptimePercent ?? 98}% Up)`,
      icon: Tv,
      iconColor: "text-emerald-400",
      iconBg: isDark ? "bg-emerald-950/60 border-emerald-900/60" : "bg-emerald-50 border-emerald-100",
      subColor: isDark ? "text-emerald-400" : "text-emerald-700",
      accentBorder: "border-b-4 border-emerald-500",
    },
    {
      id: "movies",
      title: "VOD Movies",
      value: (metrics?.movies?.total ?? 144).toLocaleString(),
      subtitle: `${metrics?.movies?.featuredCount ?? 110} Featured / 1-Click TMDB Automation`,
      icon: Film,
      iconColor: "text-rose-400",
      iconBg: isDark ? "bg-rose-950/60 border-rose-900/60" : "bg-red-50 border-red-100",
      subColor: isDark ? "text-rose-400" : "text-red-600",
      accentBorder: "border-b-4 border-rose-500",
    },
    {
      id: "series",
      title: "TV Series & Shows",
      value: (metrics?.series?.total ?? 52).toLocaleString(),
      subtitle: `Multi-Season & Episodic Content (${metrics?.series?.episodesTotal ?? 806} eps)`,
      icon: Video,
      iconColor: "text-blue-400",
      iconBg: isDark ? "bg-blue-950/60 border-blue-900/60" : "bg-blue-50 border-blue-100",
      subColor: isDark ? "text-blue-400" : "text-blue-600",
      accentBorder: "border-b-4 border-blue-500",
    },
    {
      id: "categories",
      title: "Content Categories",
      value: (metrics?.categories?.total ?? 24).toLocaleString(),
      subtitle: metrics?.categories?.subLabel ?? "Genres, OTT Networks & BDIX",
      icon: Tag,
      iconColor: "text-amber-400",
      iconBg: isDark ? "bg-amber-950/60 border-amber-900/60" : "bg-amber-50 border-amber-100",
      subColor: isDark ? "text-amber-400" : "text-amber-700",
      accentBorder: "border-b-4 border-amber-500",
    },
    {
      id: "views",
      title: "Total Content Views",
      value: metrics?.views?.formatted ?? "10,588",
      subtitle: metrics?.views?.subLabel ?? "Real-Time User Engagement",
      icon: TrendingUp,
      iconColor: "text-emerald-400",
      iconBg: isDark ? "bg-emerald-950/60 border-emerald-900/60" : "bg-emerald-50 border-emerald-100",
      subColor: isDark ? "text-emerald-400" : "text-emerald-700",
      accentBorder: "border-b-4 border-emerald-500",
    },
    {
      id: "users",
      title: "Registered Users",
      value: (metrics?.users?.total ?? 3).toLocaleString(),
      subtitle: metrics?.users?.subLabel ?? "System Admins & Subscribers",
      icon: Users,
      iconColor: "text-indigo-400",
      iconBg: isDark ? "bg-indigo-950/60 border-indigo-900/60" : "bg-indigo-50 border-indigo-100",
      subColor: isDark ? "text-indigo-400" : "text-indigo-600",
      accentBorder: "border-b-4 border-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
              card.accentBorder
            } ${
              isDark
                ? "bg-[#0f141c] border-slate-800/90 text-white shadow-lg shadow-black/20 hover:border-slate-700"
                : "bg-white border-slate-200/80 text-slate-900 shadow-xs hover:shadow-lg hover:border-slate-300"
            }`}
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                {card.title}
              </span>
              <span
                className={`text-3xl sm:text-4xl font-black tracking-tight block ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {card.value}
              </span>
            </div>

            <div
              className={`mt-5 flex items-center justify-between text-[11px] font-semibold pt-3 border-t ${
                isDark ? "border-slate-800/80" : "border-slate-100"
              }`}
            >
              <span className={`${card.subColor} truncate pr-2`}>
                {card.subtitle}
              </span>
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
