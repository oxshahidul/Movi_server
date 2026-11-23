import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  poster: z.string().optional(),
  backdrop: z.string().optional(),
  trailerUrl: z.string().optional(),
  releaseYear: z.union([z.number(), z.string().regex(/^\d+$/)]).optional(),
  runtime: z.union([z.number(), z.string().regex(/^\d+$/)]).optional(),
  rating: z.union([z.number(), z.string()]).optional(),
  language: z.string().optional(),
  genreIds: z.array(z.number()).optional(),
  videoSources: z
    .array(
      z.object({
        sourceName: z.string().optional(),
        sourceUrl: z.string().min(1, "sourceUrl is required"),
        quality: z.string().optional(),
        format: z.string().optional(),
      })
    )
    .optional(),
});

export const updateMovieSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  poster: z.string().optional(),
  backdrop: z.string().optional(),
  trailerUrl: z.string().optional(),
  releaseYear: z.union([z.number(), z.string().regex(/^\d+$/)]).optional(),
  runtime: z.union([z.number(), z.string().regex(/^\d+$/)]).optional(),
  rating: z.union([z.number(), z.string()]).optional(),
  language: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const createSeriesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  poster: z.string().optional(),
  backdrop: z.string().optional(),
  trailerUrl: z.string().optional(),
  releaseYear: z.union([z.number(), z.string().regex(/^\d+$/)]).optional(),
  rating: z.union([z.number(), z.string()]).optional(),
  genreIds: z.array(z.number()).optional(),
});

export const createSeasonSchema = z.object({
  seriesId: z.string().min(1, "seriesId is required"),
  seasonNumber: z.union([z.number(), z.string().regex(/^\d+$/)]),
  title: z.string().optional(),
  description: z.string().optional(),
  poster: z.string().optional(),
});

export const createEpisodeSchema = z.object({
  seasonId: z.string().min(1, "seasonId is required"),
  episodeNumber: z.union([z.number(), z.string().regex(/^\d+$/)]),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  runtime: z.union([z.number(), z.string().regex(/^\d+$/)]).optional(),
  sourceUrl: z.string().optional(),
  sourceName: z.string().optional(),
});

export const createVideoSourceSchema = z.object({
  contentType: z.enum(["MOVIE", "SERIES"]),
  movieId: z.string().optional(),
  episodeId: z.string().optional(),
  sourceName: z.string().min(1, "sourceName is required"),
  sourceUrl: z.string().min(1, "sourceUrl is required"),
  quality: z.string().optional(),
  format: z.string().optional(),
});

export const createSubtitleSchema = z.object({
  contentType: z.enum(["MOVIE", "SERIES"]),
  movieId: z.string().optional(),
  episodeId: z.string().optional(),
  language: z.string().min(1, "language is required"),
  subtitleUrl: z.string().min(1, "subtitleUrl is required"),
  format: z.string().optional(),
});

export const createCastSchema = z.object({
  name: z.string().min(1, "Cast name is required"),
  image: z.string().optional(),
  biography: z.string().optional(),
});

export const assignCastSchema = z.object({
  castId: z.string().min(1, "castId is required"),
  movieId: z.string().optional(),
  seriesId: z.string().optional(),
  characterName: z.string().optional(),
});
