import React from "react";
import HeroBanner from "../components/HeroBanner";
import ContentRow from "../components/ContentRow";
import MovieCard from "../components/MovieCard";
import SeriesCard from "../components/SeriesCard";
import LiveTvChannelCard from "../components/LiveTvChannelCard";
import ContinueWatchingRow from "../components/ContinueWatchingRow";
import { Movie, Series, LiveTvChannel } from "../types";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function getHomeData() {
  try {
    const [featuredRes, moviesRes, seriesRes, southRes, liveRes] = await Promise.all([
      fetch(`${API_BASE_URL}/movies/featured`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/movies?limit=12`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/series?limit=12`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/movies?genre=south-indian&limit=12`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/live-tv/featured`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: [] })),
    ]);

    return {
      featured: (featuredRes?.data || []) as Movie[],
      movies: (moviesRes?.data || []) as Movie[],
      series: (seriesRes?.data || []) as Series[],
      southMovies: (southRes?.data || []) as Movie[],
      liveChannels: (liveRes?.data || []) as LiveTvChannel[],
    };
  } catch (error) {
    console.error("Failed to load home data:", error);
    return { featured: [], movies: [], series: [], southMovies: [], liveChannels: [] };
  }
}

export default async function HomePage() {
  const { featured, movies, series, southMovies, liveChannels } = await getHomeData();
  const spotlightMovie = featured[0] || movies[0];

  // Filter Bangla originals
  const banglaMovies = movies.filter((m) =>
    m.genres.some((g) => g.slug === "bangla-originals") || m.language === "Bengali"
  );
  const banglaSeries = series.filter((s) =>
    s.genres.some((g) => g.slug === "bangla-originals")
  );

  return (
    <div className="pb-12">
      {/* 1. Immersive Hero Banner */}
      {spotlightMovie && <HeroBanner movie={spotlightMovie} />}

      {/* 2. Continue Watching (Client Session Driven) */}
      <ContinueWatchingRow />

      {/* Live TV Channels Row */}
      {liveChannels.length > 0 && (
        <ContentRow
          title="Live Television & Sports"
          subtitle="Bufferless BDIX live broadcast with direct stream switching"
          viewAllHref="/live"
        >
          {liveChannels.map((c) => (
            <LiveTvChannelCard key={c.id} channel={c} />
          ))}
        </ContentRow>
      )}

      {/* 3. Trending Movies Carousel */}
      {movies.length > 0 && (
        <ContentRow
          title="Trending Blockbusters"
          subtitle="Top streamed movies right now"
          viewAllHref="/movies"
        >
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </ContentRow>
      )}

      {/* 4. Popular TV Series Carousel */}
      {series.length > 0 && (
        <ContentRow
          title="Binge-Worthy Series"
          subtitle="Complete seasons with full episodes"
          viewAllHref="/series"
        >
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </ContentRow>
      )}

      {/* 5. South Indian Blockbusters Carousel */}
      {southMovies.length > 0 && (
        <ContentRow
          title="South Indian Blockbusters"
          subtitle="Action-packed mass cinema, thrilling mysteries & dramas from the South"
          viewAllHref="/movies?genre=south-indian"
        >
          {southMovies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </ContentRow>
      )}

      {/* 5. Bangla Originals & Regional Cinema */}
      {(banglaMovies.length > 0 || banglaSeries.length > 0) && (
        <ContentRow
          title="Bangla Originals & BDIX Hits"
          subtitle="Stream high-speed bufferless local releases"
        >
          {banglaMovies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
          {banglaSeries.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </ContentRow>
      )}

      {/* 6. Top Rated Movies Spotlight */}
      {featured.length > 1 && (
        <ContentRow
          title="Critically Acclaimed"
          subtitle="Highest IMDb community ratings"
          viewAllHref="/movies?sortBy=rating"
        >
          {featured.slice(1).map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </ContentRow>
      )}
    </div>
  );
}
