import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import logger from "../config/logger";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import crypto from "crypto";
import {
  AppError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/error";
import type { User as PrismaUserType } from "@prisma/client";
const prisma = new PrismaClient();

class AuthCntrl {
  private JWT_SECRET: string;
  private BCRYPT_SALT_ROUNDS: number;
  private ACCESS_TOKEN_EXPIRATION_TIME: number = 900;
  private REFRESH_TOKEN_EXPIRATION_TIME: number = 7;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET!;
    this.BCRYPT_SALT_ROUNDS = 10;
  }

  private genrateRefreshToken = (): string => {
    return crypto.randomBytes(64).toString("hex");
  };
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      const hashedPassword = await bcrypt.hash(
        password,
        this.BCRYPT_SALT_ROUNDS
      );

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
      logger.info(`User registred and successfully: ${newUser.email}`);
      res.status(201).json({
        message: "User registered successfully",
        user: newUser,
      });
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictError("Email already registered.");
      }
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Error during registration: ${error.message}`, { error });
      throw new AppError(
        "An unexpected error occurred during registration.",
        500
      );
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new UnauthorizedError(
          "Invalid credentials",
          "INVALID_CREDENTIALS"
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedError(
          "Invalid credentials",
          "INVALID_CREDENTIALS"
        );
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        this.JWT_SECRET,
        {
          expiresIn: this.ACCESS_TOKEN_EXPIRATION_TIME,
        }
      );

      const newRefreshToken = this.genrateRefreshToken();
      const refreshTokenExpiresAt = new Date(
        Date.now() + this.REFRESH_TOKEN_EXPIRATION_TIME * 24 * 60 * 60 * 1000
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: newRefreshToken,
          refreshTokenExpiresAt: refreshTokenExpiresAt,
        },
      });

      logger.info(`User logged in: ${user.email} and issued tokens.`);

      res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.ACCESS_TOKEN_EXPIRATION_TIME,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Error during login: ${error.message}`, { error });
      throw new AppError("An unexpected error occurred during login.", 500);
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        logger.error(
          "Logout: req.user is undefined after authentication middleware. This indicates a severe misconfiguration or bypass."
        );
        throw new UnauthorizedError(
          "Authentication failed: User object missing.",
          "MISSING_USER_OBJECT"
        );
      }
      const currentUser = req.user as PrismaUserType;
      const userId = currentUser.id;

      await prisma.user.update({
        where: { id: userId },
        data: {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      });

      logger.info(`User logged out: ${currentUser.email} and revoked tokens.`);
      res.status(200).json({
        message: "User logged out successfully",
      });
    } catch (error: any) {
      const currentUser = req.user as PrismaUserType;
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }

      throw new AppError(
        `An unexpected error occurred during logout for user ${
          currentUser?.email || "N/A"
        }: ${error.message}`,
        500,
        "UNEXPECTED_SERVER_ERROR"
      );
    }
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new BadRequestError(
          "Refresh token is required",
          "REFRESH_TOKEN_MISSING_ERROR"
        );
      }
      const user = await prisma.user.findFirst({
        where: {
          refreshToken: refreshToken,
          refreshTokenExpiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        logger.warn(
          `Refresh token is attempt with invalid or expired: ${refreshToken} `
        );
        throw new UnauthorizedError(
          "Invalid refresh or expired token.Please log in again",
          "INVALID_REFRESH_TOKEN"
        );
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      });
      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        this.JWT_SECRET,
        {
          expiresIn: this.ACCESS_TOKEN_EXPIRATION_TIME,
        }
      );

      const newRefreshToken = this.genrateRefreshToken();
      const newRefreshTokenExpiresAt = new Date(
        Date.now() + this.REFRESH_TOKEN_EXPIRATION_TIME * 24 * 60 * 60 * 1000
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: newRefreshToken,
          refreshTokenExpiresAt: newRefreshTokenExpiresAt,
        },
      });
      logger.info(`User refreshed token: ${user.email} and issued new tokens.`);
      res.status(200).json({
        message: "Tokens refreshed successfully",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.ACCESS_TOKEN_EXPIRATION_TIME,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Error during token refresh: ${error.message}`, { error });
      throw new AppError(
        "An unexpected error occurred during token refresh.",
        500
      );
    }
  };

  public changePassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const currentUser = req.user as PrismaUserType;
      const { oldPassword, newPassword } = req.body;
      if (!req.user) {
        logger.error(
          "changePassword: req.user is undefined after auth middleware. Fatal error."
        );
        throw new AppError(
          "Authentication failed: User object missing.",
          500,
          "MISSING_USER_OBJECT"
        );
      }

      const userId = currentUser.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.error(
          `changePassword: User ID ${userId} not found in DB after authentication. Data inconsistency.`
        );
        throw new UnauthorizedError("User not found.", "USER_NOT_FOUND");
      }

      const oldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!oldPasswordValid) {
        throw new BadRequestError(
          "Old password is incorrect.",
          "INCORRECT_OLD_PASSWORD"
        );
      }
      const hashedNewPassword = await bcrypt.hash(
        newPassword,
        this.BCRYPT_SALT_ROUNDS
      );

      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword,
        },
      });

      logger.info(`User ${user.email} changed password successfully.`);
      res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error: any) {
      const currentUser = req.user as PrismaUserType;
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
      logger.error(
        `Error changing password for user ${currentUser?.email || "N/A"}: ${
          error.message
        }`,
        { error }
      );
      throw new AppError(
        "An unexpected error occurred during password change.",
        500
      );
    }
  };
}

export const authCntrl = new AuthCntrl();
