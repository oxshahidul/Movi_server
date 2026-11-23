import React from "react";
import SeriesCard from "../../components/SeriesCard";
import { Series, Genre } from "../../types";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface SeriesPageProps {
  searchParams: {
    genre?: string;
    page?: string;
  };
}

async function getSeriesData(searchParams: SeriesPageProps["searchParams"]) {
  try {
    const params = new URLSearchParams();
    if (searchParams.genre) params.append("genre", searchParams.genre);
    if (searchParams.page) params.append("page", searchParams.page);
    params.append("limit", "24");

    const [seriesRes, genresRes] = await Promise.all([
      fetch(`${API_BASE_URL}/series?${params.toString()}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/genres`, { cache: "no-store" }).then((r) => r.json()),
    ]);

    return {
      seriesList: (seriesRes?.data || []) as Series[],
      genres: (genresRes?.data || []) as Genre[],
    };
  } catch (error) {
    console.error("Failed to load series:", error);
    return { seriesList: [], genres: [] };
  }
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const { seriesList, genres } = await getSeriesData(searchParams);

  return (
    <div className="pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-cinema-700/60 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-2">
            <span className="w-2 h-7 bg-cinema-cyan rounded-full inline-block" />
            <span>TV Series</span>
          </h1>
          <p className="text-sm text-cinema-muted mt-1">
            Stream entire seasons and multi-episode series
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/series"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              !searchParams.genre
                ? "bg-cinema-cyan text-black"
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
                href={`/series?genre=${g.slug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  active
                    ? "bg-cinema-cyan text-black shadow-lg shadow-cinema-cyan/30"
                    : "bg-cinema-900 border border-cinema-700 text-cinema-muted hover:text-white hover:border-cinema-600"
                }`}
              >
                {g.name}
              </a>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {seriesList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {seriesList.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-cinema-900/40 rounded-3xl border border-cinema-800">
          <p className="text-lg font-semibold text-white">No series found</p>
        </div>
      )}
    </div>
  );
}
