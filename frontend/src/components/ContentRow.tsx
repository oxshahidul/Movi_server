"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentRowProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  children: React.ReactNode;
}

export default function ContentRow({ title, subtitle, viewAllHref, children }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative my-8 sm:my-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <span className="w-1.5 h-6 bg-[#e50914] rounded-full inline-block" />
            <span>{title}</span>
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-bold text-slate-300 hover:text-[#ff4d58] transition flex items-center space-x-1"
          >
            <span>See All</span>
            <span>→</span>
          </Link>
        )}
      </div>

      {/* Carousel Container */}
      <div className="group relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-cinema-950/80 hover:bg-cinema-900 border border-cinema-700/80 text-white flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Items */}
        <div
          ref={rowRef}
          className="flex items-start space-x-4 sm:space-x-5 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {children}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-cinema-950/80 hover:bg-cinema-900 border border-cinema-700/80 text-white flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
