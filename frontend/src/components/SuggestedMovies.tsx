"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Film } from "lucide-react";
import { Movie } from "../types";
import { fetchApi } from "../lib/api";
import MovieCard from "./MovieCard";

interface SuggestedMoviesProps {
  currentSlug: string;
  title?: string;
}

export default function SuggestedMovies({
  currentSlug,
  title = "You May Also Like",
}: SuggestedMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        const res = await fetchApi(`/movies/${currentSlug}/recommendations?limit=20`);
        if (isMounted && res.data && Array.isArray(res.data)) {
          setMovies(res.data);
        }
      } catch (err) {
        console.error("Failed to load suggested movies:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (currentSlug) {
      loadSuggestions();
    }

    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  if (!isLoading && movies.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 pb-12 space-y-6">
      <div className="flex items-center justify-between border-b border-cinema-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cinema-red/20 border border-cinema-red/30 flex items-center justify-center text-cinema-red">
            <Sparkles className="w-4 h-4 fill-cinema-red" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>{title}</span>
              <span className="text-xs font-bold text-cinema-red bg-cinema-red/10 border border-cinema-red/20 px-2 py-0.5 rounded-full">
                20 Suggestions
              </span>
            </h2>
            <p className="text-xs text-cinema-muted">
              Curated titles matching genre, high rating, and cinema popularity
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] w-full rounded-2xl bg-cinema-900/60 animate-pulse border border-cinema-800"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((m) => (
            <div key={m.id} className="w-full flex justify-center">
              <div className="w-full max-w-[210px]">
                <MovieCard movie={m} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
