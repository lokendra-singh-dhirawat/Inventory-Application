import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { AppError, PrismaClientError, NotFoundError } from "../utils/error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/binary";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errorCode: string | undefined = undefined;
  let isOperational = false;
  let errorDetails: any = undefined;

  if (err instanceof AppError && isOperational) {
    logger.warn(`Operational error: ${err.message}`, {
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else {
    logger.error(`Non-operational error: ${err.message}`, {
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
  }
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    isOperational = err.isOperational;
  }
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025":
        statusCode = 404;
        message = "Resource not found.";
        errorCode = "NOT_FOUND";
        break;
      case "P2002":
        statusCode = 409;
        message = `Duplicate entry for ${err.meta?.target || "resource"}.`;
        errorCode = "DUPLICATE_ENTRY";
        break;
      case "P2003":
        statusCode = 400;
        message = `Related record not found or invalid: ${
          err.meta?.field_name || ""
        }`;
        errorCode = "INVALID_RELATION";
        break;
      default:
        statusCode = 500;
        message = "Database operation failed.";
        errorCode = "DB_ERROR";
        isOperational = false;
    }
    logger.error(`Prisma Error (${err.code}): ${err.message}`, {
      path: req.path,
      method: req.method,
      meta: err.meta,
      stack: err.stack,
    });
  }
  res.status(statusCode).json({
    success: false,
    message: message,
    errorCode: errorCode,
    details: errorDetails,

    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
