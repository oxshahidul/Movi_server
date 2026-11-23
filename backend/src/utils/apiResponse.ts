import { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): void => {
  res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });
};

export const sendError = (
  res: Response,
  message = "Internal Server Error",
  statusCode = 500,
  errors?: any
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
