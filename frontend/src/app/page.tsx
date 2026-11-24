import React from "react";
import HeroBanner from "../components/HeroBanner";
import ContentRow from "../components/ContentRow";
import MovieCard from "../components/MovieCard";
import SeriesCard from "../components/SeriesCard";
import LiveTvChannelCard from "../components/LiveTvChannelCard";
import ContinueWatchingRow from "../components/ContinueWatchingRow";
import TopTenRow from "../components/TopTenRow";
import { Movie, Series, LiveTvChannel } from "../types";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function getHomeData() {
  try {
    const [featuredRes, moviesRes, seriesRes, southRes, liveRes] = await Promise.all([
      fetch(`${API_BASE_URL}/movies/featured`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/movies?limit=16`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/series?limit=16`, { cache: "no-store" }).then((r) => r.json()),
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

  // Combine top-rated movies & popular series for Top 10 Bangladesh section
  const topTenItems: any[] = [];
  const movieSlice = (movies.length > 0 ? movies : featured).slice(0, 6);
  const seriesSlice = series.slice(0, 4);

  movieSlice.forEach((m) => topTenItems.push({ ...m, type: "MOVIE" }));
  seriesSlice.forEach((s) => topTenItems.push({ ...s, type: "SERIES" }));
  // Sort by rating or default
  topTenItems.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));

  // Hero carousel movies: featured or first few movies
  const heroMovies = featured.length > 0 ? featured : movies.slice(0, 5);

  // Filter Bangla originals
  const banglaMovies = movies.filter((m) =>
    m.genres?.some((g) => g.slug === "bangla-originals") || m.language === "Bengali"
  );
  const banglaSeries = series.filter((s) =>
    s.genres?.some((g) => g.slug === "bangla-originals")
  );

  return (
    <div className="pb-16 bg-neutral-950 min-h-screen">
      {/* 1. iScreen-Style Hero Banner Carousel */}
      {heroMovies.length > 0 && <HeroBanner movies={heroMovies} />}

      {/* 2. Continue Watching (Client Session Driven) */}
      <ContinueWatchingRow />

      {/* 3. New Release / Trending Blockbusters */}
      {movies.length > 0 && (
        <ContentRow
          title="New Releases & Blockbusters"
          subtitle="Top streamed movies right now on NexFlix"
          viewAllHref="/movies"
        >
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </ContentRow>
      )}

      {/* 4. Top 10 in Bangladesh (iScreen-Style Large Outlined Numbering) */}
      {topTenItems.length > 0 && <TopTenRow items={topTenItems} />}

      {/* 5. Live Television & Sports */}
      {liveChannels.length > 0 && (
        <ContentRow
          title="Live TV & Sports"
          subtitle="Bufferless BDIX live broadcast with low-latency tuning"
          viewAllHref="/live"
        >
          {liveChannels.map((c) => (
            <LiveTvChannelCard key={c.id} channel={c} />
          ))}
        </ContentRow>
      )}

      {/* 6. Popular TV Series Carousel */}
      {series.length > 0 && (
        <ContentRow
          title="Binge-Worthy Series"
          subtitle="Complete seasons with full HD episodes"
          viewAllHref="/series"
        >
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </ContentRow>
      )}

      {/* 7. South Indian Blockbusters Carousel */}
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

      {/* 8. Bangla Originals & Regional Cinema */}
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
    </div>
  );
}
