"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Movie, Series } from "../types";

type TopTenItem = (Movie | Series) & {
  type: "MOVIE" | "SERIES";
};

interface TopTenRowProps {
  items: TopTenItem[];
}

export default function TopTenRow({ items }: TopTenRowProps) {
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

  const top10 = items.slice(0, 10);
  if (top10.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-6 bg-[#e50914] rounded-full" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Top 10 in Bangladesh</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#e50914]/20 text-[#ff4d58] border border-[#e50914]/40 px-2 py-0.5 rounded-full">
              TODAY
            </span>
          </h2>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="p-1.5 rounded-full bg-cinema-900/80 hover:bg-[#e50914] text-slate-300 hover:text-white border border-cinema-700/60 transition shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="p-1.5 rounded-full bg-cinema-900/80 hover:bg-[#e50914] text-slate-300 hover:text-white border border-cinema-700/60 transition shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto scrollbar-none pt-4 pb-14 px-4 -mx-2 scroll-smooth"
      >
        {top10.map((item, index) => {
          const rank = index + 1;
          const isSeries = item.type === "SERIES";
          const href = isSeries ? `/series/${item.slug}` : `/movie/${item.slug}`;
          const playHref = isSeries ? `/watch/series/${item.slug}` : `/watch/movie/${item.slug}`;
          const poster =
            item.poster ||
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80";

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="group relative flex-none w-40 sm:w-48 md:w-56"
            >
              <Link href={href} className="block relative">
                {/* Poster Card */}
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-cinema-900 border border-cinema-700/50 shadow-lg group-hover:shadow-2xl group-hover:border-[#e50914]/80 transition-all duration-300 transform group-hover:-translate-y-1.5">
                  <img
                    src={poster}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Crown/Badge */}
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    <span className="bg-[#e50914] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                      {isSeries ? "SERIES" : "MOVIE"}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link
                        href={playHref}
                        onClick={(e) => e.stopPropagation()}
                        className="w-9 h-9 rounded-full bg-[#e50914] hover:bg-[#ff1e2b] flex items-center justify-center text-white shadow-lg transition transform hover:scale-110"
                      >
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </Link>
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-slate-300 font-medium">
                      ★ {item.rating || "8.5"} • {item.releaseYear || "2024"}
                    </p>
                  </div>
                </div>

                {/* iScreen Stylized Large Outlined Rank Number */}
                <div
                  className="absolute -bottom-3 -left-3 sm:-left-4 pointer-events-none select-none z-20 font-black leading-none"
                  style={{
                    fontSize: "clamp(4.5rem, 8vw, 7rem)",
                    fontFamily: "'Impact', 'Arial Black', sans-serif",
                    color: "rgba(10, 10, 10, 0.75)",
                    WebkitTextStroke: "2.5px #e50914",
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.9))",
                  }}
                >
                  {rank}
                </div>
              </Link>

              {/* Title under poster */}
              <div className="mt-4 pl-4 sm:pl-6">
                <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#ff4d58] transition-colors">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isSeries ? "TV Series" : "Movie"} • {item.releaseYear || "2024"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
