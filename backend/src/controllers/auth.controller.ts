import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { RoleType } from "@prisma/client";

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Name, email, and password are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: "Email is already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: RoleType.USER,
        settings: {
          create: {
            autoplay: true,
            preferredQuality: "1080p",
            preferredLanguage: "English",
            subtitleLanguage: "English",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Failed to register user" });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    if (user.status === "SUSPENDED") {
      res.status(403).json({ success: false, message: "Account is suspended. Please contact support." });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Failed to log in" });
  }
};

export const logout = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        settings: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve profile" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { name, avatar, currentPassword, newPassword } = req.body;
    const dataToUpdate: any = {};

    if (name) dataToUpdate.name = name;
    if (avatar !== undefined) dataToUpdate.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ success: false, message: "Current password is required to set a new password" });
        return;
      }

      const currentUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!currentUser) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const match = await bcrypt.compare(currentPassword, currentUser.password);
      if (!match) {
        res.status(400).json({ success: false, message: "Current password does not match" });
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

    res.json({ success: true, message: "Profile updated successfully", user: updated });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export const updateUserSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
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

    res.json({ success: true, message: "Settings saved successfully", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user settings" });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success to avoid email enumeration
      res.json({
        success: true,
        message: "If an account with that email exists, password reset instructions have been sent.",
      });
      return;
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: "reset_password" },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Password reset token generated successfully",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to process forgot password request" });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: "Token and newPassword are required" });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch {
      res.status(400).json({ success: false, message: "Invalid or expired reset token" });
      return;
    }

    if (decoded.purpose !== "reset_password") {
      res.status(400).json({ success: false, message: "Invalid token purpose" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

export const sendVerificationEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const verificationToken = jwt.sign(
      { id: req.user.id, email: req.user.email, purpose: "verify_email" },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Verification email sent",
      verificationToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send verification email" });
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: "Verification token is required" });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch {
      res.status(400).json({ success: false, message: "Invalid or expired verification token" });
      return;
    }

    if (decoded.purpose !== "verify_email") {
      res.status(400).json({ success: false, message: "Invalid token purpose" });
      return;
    }

    await prisma.user.update({
      where: { id: decoded.id },
      data: { status: "ACTIVE" },
    });

    res.json({ success: true, message: "Email has been successfully verified." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to verify email" });
  }
};
