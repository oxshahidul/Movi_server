"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tv } from "lucide-react";
import { LiveTvChannel } from "../types";

interface LiveTvChannelCardProps {
  channel: LiveTvChannel;
}

export default function LiveTvChannelCard({ channel }: LiveTvChannelCardProps) {
  const [hasImgError, setHasImgError] = useState(false);

  return (
    <Link
      href={`/live?channel=${channel.slug}`}
      className="flex-none w-36 sm:w-44 group cursor-pointer"
    >
      <div className="relative aspect-video rounded-xl bg-cinema-900 border border-cinema-800 p-3 flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-cinema-red group-hover:shadow-lg group-hover:shadow-cinema-red/20">
        {/* Live indicator badge */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span>LIVE</span>
        </div>

        {/* Channel Logo */}
        <div className="w-12 h-12 flex items-center justify-center mb-1">
          {channel.logo && !hasImgError ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="max-h-full max-w-full object-contain filter group-hover:brightness-110"
              loading="lazy"
              onError={() => setHasImgError(true)}
            />
          ) : (
            <Tv className="w-7 h-7 text-cinema-muted" />
          )}
        </div>

        {/* Channel Name */}
        <span className="text-xs font-bold text-white truncate max-w-full group-hover:text-cinema-red transition">
          {channel.name}
        </span>
        <span className="text-[10px] text-cinema-muted truncate max-w-full mt-0.5">
          {channel.category}
        </span>
      </div>
    </Link>
  );
}
