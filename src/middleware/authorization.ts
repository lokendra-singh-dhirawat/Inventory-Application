import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { ForbiddenError, UnauthorizedError } from "../utils/error";
import type { user as PrismaUser } from "@prisma/client";
import { Param } from "@prisma/client/runtime/library";
import { isModuleName } from "typescript";

declare global {
  namespace Express {
    interface Request {
      User?: PrismaUser;
    }
  }
}

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.User) {
    logger.error(
      "Authentication:requireAdmin called withouth user (req.user missing)"
    );
    throw new UnauthorizedError(
      "Authentication require for this action",
      "AUTH_REQIRED"
    );
  }
  if (req.User.role === "admin") {
    logger.debug(`User authenticated: ${req.User.email}`);
    next();
  } else {
    logger.warn(
      `Autherization: user ${req.User.email} is not admin(${req.User.role}:Role attempt forbid action (admin required))`
    );
    throw new ForbiddenError(
      "You don't have administrative privileges to perform this action",
      "ADMIN_ACCESS_REQIRED"
    );
  }
};

export const requireResourceOwnership = (
  modelName: 'Game' | 'User',
  idParamName: string = 'id',
  ownerField: string = 'userId',

) => async(req:Request,res:Response,next:NextFunction)=>{

}