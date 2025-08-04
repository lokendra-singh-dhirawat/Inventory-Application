import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import logger from "../config/logger";
import { AppError } from "../utils/error";
import type { User as PrismaUserType } from "@prisma/client";
import {
  NotFoundError,
  BadRequestError,
  PrismaClientError,
} from "../utils/error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";
import { zodSchema } from "../schema/gameSchema";
const UPLOAD_DIR_NAME = "uploads";

class GameCntrl {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  private GameResponce(game: any, req: Request) {
    const cacheBuster = game.imageUpdatedAt
      ? new Date(game.imageUpdatedAt).getTime()
      : "";
    const imageUrlBase = `${req.protocol}://${req.get(
      "host"
    )}/${UPLOAD_DIR_NAME}/`;

    return {
      ...game,
      imageUrl: game.imagePath
        ? `${imageUrlBase}${game.imagePath}?v=${cacheBuster}`
        : null,
    };
  }

  public createGameCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const currentUser = req.user as PrismaUserType;

      if (!req.user || !currentUser.id) {
        logger.error(
          "createGameCntrl: req.user missing after auth middleware."
        );
        throw new AppError(
          "Authentication required to create a game.",
          401,
          "AUTH_REQUIRED_FOR_CREATE"
        );
      }
      const userId = currentUser.id;

      const raw = req.body?.categoryIds ?? "";

      const categoryInput: number[] =
        typeof raw === "string"
          ? raw.split(",").map((id) => Number(id.trim()))
          : Array.isArray(raw)
          ? raw.map((id) => Number(id))
          : [];

      logger.debug("DEBUG: Parsed categoryInput array", categoryInput);

      if (
        !categoryInput.length ||
        categoryInput.some((id) => Number.isNaN(id))
      ) {
        throw new BadRequestError(
          "Invalid or missing categoryIds: must be numeric.",
          "INVALID_CATEGORY_IDS"
        );
      }

      const parsed = zodSchema.createSchema.parse({
        ...req.body,
        categoryIds: categoryInput,
      });

      const {
        name,
        description,
        price,
        releaseDate,
        rating,
        categoryIds: rawCategoryIds,
      } = parsed;

      if (!req.file || !req.file.filename || !req.file.mimetype) {
        throw new BadRequestError(
          "Image file is required.",
          "IMAGE_FILE_MISSING"
        );
      }

      const categoryIds = Array.isArray(rawCategoryIds)
        ? rawCategoryIds.map((id) => Number(id))
        : [Number(rawCategoryIds)];

      const imagePath = req.file.filename;
      const imageMimeType = req.file.mimetype;

      const newGameData: any = {
        name,
        description,
        price,
        releaseDate,
        rating,
        imagePath: imagePath,
        imageMimeType: imageMimeType,
        userId: userId,
        categories: {
          connect: categoryIds.map((id: number) => ({ id })),
        },
      };

      const newgame = await this.prisma.game.create({
        data: newGameData,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          releaseDate: true,
          rating: true,
          imagePath: true,
          imageMimeType: true,
          createdAt: true,
          userId: true,
          imageUpdatedAt: true,
          categories: { select: { id: true, name: true } },
        },
      });

      const response = this.GameResponce(newgame, req);
      res.status(201).json({ success: true, data: response });
      logger.info(
        `Game created successfully by user ${userId} with id: ${newgame.id}, image: ${newgame.imagePath}`
      );
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        logger.warn(
          `CREATE_GAME_CNTRL: Deleted uploaded file ${req.file.path} due to DB error or other unexpected error.`
        );
      }
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
      logger.error(
        `CREATE_GAME_CNTRL: An unexpected error occurred during game creation: ${error.message}`,
        { error }
      );
      throw new AppError(
        `An unexpected error occurred during game creation: ${error.message}`,
        500,
        "UNEXPECTED_SERVER_ERROR"
      );
    }
  };

  public deleteGameByIdCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const gameId = req.params.id;
      const gameToDelete = await this.prisma.game.findUnique({
        where: { id: Number(gameId) },
        select: { imagePath: true, id: true }, // Select imagePath
      });

      if (!gameToDelete) {
        logger.warn(`deleteGameByIdCntrl: Game not found with id: ${gameId}.`);
        throw new NotFoundError("Game not found", "GAME_NOT_FOUND");
      }

      await this.prisma.game.delete({
        where: { id: Number(gameId) },
      });

      if (gameToDelete.imagePath) {
        const filePath = path.join(
          process.cwd(),
          UPLOAD_DIR_NAME,
          gameToDelete.imagePath
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`Deleted image file: ${filePath} for game ID ${gameId}.`);
        } else {
          logger.warn(
            `Image file not found on disk: ${filePath} for game ID ${gameId}. No action taken.`
          );
        }
      }
      logger.info(`Game deleted successfully with id: ${gameId}`);
      res.status(200).json({ message: "Game deleted successfully." });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
      logger.error(`Error deleting game: ${error.message}`, { error });
      throw new AppError(
        `An unexpected error occurred during game deletion: ${error.message}`,
        500,
        "UNEXPECTED_SERVER_ERROR"
      );
    }
  };

  public getAllGameCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const games = await this.prisma.game.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          releaseDate: true,
          rating: true,
          imageMimeType: true,
          imagePath: true,
          imageUpdatedAt: true,
          userId: true,
          createdAt: true,
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const response = games.map((game) => this.GameResponce(game, req));

      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Error fetching all games: ${error.message}`, { error });
      throw new AppError(`Error getting all games: ${error.message}`, 500);
    }
  };

  public getGameByIdCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const gameId = req.params.id;
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: Number(gameId) },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          releaseDate: true,
          rating: true,
          imageMimeType: true,
          imagePath: true,
          imageUpdatedAt: true,
          userId: true,
          createdAt: true,
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (!game) {
        throw new NotFoundError("Game not found", "GAME_NOT_FOUND_ERROR");
      }

      const response = this.GameResponce(game, req);
      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `An unexpected error occurred while fetching game: ${error.message}`,
        500,
        "UNEXPECTED_SERVER_ERROR"
      );
    }
  };

  public getGameImageCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const gameId = Number(req.params.id);

    try {
      const game = await this.prisma.game.findUnique({
        where: { id: Number(gameId) },
        select: { imagePath: true, imageMimeType: true },
      });

      if (!game || !game.imagePath || !game.imageMimeType) {
        throw new NotFoundError(
          "Game image not found",
          "GAME_IMAGE_NOT_FOUND_ERROR"
        );
      }

      const filePath = path.join(
        process.cwd(),
        UPLOAD_DIR_NAME,
        game.imagePath
      );

      if (!fs.existsSync(filePath)) {
        logger.warn(
          `GET_GAME_IMAGE_CNTRL: Image file not found on disk: ${filePath} for game ID ${gameId}.`
        );
        throw new NotFoundError(
          "Image file not found on server.",
          "IMAGE_FILE_NOT_FOUND"
        );
      }
      res.setHeader("Content-Type", game.imageMimeType);
      res.sendFile(filePath);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `An unexpected error occurred while fetching game image: ${error.message}`,
        500,
        "UNEXPECTED_SERVER_ERROR"
      );
    }
  };

  public updateGameCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const gameId = req.params.id;

      const { name, description, price, releaseDate, rating, categoryIds } =
        req.body;

      const updatedData: any = {};

      if (name !== undefined) updatedData.name = name;
      if (description !== undefined) updatedData.description = description;
      if (price !== undefined) updatedData.price = price;
      if (releaseDate !== undefined) {
        updatedData.releaseDate = new Date(releaseDate);
      }
      if (rating !== undefined) updatedData.rating = rating;

      if (categoryIds !== undefined) {
        const parsedCategoryIds = Array.isArray(categoryIds)
          ? categoryIds.map((id) => Number(id))
          : [Number(categoryIds)];

        updatedData.categories = {
          set: parsedCategoryIds.map((id) => ({ id })),
        };
      }

      const UpdatedGame = await this.prisma.game.update({
        where: { id: Number(gameId) },
        data: updatedData,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          releaseDate: true,
          rating: true,
          imagePath: true,
          imageUpdatedAt: true,
          userId: true,
          imageMimeType: true,
          createdAt: true,
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      const UpdatedResponse = this.GameResponce(UpdatedGame, req);
      res.status(200).json(UpdatedResponse);
      logger.info(
        `updateGameCntrl: Game updated successfully of game id ${gameId}.`
      );
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientError) {
        throw error;
      }
      throw new AppError(
        `An unexpected error occurred during game update: ${error.message}`,
        500,
        "UNEXPECTED_SERVER_ERROR"
      );
    }
  };

  public updateImageCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const gameId = Number(req.params.id);
      const newImagePath = req.file?.filename;
      const ImageMimeType = req.file?.mimetype;

      if (!req.file) {
        logger.warn(
          "updateImageCntrl: req.file is undefined, throwing BadRequestError."
        );
        throw new BadRequestError(
          "Image file is required for update.",
          "IMAGE_FILE_MISSING_UPDATE"
        );
      }

      const existingGame = await this.prisma.game.findUnique({
        where: { id: gameId },
        select: { imagePath: true, id: true },
      });

      if (!existingGame) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          logger.warn(
            `UPDATE_IMAGE_CNTRL: Deleted newly uploaded file ${req.file.path} as game ${gameId} not found.`
          );
        }
        throw new NotFoundError(
          "Game not found for image update.",
          "GAME_NOT_FOUND_FOR_IMAGE_UPDATE"
        );
      }

      const updatedGame = await this.prisma.game.update({
        where: { id: Number(gameId) },
        data: {
          imagePath: req.file?.filename,
          imageMimeType: ImageMimeType,
          imageUpdatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          releaseDate: true,
          rating: true,
          createdAt: true,
          imagePath: true,
          imageMimeType: true,
          imageUpdatedAt: true,
          categories: {
            select: { id: true, name: true },
          },
        },
      });

      if (existingGame.imagePath && existingGame.imagePath !== newImagePath) {
        const oldFilePath = path.join(
          process.cwd(),
          UPLOAD_DIR_NAME,
          existingGame.imagePath
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          logger.info(
            `Deleted old image file: ${oldFilePath} for game ID ${gameId}.`
          );
        } else {
          logger.warn(
            `Old image file not found on disk: ${oldFilePath} for game ID ${gameId}. No action taken.`
          );
        }
      }

      logger.info(
        `Image updated successfully for game id ${gameId}. New path: ${newImagePath}`
      );
      const gameResponse = this.GameResponce(updatedGame, req);
      res.status(200).json(gameResponse);
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        logger.warn(
          `UPDATE_IMAGE_CNTRL: Deleted newly uploaded file ${req.file.path} due to error.`
        );
      }
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
      logger.error(
        `An unexpected error occurred during image update: ${error.message}`,
        { error }
      );
      throw new AppError(
        `An unexpected error occurred during image update: ${error.message}`,
        500,
        "UNEXPECTED_SERVER_ERROR"
      );
    }
  };
}

export const gameCntrl = new GameCntrl();
