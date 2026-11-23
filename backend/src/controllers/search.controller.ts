import { Request, Response } from "express";
import prisma from "../prisma/client";
import { ContentStatus } from "@prisma/client";

export const searchAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.json({
        success: true,
        data: {
          movies: [],
          series: [],
          cast: [],
        },
      });
      return;
    }

    const searchTerm = query.trim();

    const [movies, series, cast] = await Promise.all([
      prisma.movie.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: 10,
        include: {
          genres: {
            include: { genre: true },
          },
        },
      }),
      prisma.series.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: 10,
        include: {
          genres: {
            include: { genre: true },
          },
        },
      }),
      prisma.cast.findMany({
        where: {
          name: { contains: searchTerm },
        },
        take: 6,
      }),
    ]);

    res.json({
      success: true,
      data: {
        movies: movies.map((m) => ({
          ...m,
          type: "movie",
          genres: m.genres.map((g) => g.genre),
        })),
        series: series.map((s) => ({
          ...s,
          type: "series",
          genres: s.genres.map((g) => g.genre),
        })),
        cast,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search failed" });
  }
};
