import { Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        settings: true,
      },
    });

    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    sendError(res, "Failed to fetch user profile", 500);
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { name, avatar, currentPassword, newPassword } = req.body;
    const dataToUpdate: any = {};

    if (name) dataToUpdate.name = name;
    if (avatar !== undefined) dataToUpdate.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        sendError(res, "Current password is required to set a new password", 400);
        return;
      }

      const currentUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!currentUser) {
        sendError(res, "User not found", 404);
        return;
      }

      const match = await bcrypt.compare(currentPassword, currentUser.password);
      if (!match) {
        sendError(res, "Current password does not match", 400);
        return;
      }

      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        settings: true,
      },
    });

    sendSuccess(res, updated, "Profile updated successfully");
  } catch (error) {
    sendError(res, "Failed to update profile", 500);
  }
};

export const getUserSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.id },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user.id,
          autoplay: true,
          preferredQuality: "1080p",
          preferredLanguage: "English",
          subtitleLanguage: "English",
        },
      });
    }

    sendSuccess(res, settings);
  } catch (error) {
    sendError(res, "Failed to retrieve user settings", 500);
  }
};

export const updateUserSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { autoplay, preferredQuality, preferredLanguage, subtitleLanguage } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: {
        ...(autoplay !== undefined && { autoplay }),
        ...(preferredQuality && { preferredQuality }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(subtitleLanguage !== undefined && { subtitleLanguage }),
      },
      create: {
        userId: req.user.id,
        autoplay: autoplay ?? true,
        preferredQuality: preferredQuality || "1080p",
        preferredLanguage: preferredLanguage || "English",
        subtitleLanguage: subtitleLanguage || "English",
      },
    });

    sendSuccess(res, settings, "Settings saved successfully");
  } catch (error) {
    sendError(res, "Failed to update user settings", 500);
  }
};

export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const [watchlistCount, favoritesCount, historyCount, ratingsCount] = await Promise.all([
      prisma.watchlist.count({ where: { userId: req.user.id } }),
      prisma.favorite.count({ where: { userId: req.user.id } }),
      prisma.watchHistory.count({ where: { userId: req.user.id } }),
      prisma.rating.count({ where: { userId: req.user.id } }),
    ]);

    sendSuccess(res, {
      watchlistCount,
      favoritesCount,
      historyCount,
      ratingsCount,
    });
  } catch (error) {
    sendError(res, "Failed to fetch user statistics", 500);
  }
};
