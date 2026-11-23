import { z } from "zod";

export const watchlistSchema = z.object({
  contentType: z.enum(["MOVIE", "SERIES"]),
  contentId: z.string().min(1, "contentId is required"),
});

export const favoriteSchema = z.object({
  contentType: z.enum(["MOVIE", "SERIES"]),
  contentId: z.string().min(1, "contentId is required"),
});

export const ratingSchema = z.object({
  contentType: z.enum(["MOVIE", "SERIES"]),
  contentId: z.string().min(1, "contentId is required"),
  rating: z.number().int().min(1, "Rating must be between 1 and 10").max(10, "Rating must be between 1 and 10"),
});

export const watchHistoryHeartbeatSchema = z.object({
  contentType: z.enum(["MOVIE", "SERIES"]),
  contentId: z.string().min(1, "contentId is required"),
  episodeId: z.string().optional(),
  progressSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
});
