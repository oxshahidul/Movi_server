import React from "react";
import Link from "next/link";
import SeriesCard from "../../components/SeriesCard";
import { Series } from "../../types";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface SeriesCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

interface SeriesPageProps {
  searchParams: {
    category?: string;
    genre?: string;
    page?: string;
  };
}

async function getSeriesData(searchParams: SeriesPageProps["searchParams"]) {
  try {
    const selectedCategory = searchParams.category || searchParams.genre;
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      params.append("category", selectedCategory);
    }
    if (searchParams.page) params.append("page", searchParams.page);
    params.append("limit", "36");

    const [seriesRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/series?${params.toString()}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/series/categories`, { cache: "no-store" }).then((r) => r.json()),
    ]);

    // Fallback official categories if API is loading or network error
    const defaultCategories: SeriesCategory[] = [
      { id: 25, name: "TV & WEB Series", slug: "tv-web-series" },
      { id: 26, name: "KOREAN TV & WEB Series", slug: "korean-tv-web-series" },
      { id: 27, name: "Cartoon TV Series", slug: "cartoon-tv-series" },
      { id: 28, name: "Documentary", slug: "documentary" },
      { id: 29, name: "WWE & AEW Wrestling", slug: "wwe-aew-wrestling" },
      { id: 30, name: "Award & TV Shows", slug: "award-tv-shows" },
    ];

    const categoriesList: SeriesCategory[] =
      categoriesRes?.data && Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0
        ? categoriesRes.data
        : defaultCategories;

    return {
      seriesList: (seriesRes?.data || []) as Series[],
      categories: categoriesList,
      pagination: seriesRes?.pagination || { page: 1, limit: 36, total: 0, totalPages: 1 },
      total: seriesRes?.pagination?.total || 0,
    };
  } catch (error) {
    console.error("Failed to load series:", error);
    return {
      seriesList: [],
      categories: [
        { id: 25, name: "TV & WEB Series", slug: "tv-web-series" },
        { id: 26, name: "KOREAN TV & WEB Series", slug: "korean-tv-web-series" },
        { id: 27, name: "Cartoon TV Series", slug: "cartoon-tv-series" },
        { id: 28, name: "Documentary", slug: "documentary" },
        { id: 29, name: "WWE & AEW Wrestling", slug: "wwe-aew-wrestling" },
        { id: 30, name: "Award & TV Shows", slug: "award-tv-shows" },
      ],
      pagination: { page: 1, limit: 36, total: 0, totalPages: 1 },
      total: 0,
    };
  }
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const selectedCategory = searchParams.category || searchParams.genre;
  const currentPage = parseInt(searchParams.page || "1", 10);
  const { seriesList, categories, pagination, total } = await getSeriesData(searchParams);

  return (
    <div className="pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-cinema-700/60 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <span className="w-2.5 h-8 bg-cinema-cyan rounded-full inline-block" />
            <span>TV Series</span>
          </h1>
          <p className="text-sm text-cinema-muted mt-1 font-medium">
            Stream entire seasons and multi-episode series
          </p>
        </div>

        {/* Filter Pills - Only the 6 official TV Series categories */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          {/* All TV Series Pill */}
          <Link
            href="/series"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              !selectedCategory
                ? "bg-cinema-cyan text-black shadow-lg shadow-cinema-cyan/25 scale-105"
                : "bg-cinema-900 border border-cinema-700 text-cinema-muted hover:text-white hover:border-cinema-500"
            }`}
          >
            All TV Series
          </Link>

          {/* 6 Official Categories */}
          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/series?category=${cat.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-cinema-cyan text-black shadow-lg shadow-cinema-cyan/25 scale-105"
                    : "bg-cinema-900 border border-cinema-700 text-cinema-muted hover:text-white hover:border-cinema-500"
                }`}
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && cat.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? "bg-black/20 text-black" : "bg-cinema-800 text-slate-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid of Series */}
      {seriesList.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {seriesList.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 select-none">
              {currentPage > 1 && (
                <Link
                  href={`/series?${selectedCategory ? `category=${selectedCategory}&` : ""}page=${currentPage - 1}`}
                  className="px-4 py-2 rounded-xl bg-cinema-900 border border-cinema-700 text-xs font-bold text-slate-300 hover:text-white hover:border-cinema-500 transition"
                >
                  ← Previous
                </Link>
              )}

              <div className="flex items-center gap-1.5">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                  const isCurr = p === currentPage;
                  return (
                    <Link
                      key={p}
                      href={`/series?${selectedCategory ? `category=${selectedCategory}&` : ""}page=${p}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition ${
                        isCurr
                          ? "bg-cinema-cyan text-black shadow-lg shadow-cinema-cyan/20"
                          : "bg-cinema-900/80 border border-cinema-700/80 text-slate-400 hover:text-white hover:border-cinema-500"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>

              {currentPage < pagination.totalPages && (
                <Link
                  href={`/series?${selectedCategory ? `category=${selectedCategory}&` : ""}page=${currentPage + 1}`}
                  className="px-4 py-2 rounded-xl bg-cinema-900 border border-cinema-700 text-xs font-bold text-slate-300 hover:text-white hover:border-cinema-500 transition"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-cinema-900/40 rounded-3xl border border-cinema-800 p-8">
          <p className="text-lg font-bold text-white mb-2">No series found in this category</p>
          <p className="text-xs text-cinema-muted mb-5">
            More content is currently being synchronized from the BDIX storage servers.
          </p>
          <Link
            href="/series"
            className="inline-flex items-center px-4 py-2 bg-cinema-cyan text-black text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity"
          >
            View All TV Series
          </Link>
        </div>
      )}
    </div>
  );
}
