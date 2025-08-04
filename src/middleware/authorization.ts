import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import {
  AppError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error";
import type { User as PrismaUserType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/binary";

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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user as PrismaUserType;
      const currentUserId = currentUser.id;
      if (!req.user || !currentUser.id) {
        logger.error(
          "Authorization: requireResourceOwnership called without authenticated user (req.user missing)."
        );
        throw new UnauthorizedError(
          "Authentication required for this action.",
          "AUTH_REQUIRED"
        );
      }
      const resourceId = Number(req.params[idParamName]);
      if (isNaN(resourceId) || resourceId <= 0) {
        throw new BadRequestError(
          "Invalid resource ID.",
          "INVALID_RESOURCE_ID"
        );
      }
      let resource: { userId: number } | { id: number } | null | undefined;

      switch (modelName) {
        case "Game":
          resource = (await prisma.game.findUnique({
            where: {
              id: resourceId,
            },
            select: {
              [ownerField]: true,
            },
          })) as { userId: number } | null;
          break;
        case "User":
          if (resourceId !== currentUserId) {
            logger.warn(
              `Authorization:User id ${currentUserId} (Attempt to modify user ${resourceId} )`
            );
            throw new ForbiddenError(
              "You only modify your own profile.",
              "USER_OWNERSHIP_REQUIRED"
            );
          }
          resource = await prisma.user.findUnique({
            where: {
              id: resourceId,
            },
            select: {
              id: true,
            },
          });
          break;
        default:
          throw new AppError(
            `Unsupported model for : ${modelName}`,
            500,
            "UNSUPPORTED_MODEL"
          );
      }
      if (!resource) {
        throw new NotFoundError("Resource not found", "RESOURCE_NOT_FOUND");
      }
      if (modelName === "Game") {
        const actualOwnerId = (resource as { userId: number }).userId;
        if (actualOwnerId !== currentUserId) {
          logger.warn(
            `Authorization: User ${currentUser.email} (ID: ${currentUserId}) attempted to access Game:${resourceId} owned by different user (ID: ${actualOwnerId}).`
          );
          throw new ForbiddenError(
            `You do not have permission to access or modify this ${modelName.toLowerCase()} as you are not the owner.`,
            "GAME_OWNERSHIP_VIOLATION"
          );
        }
      }
      next();
    } catch (error: any) {
      logger.error(
        `Authorization: requireResourceOwnership error: ${error.message}`,
        { error }
      );
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
      throw new AppError(
        `An unexpected authorization error occurred for model ${modelName}.`,
        500,
        "UNEXPECTED_AUTHORIZATION_ERROR"
      );
    }
  };

export const AuthorizeUserOrAdmin = (
  model: "Game" | "User",
  idParam: string = "id",
  userField: string = "userId"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requireAdmin(req, res, next);
    } catch (adminError: any) {
      if (adminError instanceof ForbiddenError) {
        try {
          await requireResourceOwnership(model, idParam, userField)(
            req,
            res,
            next
          );
        } catch (ownershipError: any) {
          throw ownershipError;
        }
      } else {
        throw adminError;
      }
    }
  };
};
