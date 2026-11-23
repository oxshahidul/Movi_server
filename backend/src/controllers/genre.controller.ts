import { Request, Response } from "express";
import prisma from "../prisma/client";

export const getGenres = async (_req: Request, res: Response): Promise<void> => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
    });

    const formatted = genres.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      totalTitles: g._count.movies + g._count.series,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch genres" });
  }
};
