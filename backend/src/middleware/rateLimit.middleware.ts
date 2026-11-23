import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const memoryStore: RateLimitStore = {};

export const rateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  const { windowMs, max, message = "Too many requests. Please try again later." } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const now = Date.now();

    if (!memoryStore[ip] || now > memoryStore[ip].resetTime) {
      memoryStore[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    memoryStore[ip].count += 1;

    if (memoryStore[ip].count > max) {
      const retryAfter = Math.ceil((memoryStore[ip].resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: retryAfter,
      });
      return;
    }

    next();
  };
};

// 15 minutes window, 20 attempts for authentication endpoints
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login/registration attempts from this IP. Please wait 15 minutes before trying again.",
});
