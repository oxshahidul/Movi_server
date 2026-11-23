import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Star, ArrowLeft, Tv } from "lucide-react";
import RatingStars from "../../../components/RatingStars";
import { Series } from "../../../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function getSeries(slug: string): Promise<Series | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/series/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function SeriesDetailsPage({ params }: { params: { slug: string } }) {
  const series = await getSeries(params.slug);
  if (!series) notFound();

  const backdropUrl =
    series.backdrop ||
    series.poster ||
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80";

  const firstSeason = series.seasons?.[0];
  const firstEpisode = firstSeason?.episodes?.[0];

  return (
    <div className="min-h-screen bg-cinema-950 pb-20">
      {/* Top Banner */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/70 to-cinema-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/80 to-transparent w-full md:w-2/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 z-10">
          <Link
            href="/series"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-cinema-muted hover:text-white transition bg-cinema-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-cinema-700/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Series</span>
          </Link>
        </div>
      </div>

      {/* Main Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-52 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Poster */}
          <div className="w-48 sm:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-cinema-700/80 bg-cinema-900 mx-auto md:mx-0">
            <img
              src={series.poster || ""}
              alt={series.title}
              className="w-full h-auto aspect-[2/3] object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {series.rating && (
                  <span className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{series.rating} / 10</span>
                  </span>
                )}
                {series.releaseYear && (
                  <span className="bg-cinema-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                    {series.releaseYear}
                  </span>
                )}
                <span className="bg-cinema-cyan/20 border border-cinema-cyan/40 text-cinema-cyan text-xs font-bold px-2 py-0.5 rounded-md">
                  {series.seasons?.length || 1} Season{series.seasons && series.seasons.length > 1 ? "s" : ""}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {series.title}
              </h1>

              <div className="flex flex-wrap gap-2 pt-1">
                {series.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/series?genre=${g.slug}`}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-cinema-900 border border-cinema-700/80 text-slate-300 hover:text-white hover:border-cinema-500 transition"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Play Episode 1 */}
            {firstEpisode && (
              <div className="pt-2">
                <Link
                  href={`/watch/series/${series.slug}?episode=${firstEpisode.id}`}
                  className="inline-flex items-center space-x-2.5 bg-cinema-red hover:bg-cinema-red-hover text-white font-bold px-8 py-3.5 rounded-full shadow-xl shadow-cinema-red/40 transition transform hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Season 1 (Ep 1)</span>
                </Link>
              </div>
            )}

            {/* Interactive Rating Component */}
            <RatingStars
              contentId={series.id}
              contentType="SERIES"
              currentRating={series.rating}
            />

            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cinema-muted">
                Storyline
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                {series.description}
              </p>
            </div>
          </div>
        </div>

        {/* Season & Episode Navigator */}
        <div className="space-y-6 pt-6 border-t border-cinema-800">
          <div className="flex items-center space-x-3">
            <Tv className="w-6 h-6 text-cinema-cyan" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Episodes & Seasons
            </h2>
          </div>

          {series.seasons?.map((season) => (
            <div key={season.id} className="space-y-4">
              <h3 className="text-base font-semibold text-slate-200">
                {season.title || `Season ${season.seasonNumber}`}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {season.episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/watch/series/${series.slug}?episode=${ep.id}`}
                    className="group flex flex-col rounded-2xl bg-cinema-900 border border-cinema-700/70 overflow-hidden hover:border-cinema-500 transition shadow-lg"
                  >
                    <div className="relative aspect-video w-full bg-cinema-950 overflow-hidden">
                      <img
                        src={ep.thumbnail || series.backdrop || ""}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-cinema-red flex items-center justify-center text-white shadow-xl">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {ep.runtime ? `${ep.runtime}m` : "45m"}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-cinema-cyan uppercase">
                          Episode {ep.episodeNumber}
                        </span>
                        <h4 className="text-sm font-semibold text-white group-hover:text-cinema-cyan transition line-clamp-1">
                          {ep.title}
                        </h4>
                        <p className="text-xs text-cinema-muted line-clamp-2 mt-1">
                          {ep.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
