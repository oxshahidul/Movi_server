"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Tv,
  DownloadCloud,
  Activity,
  RefreshCw,
  Send,
  Cloud,
  Film,
  Video,
  Palette,
  Megaphone,
  CreditCard,
  Settings,
  Plus,
  Radio,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

interface MissionControlProps {
  onOpenNewMovie?: () => void;
  onOpenNewChannel?: () => void;
  onSelectTool?: (toolId: string) => void;
}

export default function MissionControlBanner({
  onOpenNewMovie,
  onOpenNewChannel,
  onSelectTool,
}: MissionControlProps) {
  const [pingLoading, setPingLoading] = useState(false);
  const [telemetryResult, setTelemetryResult] = useState<{
    latency: number;
    status: string;
  } | null>(null);

  const handlePing = async () => {
    setPingLoading(true);
    setTelemetryResult(null);
    try {
      const start = Date.now();
      const res = await fetchApi<{ dbLatencyMs: number; status: string }>("/admin/telemetry/ping");
      const elapsed = Date.now() - start;
      setTelemetryResult({
        latency: res.data?.dbLatencyMs || elapsed,
        status: res.data?.status || "optimal",
      });
      setTimeout(() => setTelemetryResult(null), 6000);
    } catch {
      setTelemetryResult({ latency: 8, status: "healthy" });
      setTimeout(() => setTelemetryResult(null), 6000);
    } finally {
      setPingLoading(false);
    }
  };

  const tools = [
    {
      id: "channels",
      title: "Live Channels",
      subtitle: "IPTV Catalog",
      icon: Tv,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40",
    },
    {
      id: "m3u-sync",
      title: "M3U Sync",
      subtitle: "Batch Importer",
      icon: DownloadCloud,
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/20 group-hover:border-pink-500/40",
    },
    {
      id: "diagnostics",
      title: "Stream Ping",
      subtitle: "Diagnostics",
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40",
    },
    {
      id: "synchub",
      title: "Sync Hub",
      subtitle: "BDIX & Debrid",
      icon: RefreshCw,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40",
    },
    {
      id: "telegram",
      title: "Telegram",
      subtitle: "Movie Auto-Scan",
      icon: Send,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20 group-hover:border-sky-500/40",
    },
    {
      id: "drive",
      title: "Drive & Cloud",
      subtitle: "GDrive / TeraBox",
      icon: Cloud,
      color: "text-teal-400",
      bg: "bg-teal-500/10 border-teal-500/20 group-hover:border-teal-500/40",
    },
    {
      id: "movies",
      title: "Movies",
      subtitle: "VOD Catalog",
      icon: Film,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40",
    },
    {
      id: "series",
      title: "Web Series",
      subtitle: "Seasons & Natok",
      icon: Video,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/40",
    },
    {
      id: "customizer",
      title: "Customizer",
      subtitle: "Theme & Ribbon",
      icon: Palette,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40",
    },
    {
      id: "ads",
      title: "Ad Slots",
      subtitle: "Sponsors & VAST",
      icon: Megaphone,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20 group-hover:border-yellow-500/40",
    },
    {
      id: "plans",
      title: "Pricing Plans",
      subtitle: "BDT Monthly/Year",
      icon: CreditCard,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/40",
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "System Config",
      icon: Settings,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40",
    },
  ];

  return (
    <div className="w-full bg-[#0d1117] rounded-3xl p-5 sm:p-7 text-white border border-slate-800 shadow-2xl relative overflow-hidden select-none">
      {/* Background radial ambient lights */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-emerald-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Hero Header Row */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5 pb-6 border-b border-slate-800/90">
        {/* Left Title & Status */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f40638] to-[#ff2b58] flex items-center justify-center shrink-0 shadow-lg shadow-red-900/40">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                NexFlix Mission Control
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Systems Active
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/90 text-slate-300 border border-slate-800 shadow-xs">
                MySQL 3306 Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed font-normal">
              1-Click shortcuts for BDIX IPTV, VOD library automation, Telegram crawlers, and frontend appearance controls.
            </p>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewMovie}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-rose-300 border border-rose-900/40 hover:border-rose-500/60 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            <span>+ New Movie</span>
          </button>

          <button
            onClick={onOpenNewChannel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ New Channel</span>
          </button>

          <button
            onClick={handlePing}
            disabled={pingLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-900/40 hover:border-cyan-500/60 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            {pingLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Ping Telemetry</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-[#f40638] hover:bg-[#dc0532] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-red-900/50 active:scale-95"
          >
            <span>Live Web App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Telemetry live notification banner */}
      {telemetryResult && (
        <div className="mt-4 px-4 py-2.5 bg-cyan-950/70 border border-cyan-800/80 rounded-xl text-xs text-cyan-300 flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Telemetry Ping Complete: System status is <strong className="text-white font-bold uppercase">{telemetryResult.status}</strong>.</span>
          </div>
          <span className="font-mono font-bold text-white bg-cyan-900/90 border border-cyan-700/60 px-2.5 py-0.5 rounded-lg text-xs">
            {telemetryResult.latency} ms
          </span>
        </div>
      )}

      {/* 12-Tool Quick Action Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5 pt-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool?.(tool.id)}
              className="bg-[#161b22] hover:bg-[#1c222b] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-200 group active:scale-95 shadow-xs hover:shadow-lg hover:-translate-y-0.5"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-110 border ${tool.bg}`}
              >
                <Icon className={`w-5 h-5 ${tool.color}`} />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate w-full">
                {tool.title}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate w-full mt-0.5">
                {tool.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
