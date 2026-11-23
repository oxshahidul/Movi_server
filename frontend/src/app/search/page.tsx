"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, Film, Tv, User, Loader2 } from "lucide-react";
import MovieCard from "../../components/MovieCard";
import SeriesCard from "../../components/SeriesCard";
import { fetchApi } from "../../lib/api";
import { Movie, Series, CastMember } from "../../types";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    movies: Movie[];
    series: Series[];
    cast: CastMember[];
  }>({ movies: [], series: [], cast: [] });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ movies: [], series: [], cast: [] });
      return;
    }

    const runSearch = async () => {
      setIsLoading(true);
      try {
        const res = await fetchApi(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
        if (res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    runSearch();
  }, [debouncedQuery]);

  const totalResults = results.movies.length + results.series.length + results.cast.length;

  return (
    <div className="pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Search Screen<span className="text-cinema-red">Box</span>
        </h1>
        <div className="relative">
          <input
            type="text"
            autoFocus
            placeholder="Search by movie title, series, actor, or director..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-cinema-900 border border-cinema-700/80 rounded-2xl pl-12 pr-12 py-4 text-base text-white placeholder-cinema-muted shadow-2xl focus:outline-none focus:border-cinema-red transition"
          />
          <SearchIcon className="w-5 h-5 text-cinema-muted absolute left-4 top-4.5" />
          {isLoading && (
            <Loader2 className="w-5 h-5 text-cinema-red animate-spin absolute right-4 top-4.5" />
          )}
        </div>
      </div>

      {debouncedQuery.trim() && (
        <div className="space-y-10">
          <p className="text-xs text-cinema-muted">
            Found <span className="text-white font-semibold">{totalResults}</span> matches for &quot;{debouncedQuery}&quot;
          </p>

          {results.movies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Film className="w-5 h-5 text-cinema-red" />
                <span>Movies ({results.movies.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.movies.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </div>
          )}

          {results.series.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Tv className="w-5 h-5 text-cinema-cyan" />
                <span>TV Series ({results.series.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.series.map((s) => (
                  <SeriesCard key={s.id} series={s} />
                ))}
              </div>
            </div>
          )}

          {results.cast.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-amber-400" />
                <span>Cast & Crew ({results.cast.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {results.cast.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center space-x-3 p-3 rounded-2xl bg-cinema-900 border border-cinema-700/60"
                  >
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-cinema-800 flex items-center justify-center font-bold">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-sm text-white">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && totalResults === 0 && (
            <div className="text-center py-16 bg-cinema-900/30 rounded-3xl border border-cinema-800">
              <p className="text-base font-semibold text-white">No results found for &quot;{debouncedQuery}&quot;</p>
              <p className="text-xs text-cinema-muted mt-1">
                Try searching with different keywords or browse the catalog
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cinema-red animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
