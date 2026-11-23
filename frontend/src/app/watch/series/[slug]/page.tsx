"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Play, Tv, Loader2 } from "lucide-react";
import VideoPlayer from "../../../../components/VideoPlayer";
import { Series, Episode } from "../../../../types";
import { fetchApi } from "../../../../lib/api";

function SeriesWatchContent({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const episodeParam = searchParams.get("episode");
  const resumeParam = searchParams.get("resume");

  const [series, setSeries] = useState<Series | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const res = await fetchApi(`/series/${params.slug}`);
        if (res.data) {
          setSeries(res.data);

          const allEpisodes: Episode[] = [];
          res.data.seasons?.forEach((s: any) => {
            if (s.episodes) allEpisodes.push(...s.episodes);
          });

          let found = allEpisodes.find((e) => e.id === episodeParam);
          if (!found) found = allEpisodes[0];
          setActiveEpisode(found || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSeries();
  }, [params.slug, episodeParam]);

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

  const allEpisodes: Episode[] = [];
  series.seasons?.forEach((s) => {
    if (s.episodes) allEpisodes.push(...s.episodes);
  });

  const currentIndex = allEpisodes.findIndex((e) => e.id === activeEpisode.id);
  const nextEpisode = currentIndex >= 0 && currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  const handleNextEpisode = () => {
    if (nextEpisode) {
      router.push(`/watch/series/${series.slug}?episode=${nextEpisode.id}`);
    }
  };

  const initialResumeTime = resumeParam ? parseInt(resumeParam, 10) : 0;
  const source = activeEpisode.videoSources?.[0];
  const sourceUrl = source?.sourceUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  return (
    <div className="min-h-screen bg-cinema-950 pt-20 sm:pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/series/${series.slug}`}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-cinema-muted hover:text-white transition bg-cinema-900 border border-cinema-700/60 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Series</span>
          </Link>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cinema-cyan/20 text-cinema-cyan border border-cinema-cyan/30">
            Episode {activeEpisode.episodeNumber}
          </span>
        </div>

        <VideoPlayer
          key={activeEpisode.id}
          sourceUrl={sourceUrl}
          sourceFormat={source?.format || "HLS"}
          poster={activeEpisode.thumbnail || series.backdrop || undefined}
          title={`${series.title} - Ep ${activeEpisode.episodeNumber}: ${activeEpisode.title}`}
          contentType="SERIES"
          contentId={series.id}
          episodeId={activeEpisode.id}
          initialTime={initialResumeTime}
          subtitles={activeEpisode.subtitles || []}
          hasNextEpisode={!!nextEpisode}
          onNextEpisode={handleNextEpisode}
        />

        <div className="p-6 rounded-3xl bg-cinema-900/60 border border-cinema-800 space-y-2">
          <span className="text-xs font-bold text-cinema-cyan uppercase">
            {series.title} • Episode {activeEpisode.episodeNumber}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{activeEpisode.title}</h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {activeEpisode.description}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-cinema-900/40 border border-cinema-800/80 space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <Tv className="w-5 h-5 text-cinema-cyan" />
            <span>All Episodes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allEpisodes.map((ep) => {
              const isPlaying = ep.id === activeEpisode.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => router.push(`/watch/series/${series.slug}?episode=${ep.id}`)}
                  className={`flex items-center space-x-3 p-2.5 rounded-2xl border text-left transition ${
                    isPlaying
                      ? "bg-cinema-cyan/20 border-cinema-cyan text-white shadow-lg"
                      : "bg-cinema-950/70 border-cinema-800 text-slate-300 hover:border-cinema-700 hover:text-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-cinema-900 flex items-center justify-center font-bold text-xs shrink-0">
                    {isPlaying ? <Play className="w-4 h-4 fill-cinema-cyan text-cinema-cyan" /> : ep.episodeNumber}
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-xs font-semibold truncate">{ep.title}</p>
                    <p className="text-[10px] text-cinema-muted">Episode {ep.episodeNumber}</p>
                  </div>
                </button>
              );
            })}
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
