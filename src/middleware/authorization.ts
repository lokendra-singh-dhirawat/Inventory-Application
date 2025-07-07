import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { ForbiddenError, UnauthorizedError } from "../utils/error";
import type { User as PrismaUserType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    logger.error(
      "Authentication:requireAdmin called withouth user (req.user missing)"
    );
    throw new UnauthorizedError(
      "Authentication require for this action",
      "AUTH_REQIRED"
    );
  }
  const currentUser = req.user as PrismaUserType;
  if (currentUser.role === "admin") {
    logger.debug(`User authenticated: ${currentUser.email}`);
    next();
  } else {
    logger.warn(
      `Autherization: user ${currentUser.email} is not admin(${currentUser.role}:Role attempt forbid action (admin required))`
    );
    throw new ForbiddenError(
      "You don't have administrative privileges to perform this action",
      "ADMIN_ACCESS_REQIRED"
    );
  }
};

export const requireResourceOwnership =
  (
    modelName: "Game" | "User",
    idParamName: string = "id",
    ownerField: string = "userId"
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {};
