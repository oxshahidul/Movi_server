import React from "react";
import MovieCard from "../../components/MovieCard";
import { Movie, Genre } from "../../types";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface MoviesPageProps {
  searchParams: {
    genre?: string;
    sortBy?: string;
    page?: string;
  };
}

async function getMoviesData(searchParams: MoviesPageProps["searchParams"]) {
  try {
    const params = new URLSearchParams();
    if (searchParams.genre) params.append("genre", searchParams.genre);
    if (searchParams.sortBy) params.append("sortBy", searchParams.sortBy);
    if (searchParams.page) params.append("page", searchParams.page);
    params.append("limit", "24");

    const [moviesRes, genresRes] = await Promise.all([
      fetch(`${API_BASE_URL}/movies?${params.toString()}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/genres`, { cache: "no-store" }).then((r) => r.json()),
    ]);

    return {
      movies: (moviesRes?.data || []) as Movie[],
      pagination: moviesRes?.pagination,
      genres: (genresRes?.data || []) as Genre[],
    };
  } catch (error) {
    console.error("Failed to load movies:", error);
    return { movies: [], genres: [] };
  }
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { movies, genres, pagination } = await getMoviesData(searchParams);

  return (
    <div className="pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-cinema-700/60 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-2">
            <span className="w-2 h-7 bg-cinema-red rounded-full inline-block" />
            <span>Movies Catalog</span>
          </h1>
          <p className="text-sm text-cinema-muted mt-1">
            Browse the full cinema collection with BDIX high-speed streams
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/movies"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              !searchParams.genre
                ? "bg-cinema-red text-white"
                : "bg-cinema-900 border border-cinema-700 text-cinema-muted hover:text-white"
            }`}
          >
            All Genres
          </a>
          {genres.map((g) => {
            const active = searchParams.genre === g.slug;
            return (
              <a
                key={g.id}
                href={`/movies?genre=${g.slug}${searchParams.sortBy ? `&sortBy=${searchParams.sortBy}` : ""}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  active
                    ? "bg-cinema-red text-white shadow-lg shadow-cinema-red/30"
                    : "bg-cinema-900 border border-cinema-700 text-cinema-muted hover:text-white hover:border-cinema-600"
                }`}
              >
                {g.name}
              </a>
            );
          })}
        </div>
      </div>

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-cinema-900/40 rounded-3xl border border-cinema-800">
          <p className="text-lg font-semibold text-white">No movies found</p>
          <p className="text-sm text-cinema-muted mt-1">
            Try choosing a different genre or clearing filters
          </p>
        </div>
      )}
    </div>
  );
}
