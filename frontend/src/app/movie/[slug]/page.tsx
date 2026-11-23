import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Star, Clock, Globe, Film, ArrowLeft } from "lucide-react";
import RatingStars from "../../../components/RatingStars";
import SuggestedMovies from "../../../components/SuggestedMovies";
import { Movie } from "../../../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function getMovie(slug: string): Promise<Movie | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/movies/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function MovieDetailsPage({ params }: { params: { slug: string } }) {
  const movie = await getMovie(params.slug);
  if (!movie) notFound();

  const backdropUrl =
    movie.backdrop ||
    movie.poster ||
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-cinema-950 pb-20">
      {/* Top Banner with Backdrop */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/70 to-cinema-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/80 to-transparent w-full md:w-2/3" />

        {/* Back Link */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 z-10">
          <Link
            href="/movies"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-cinema-muted hover:text-white transition bg-cinema-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-cinema-700/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Movies</span>
          </Link>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-52 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left: Poster */}
          <div className="w-48 sm:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-cinema-700/80 bg-cinema-900 mx-auto md:mx-0">
            <img
              src={movie.poster || ""}
              alt={movie.title}
              className="w-full h-auto aspect-[2/3] object-cover"
            />
          </div>

          {/* Right: Details */}
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {movie.rating && (
                  <span className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{movie.rating} / 10</span>
                  </span>
                )}
                {movie.releaseYear && (
                  <span className="bg-cinema-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                    {movie.releaseYear}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{movie.runtime} min</span>
                  </span>
                )}
                {movie.language && (
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Globe className="w-3 h-3" />
                    <span>{movie.language}</span>
                  </span>
                )}
                <span className="border border-cinema-cyan/40 text-cinema-cyan text-[10px] font-bold px-1.5 py-0.5 rounded">
                  BDIX BUFFERLESS
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/movies?genre=${g.slug}`}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-cinema-900 border border-cinema-700/80 text-slate-300 hover:text-white hover:border-cinema-500 transition"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Watch Now Button */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/watch/movie/${movie.slug}`}
                className="flex items-center space-x-2.5 bg-cinema-red hover:bg-cinema-red-hover text-white font-bold px-8 py-3.5 rounded-full shadow-xl shadow-cinema-red/40 transition transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Stream Movie Now</span>
              </Link>
            </div>

            {/* Interactive Rating Component */}
            <RatingStars
              contentId={movie.id}
              contentType="MOVIE"
              currentRating={movie.rating}
            />

            {/* Synopsis */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cinema-muted">
                Storyline
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            </div>

            {/* Video Streams Info */}
            {movie.videoSources && movie.videoSources.length > 0 && (
              <div className="p-4 rounded-2xl bg-cinema-900/60 border border-cinema-800 space-y-2 max-w-xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Film className="w-4 h-4 text-cinema-red" />
                  <span>Available Streaming Nodes</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {movie.videoSources.map((s, idx) => (
                    <span
                      key={s.id}
                      className="text-xs px-2.5 py-1 rounded-lg bg-cinema-950 border border-cinema-700/70 text-slate-300 flex items-center space-x-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{s.sourceName && !s.sourceName.toLowerCase().includes("samonline") ? s.sourceName : `Server ${idx + 1}`}</span>
                      <span className="text-[10px] text-cinema-muted">({s.quality})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cast Members */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cinema-muted">
                  Starring Cast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {movie.cast.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center space-x-3 p-2 rounded-xl bg-cinema-900/40 border border-cinema-800"
                    >
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-cover border border-cinema-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cinema-800 flex items-center justify-center font-bold text-xs">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                        <p className="text-[11px] text-cinema-muted truncate">{c.characterName || "Actor"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 20 Suggested Movies Recommendation Section */}
        <div className="mt-12 pt-6">
          <SuggestedMovies currentSlug={movie.slug} />
        </div>
      </div>
    </div>
  );
}
