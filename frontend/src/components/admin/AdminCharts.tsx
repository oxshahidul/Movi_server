"use client";

import React, { useState } from "react";
import { PieChart, TrendingUp, Info } from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext";

interface MediaDistributionItem {
  name: string;
  count: number;
  color: string;
}

interface StreamTrafficItem {
  day: string;
  traffic: number;
  label: string;
}

interface AdminChartsProps {
  distribution?: MediaDistributionItem[];
  traffic?: StreamTrafficItem[];
}

export default function AdminCharts({
  distribution = [
    { name: "Live TV Channels", count: 179, color: "#10B981" },
    { name: "VOD Movies", count: 144, color: "#F59E0B" },
    { name: "TV Series", count: 52, color: "#3B82F6" },
    { name: "Episodic Content", count: 806, color: "#8B5CF6" },
  ],
  traffic = [
    { day: "Mon", traffic: 3220, label: "3.22k" },
    { day: "Tue", traffic: 3260, label: "3.26k" },
    { day: "Wed", traffic: 3310, label: "3.31k" },
    { day: "Thu", traffic: 3290, label: "3.29k" },
    { day: "Fri", traffic: 3380, label: "3.38k" },
    { day: "Sat", traffic: 3440, label: "3.44k" },
    { day: "Sun", traffic: 3410, label: "3.41k" },
  ],
}: AdminChartsProps) {
  const { isDark } = useAdminTheme();
  const [hoveredSlice, setHoveredSlice] = useState<MediaDistributionItem | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<StreamTrafficItem | null>(null);

  // Compute total for donut
  const totalItems = distribution.reduce((acc, curr) => acc + curr.count, 0);

  // Donut chart stroke math
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  // Stream Traffic line math
  const minTraffic = 3100;
  const maxTraffic = 3500;
  const width = 500;
  const height = 190;
  const paddingX = 42;
  const paddingY = 25;

  const getCoordinates = (index: number, val: number) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (traffic.length - 1);
    const normalized = (val - minTraffic) / (maxTraffic - minTraffic);
    const y = height - paddingY - normalized * (height - 2 * paddingY);
    return { x, y };
  };

  const points = traffic.map((item, idx) => getCoordinates(idx, item.traffic));

  // Build smooth bezier SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 select-none">
      {/* 1. Content & Media Library Distribution (Donut Chart) */}
      <div
        className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
          isDark
            ? "bg-[#0f141c] border-slate-800/90 text-white shadow-lg shadow-black/20"
            : "bg-white border-slate-200/80 text-slate-900 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isDark
                  ? "bg-emerald-950/60 border-emerald-900/60"
                  : "bg-emerald-50 border-emerald-100"
              }`}
            >
              <PieChart className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Content & Media Library Distribution
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">BDIX IPTV, VOD movies & episodic series</p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs transition-colors ${
              isDark
                ? "text-slate-300 bg-slate-900/90 border-slate-800"
                : "text-slate-600 bg-slate-50 border-slate-200"
            }`}
          >
            {totalItems.toLocaleString()} items
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          {/* Donut SVG */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90 transform">
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke={isDark ? "#1e2633" : "#f1f5f9"}
                strokeWidth="22"
                fill="transparent"
              />

              {distribution.map((item) => {
                const percent = item.count / totalItems;
                const strokeDasharray = `${percent * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += percent;

                return (
                  <circle
                    key={item.name}
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={item.color}
                    strokeWidth="22"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    onMouseEnter={() => setHoveredSlice(item)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className={`text-2xl font-black tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {hoveredSlice ? hoveredSlice.count.toLocaleString() : totalItems.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-slate-400 truncate max-w-[95px] text-center mt-0.5">
                {hoveredSlice ? hoveredSlice.name : "Total Media"}
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-1 gap-2.5 w-full max-w-xs">
            {distribution.map((item) => {
              const pct = Math.round((item.count / totalItems) * 100);
              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredSlice(item)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
                    hoveredSlice?.name === item.name
                      ? isDark
                        ? "bg-slate-800/80 border-slate-700 shadow-xs scale-[1.01]"
                        : "bg-slate-50 border-slate-300 shadow-xs scale-[1.01]"
                      : isDark
                      ? "border-transparent hover:bg-slate-900/60"
                      : "border-transparent hover:bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className={`font-bold truncate ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">({pct}%)</span>
                    </div>
                  </div>
                  {/* Visual Progress Bar */}
                  <div
                    className={`w-full rounded-full h-1.5 mt-2 overflow-hidden ${
                      isDark ? "bg-slate-800" : "bg-slate-100"
                    }`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Daily Stream Traffic & Player Engagement (Area Chart) */}
      <div
        className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
          isDark
            ? "bg-[#0f141c] border-slate-800/90 text-white shadow-lg shadow-black/20"
            : "bg-white border-slate-200/80 text-slate-900 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isDark
                  ? "bg-emerald-950/60 border-emerald-900/60"
                  : "bg-emerald-50 border-emerald-100"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Daily Stream Traffic & Player Engagement
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">BDIX HLS bandwidth & active players</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-xs transition-colors ${
              isDark
                ? "text-emerald-400 bg-emerald-950/80 border-emerald-800"
                : "text-emerald-700 bg-emerald-50 border-emerald-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>+14.8% this week</span>
          </div>
        </div>

        {/* SVG Chart Canvas */}
        <div className="relative w-full h-[190px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={isDark ? "0.35" : "0.25"} />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal gridlines */}
            {[3200, 3300, 3400].map((val) => {
              const y = getCoordinates(0, val).y;
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke={isDark ? "#1e2633" : "#f1f5f9"}
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className={`text-[9px] font-mono font-semibold ${
                      isDark ? "fill-slate-500" : "fill-slate-400"
                    }`}
                  >
                    {val.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area */}
            <path d={areaD} fill="url(#trafficGradient)" />

            {/* Curved Bezier Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover Points */}
            {points.map((pt, i) => {
              const isHovered = hoveredPoint?.day === traffic[i].day;
              return (
                <g
                  key={traffic[i].day}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(traffic[i])}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={height - paddingY}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill={isDark ? "#0f141c" : "#ffffff"}
                    stroke="#10b981"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-150"
                  />
                  {/* X Axis Day Label */}
                  <text
                    x={pt.x}
                    y={height - 7}
                    textAnchor="middle"
                    className={`text-[10px] transition-colors ${
                      isHovered
                        ? "fill-emerald-400 font-bold"
                        : isDark
                        ? "fill-slate-500 font-medium"
                        : "fill-slate-400 font-medium"
                    }`}
                  >
                    {traffic[i].day}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Floating Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 pointer-events-none animate-in fade-in duration-150 border border-slate-700">
              <span className="font-bold text-emerald-400">{hoveredPoint.day}:</span>
              <span className="font-mono font-extrabold">{hoveredPoint.traffic.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">concurrent streams</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
