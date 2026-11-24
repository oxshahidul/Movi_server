"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { ArrowLeft, Server, Loader2 } from "lucide-react";
import VideoPlayer from "../../../../components/VideoPlayer";
import SuggestedMovies from "../../../../components/SuggestedMovies";
import { Movie, VideoSource } from "../../../../types";
import { fetchApi } from "../../../../lib/api";

function MovieWatchContent({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const resumeParam = searchParams.get("resume");

  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const res = await fetchApi(`/movies/${params.slug}`);
        if (res.data) {
          setMovie(res.data);
          if (res.data.videoSources && res.data.videoSources.length > 0) {
            setSelectedSource(res.data.videoSources[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMovie();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cinema-red animate-spin" />
      </div>
    );
  }

  if (!movie) {
    notFound();
  }

  const initialResumeTime = resumeParam
    ? parseInt(resumeParam, 10)
    : movie.userState?.progressSeconds || 0;

  const defaultSourceUrl =
    selectedSource?.sourceUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  return (
    <div className="min-h-screen bg-cinema-950 pt-20 sm:pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/movie/${movie.slug}`}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-cinema-muted hover:text-white transition bg-cinema-900 border border-cinema-700/60 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Details</span>
          </Link>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cinema-red/20 text-cinema-red border border-cinema-red/30">
            Cinema Stream Mode
          </span>
        </div>

        <VideoPlayer
          key={selectedSource?.id || "default"}
          sourceUrl={defaultSourceUrl}
          sourceFormat={selectedSource?.format || "HLS"}
          poster={movie.backdrop || movie.poster || undefined}
          title={movie.title}
          runtimeMinutes={movie.runtime || undefined}
          contentType="MOVIE"
          contentId={movie.id}
          initialTime={initialResumeTime}
          subtitles={movie.subtitles || []}
        />

        {movie.videoSources && movie.videoSources.length > 1 && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-cinema-900 border border-cinema-700/60">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-cinema-cyan" />
              <span>Streaming Server:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {movie.videoSources.map((source, idx) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedSource?.id === source.id
                      ? "bg-cinema-red text-white shadow-lg shadow-cinema-red/30"
                      : "bg-cinema-950 border border-cinema-700 text-cinema-muted hover:text-white"
                  }`}
                >
                  {source.sourceName && !source.sourceName.toLowerCase().includes("samonline") ? source.sourceName : `Server ${idx + 1}`} ({source.quality})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 rounded-3xl bg-cinema-900/60 border border-cinema-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{movie.title}</h1>
            <div className="flex items-center space-x-2 text-xs text-cinema-muted">
              {movie.releaseYear && <span>{movie.releaseYear}</span>}
              {movie.runtime && <span>• {movie.runtime} min</span>}
              {movie.language && <span>• {movie.language}</span>}
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {movie.description}
          </p>
        </div>

        {/* 20 Suggested Movies Recommendation Section below player */}
        <div className="mt-8">
          <SuggestedMovies currentSlug={movie.slug} title="Recommended Next — 20 Movies" />
        </div>
      </div>
    </div>
  );
}

export default function MovieWatchPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-cinema-red animate-spin" />
        </div>
      }
    >
      <MovieWatchContent params={params} />
    </Suspense>
  );
}
