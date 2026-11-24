"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Zap, Globe } from "lucide-react";
import NexFlixLogo from "./NexFlixLogo";

export default function Footer() {
  const pathname = usePathname();

  // Do not render consumer footer on admin portal routes
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-cinema-950 border-t border-cinema-700/40 text-cinema-muted py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <Link href="/">
            <NexFlixLogo size="sm" />
          </Link>
          <p className="text-xs leading-relaxed text-slate-400">
            NexFlix is a premium cinema-grade entertainment streaming platform. Powered by high-speed local routing, bufferless playback, and extensive cinema catalog.
          </p>
          <div className="flex items-center space-x-3 text-xs text-[#00c853] font-medium">
            <Zap className="w-4 h-4" />
            <span>Optimized for BDIX & High-Speed Networks</span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/" className="hover:text-white transition">Home</Link>
            </li>
            <li>
              <Link href="/movies" className="hover:text-white transition">Movies Catalog</Link>
            </li>
            <li>
              <Link href="/series" className="hover:text-white transition">TV Series</Link>
            </li>
            <li>
              <Link href="/live" className="hover:text-white transition">Live TV Studio</Link>
            </li>
            <li>
              <Link href="/library" className="hover:text-white transition">My Watchlist</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Features</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full HD & 4K Streaming</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-cinema-cyan" />
              <span>Multi-language Audio & Subtitles</span>
            </li>
            <li>Instant Playback Resumption</li>
            <li>Cross-device Watch History</li>
          </ul>
        </div>

        {/* Col 4: Legal & Disclaimer */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Disclaimer</h4>
          <p className="text-[11px] leading-relaxed text-slate-500">
            NexFlix is a media streaming demonstration platform. All streams and sample videos used for demonstration are open-source and public domain streams.
          </p>
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} NexFlix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
