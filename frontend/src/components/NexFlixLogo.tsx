"use client";

import React from "react";

interface NexFlixLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function NexFlixLogo({ size = "md", className = "" }: NexFlixLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const badgeSizes = {
    sm: "text-[8px] tracking-[0.2em] -mt-1",
    md: "text-[9px] tracking-[0.25em] -mt-1",
    lg: "text-[10px] tracking-[0.3em] -mt-1",
  };

  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      {/* iScreen-Inspired 3D Crimson Red Portal Icon */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_14px_rgba(229,9,20,0.6)]"
        >
          <defs>
            <linearGradient id="nexGrad" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#ff334b" />
              <stop offset="50%" stopColor="#e50914" />
              <stop offset="100%" stopColor="#80020a" />
            </linearGradient>
            <linearGradient id="innerShine" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer Crimson Orb */}
          <circle cx="50" cy="50" r="46" fill="url(#nexGrad)" />

          {/* Dynamic iScreen-like Crescent Cutout Accent */}
          <path
            d="M 42 16 C 30 26 24 40 26 56 C 28 68 34 78 44 84 C 34 76 29 64 30 50 C 31 36 36 24 44 16 Z"
            fill="url(#innerShine)"
          />

          {/* Forward Stream Play Arrow */}
          <path
            d="M 46 32 L 68 50 L 46 68 Z"
            fill="#ffffff"
            className="drop-shadow-sm"
          />

          {/* Dynamic Top Slash */}
          <circle cx="70" cy="28" r="4" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      {/* Styled NexFlix Typography */}
      <div className="flex flex-col">
        <span
          className={`font-black italic tracking-tighter text-white leading-none ${textSizes[size]}`}
          style={{ fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif" }}
        >
          NEX<span className="text-[#00c853]">FLIX</span>
        </span>
        <span className={`text-[#888888] font-bold uppercase ${badgeSizes[size]}`}>
          BDIX STREAM
        </span>
      </div>
    </div>
  );
}
