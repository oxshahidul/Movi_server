import { Request, Response } from "express";
import prisma from "../prisma/client";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getLiveChannels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, featured, page, limit } = req.query;

    const whereClause: any = {
      status: "ACTIVE",
    };

    if (category && typeof category === "string" && category !== "All") {
      whereClause.category = category;
    }

    if (featured === "true") {
      whereClause.isFeatured = true;
    }

    if (search && typeof search === "string" && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { category: { contains: search.trim() } },
      ];
    }

    const take = limit ? parseInt(limit as string, 10) : undefined;
    const skip = page && take ? (parseInt(page as string, 10) - 1) * take : undefined;

    const [channels, total] = await Promise.all([
      prisma.liveTvChannel.findMany({
        where: whereClause,
        orderBy: [{ channelNumber: "asc" }, { name: "asc" }],
        take,
        skip,
      }),
      prisma.liveTvChannel.count({ where: whereClause }),
    ]);

    sendSuccess(res, {
      channels,
      total,
      page: page ? parseInt(page as string, 10) : 1,
      limit: take || total,
    });
  } catch (error: any) {
    console.error("Failed to fetch live channels:", error);
    sendError(res, "Failed to fetch live channels", 500);
  }
};

export const getLiveCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rawCategories = await prisma.liveTvChannel.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const categories = rawCategories.map((c) => ({
      name: c.category,
      count: c._count.id,
    }));

    sendSuccess(res, categories);
  } catch (error: any) {
    console.error("Failed to fetch live categories:", error);
    sendError(res, "Failed to fetch live categories", 500);
  }
};

export const getFeaturedChannels = async (_req: Request, res: Response): Promise<void> => {
  try {
    const channels = await prisma.liveTvChannel.findMany({
      where: {
        status: "ACTIVE",
        isFeatured: true,
      },
      orderBy: { channelNumber: "asc" },
      take: 16,
    });

    sendSuccess(res, channels);
  } catch (error: any) {
    console.error("Failed to fetch featured channels:", error);
    sendError(res, "Failed to fetch featured channels", 500);
  }
};

export const getChannelBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const channel = await prisma.liveTvChannel.findUnique({
      where: { slug },
    });

    if (!channel) {
      sendError(res, "Channel not found", 404);
      return;
    }

    // Related channels in same category
    const related = await prisma.liveTvChannel.findMany({
      where: {
        category: channel.category,
        status: "ACTIVE",
        id: { not: channel.id },
      },
      take: 10,
    });

    sendSuccess(res, { channel, related });
  } catch (error: any) {
    console.error("Failed to fetch channel details:", error);
    sendError(res, "Failed to fetch channel details", 500);
  }
};
