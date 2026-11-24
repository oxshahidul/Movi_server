"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Tv,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
} from "lucide-react";
import VideoPlayer from "../../../../components/VideoPlayer";
import { Series, Episode, Season } from "../../../../types";
import { fetchApi } from "../../../../lib/api";

function SeriesWatchContent({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const episodeParam = searchParams.get("episode");
  const resumeParam = searchParams.get("resume");

  const [series, setSeries] = useState<Series | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  const carouselRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLButtonElement>(null);

  // Sorted seasons & flattened sequential episodes
  const sortedSeasons = useMemo<Season[]>(() => {
    if (!series?.seasons) return [];
    return [...series.seasons]
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
      .map((s) => ({
        ...s,
        episodes: [...(s.episodes || [])].sort(
          (a, b) => a.episodeNumber - b.episodeNumber
        ),
      }));
  }, [series]);

  const allEpisodes = useMemo<Episode[]>(() => {
    const list: Episode[] = [];
    sortedSeasons.forEach((s) => {
      if (s.episodes) list.push(...s.episodes);
    });
    return list;
  }, [sortedSeasons]);

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const res = await fetchApi(`/series/${params.slug}`);
        if (res.data) {
          const loadedSeries: Series = res.data;
          setSeries(loadedSeries);

          const seasonsSorted = [...(loadedSeries.seasons || [])].sort(
            (a, b) => a.seasonNumber - b.seasonNumber
          );
          const flattened: Episode[] = [];
          seasonsSorted.forEach((s) => {
            const epsSorted = [...(s.episodes || [])].sort(
              (a, b) => a.episodeNumber - b.episodeNumber
            );
            flattened.push(...epsSorted);
          });

          let found = flattened.find((e) => e.id === episodeParam);
          if (!found) found = flattened[0];
          setActiveEpisode(found || null);

          if (found) {
            const ownerSeason = seasonsSorted.find((s) =>
              s.episodes?.some((e) => e.id === found!.id)
            );
            if (ownerSeason) {
              setSelectedSeasonNumber(ownerSeason.seasonNumber);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSeries();
  }, [params.slug, episodeParam]);

  // Attach non-passive wheel listener to convert mouse wheel scroll into horizontal carousel scroll
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Only intercept vertical mouse wheel when carousel overflows horizontally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        const atStart = el.scrollLeft <= 0;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;

        // Scroll horizontally unless already at the boundary scrolling outward
        if ((e.deltaY < 0 && !atStart) || (e.deltaY > 0 && !atEnd)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 1.4;
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isLoading, selectedSeasonNumber, sortedSeasons.length]);

  // Smoothly center the currently playing episode inside the carousel
  useEffect(() => {
    if (!activeCardRef.current) return;
    const timer = setTimeout(() => {
      activeCardRef.current?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }, 120);
    return () => clearTimeout(timer);
  }, [activeEpisode?.id, selectedSeasonNumber]);

  const scrollCarousel = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollAmount = Math.max(320, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cinema-cyan animate-spin" />
      </div>
    );
  }

  if (!series || !activeEpisode) {
    notFound();
  }

  const currentSeason =
    sortedSeasons.find((s) => s.seasonNumber === selectedSeasonNumber) ||
    sortedSeasons[0];
  const displayedEpisodes = currentSeason?.episodes || allEpisodes;

  const activeSeasonObj = sortedSeasons.find((s) =>
    s.episodes?.some((e) => e.id === activeEpisode.id)
  );
  const activeSeasonNum = activeSeasonObj?.seasonNumber || 1;

  const currentIndex = allEpisodes.findIndex((e) => e.id === activeEpisode.id);
  const nextEpisode =
    currentIndex >= 0 && currentIndex < allEpisodes.length - 1
      ? allEpisodes[currentIndex + 1]
      : null;

  const handleNextEpisode = () => {
    if (nextEpisode) {
      router.push(`/watch/series/${series.slug}?episode=${nextEpisode.id}`);
    }
  };

  const initialResumeTime = resumeParam ? parseInt(resumeParam, 10) : 0;
  const source = activeEpisode.videoSources?.[0];
  const sourceUrl =
    source?.sourceUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  const fallbackImage =
    series.backdrop ||
    series.poster ||
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-cinema-950 pt-20 sm:pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/series/${series.slug}`}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-cinema-muted hover:text-white transition bg-cinema-900 border border-cinema-700/60 px-3.5 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {series.title}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cinema-900 text-slate-300 border border-cinema-700/60">
              Season {activeSeasonNum}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cinema-cyan/20 text-cinema-cyan border border-cinema-cyan/30">
              Episode {activeEpisode.episodeNumber}
            </span>
          </div>
        </div>

        {/* Main Video Player */}
        <VideoPlayer
          key={activeEpisode.id}
          sourceUrl={sourceUrl}
          sourceFormat={source?.format || "HLS"}
          poster={activeEpisode.thumbnail || series.backdrop || undefined}
          title={`${series.title} - S${activeSeasonNum}:E${activeEpisode.episodeNumber} ${activeEpisode.title}`}
          runtimeMinutes={activeEpisode.runtime || undefined}
          contentType="SERIES"
          contentId={series.id}
          episodeId={activeEpisode.id}
          initialTime={initialResumeTime}
          subtitles={activeEpisode.subtitles || []}
          hasNextEpisode={!!nextEpisode}
          onNextEpisode={handleNextEpisode}
        />

        {/* Compact Current Episode Info Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-cinema-900/60 border border-cinema-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-cinema-cyan uppercase tracking-wide">
              <span>{series.title}</span>
              <span>•</span>
              <span>
                Season {activeSeasonNum} • Episode {activeEpisode.episodeNumber}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              {activeEpisode.title}
            </h1>
            {activeEpisode.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl line-clamp-2">
                {activeEpisode.description}
              </p>
            )}
          </div>

          {nextEpisode && (
            <button
              onClick={handleNextEpisode}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white text-xs font-bold shadow-lg shadow-cinema-red/25 transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Next: Ep {nextEpisode.episodeNumber}</span>
            </button>
          )}
        </div>

        {/* Sequential Visual Episode Carousel (with Images & Mousewheel Horizontal Scroll) */}
        <div className="p-4 sm:p-6 rounded-3xl bg-cinema-900/40 border border-cinema-800/80 space-y-4">
          {/* Header + Season Tabs + Scroll Arrows */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 text-white font-bold text-base">
                <Tv className="w-5 h-5 text-cinema-cyan" />
                <span>Episodes</span>
                <span className="text-xs font-semibold text-cinema-muted bg-cinema-950/80 px-2 py-0.5 rounded-full border border-cinema-800">
                  {displayedEpisodes.length}
                </span>
              </div>

              {/* Season Tabs when multi-season */}
              {sortedSeasons.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                  {sortedSeasons.map((season) => {
                    const isSeasonSelected =
                      season.seasonNumber === currentSeason?.seasonNumber;
                    return (
                      <button
                        key={season.id}
                        onClick={() =>
                          setSelectedSeasonNumber(season.seasonNumber)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          isSeasonSelected
                            ? "bg-cinema-cyan text-black shadow-md shadow-cinema-cyan/25"
                            : "bg-cinema-950/80 border border-cinema-800 text-slate-400 hover:text-white hover:border-cinema-600"
                        }`}
                      >
                        Season {season.seasonNumber}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Header Scroll Controls + Hint */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="hidden md:inline-block text-[11px] text-slate-400 mr-1">
                Mouse scroll to browse episodes →
              </span>
              <button
                onClick={() => scrollCarousel("left")}
                aria-label="Scroll previous episodes"
                className="w-8 h-8 rounded-full bg-cinema-950/90 hover:bg-cinema-800 border border-cinema-700/80 text-slate-200 flex items-center justify-center transition hover:scale-105"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                aria-label="Scroll next episodes"
                className="w-8 h-8 rounded-full bg-cinema-950/90 hover:bg-cinema-800 border border-cinema-700/80 text-slate-200 flex items-center justify-center transition hover:scale-105"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Row of Image Episode Cards */}
          <div className="relative group">
            {/* Left Floating Arrow */}
            <button
              onClick={() => scrollCarousel("left")}
              aria-label="Previous episodes"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-cinema-cyan hover:text-black border border-white/15 text-white items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={carouselRef}
              className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-0.5 select-none"
            >
              {displayedEpisodes.map((ep) => {
                const isPlaying = ep.id === activeEpisode.id;
                const epThumb = ep.thumbnail || fallbackImage;

                return (
                  <button
                    key={ep.id}
                    ref={isPlaying ? activeCardRef : undefined}
                    onClick={() =>
                      router.push(
                        `/watch/series/${series.slug}?episode=${ep.id}`
                      )
                    }
                    className={`group/card relative flex-none w-52 sm:w-60 rounded-2xl overflow-hidden border text-left transition-all duration-200 flex flex-col ${
                      isPlaying
                        ? "bg-cinema-900 border-cinema-cyan ring-2 ring-cinema-cyan/40 shadow-xl shadow-cinema-cyan/15 scale-[1.01]"
                        : "bg-cinema-950/85 border-cinema-800/90 hover:border-cinema-500 hover:bg-cinema-900/90"
                    }`}
                  >
                    {/* Episode 16:9 Thumbnail */}
                    <div className="relative aspect-video w-full bg-cinema-950 overflow-hidden">
                      <img
                        src={epThumb}
                        alt={ep.title}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== fallbackImage) {
                            target.src = fallbackImage;
                          }
                        }}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      {/* Episode Serial Badge Top-Left */}
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase shadow ${
                          isPlaying
                            ? "bg-cinema-cyan text-black"
                            : "bg-black/75 text-white border border-white/15 backdrop-blur-sm"
                        }`}
                      >
                        EP {ep.episodeNumber}
                      </span>

                      {/* Now Playing Badge Top-Right */}
                      {isPlaying && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                          <span>PLAYING</span>
                        </span>
                      )}

                      {/* Runtime Badge Bottom-Right */}
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/75 text-slate-200 text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm">
                        <Clock className="w-2.5 h-2.5 text-cinema-cyan" />
                        <span>{ep.runtime || 45}m</span>
                      </span>

                      {/* Hover / Active Center Play Icon */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                          isPlaying
                            ? "opacity-100 bg-black/25"
                            : "opacity-0 group-hover/card:opacity-100 bg-black/40"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover/card:scale-110 ${
                            isPlaying
                              ? "bg-cinema-cyan text-black"
                              : "bg-cinema-red text-white"
                          }`}
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Episode Title & Metadata */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                            isPlaying
                              ? "text-cinema-cyan"
                              : "text-white group-hover/card:text-cinema-cyan"
                          }`}
                        >
                          {ep.title.toLowerCase().trim() ===
                          `episode ${ep.episodeNumber}`
                            ? ep.title
                            : `${ep.episodeNumber}. ${ep.title}`}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          Season {currentSeason?.seasonNumber || activeSeasonNum}{" "}
                          • Episode {ep.episodeNumber}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Floating Arrow */}
            <button
              onClick={() => scrollCarousel("right")}
              aria-label="Next episodes"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-cinema-cyan hover:text-black border border-white/15 text-white items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeriesWatchPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-cinema-cyan animate-spin" />
        </div>
      }
    >
      <SeriesWatchContent params={params} />
    </Suspense>
  );
}
