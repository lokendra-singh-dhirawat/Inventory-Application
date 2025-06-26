import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import logger from "../config/logger";
import { AppError } from "../utils/error";
import {
  NotFoundError,
  BadRequestError,
  PrismaClientError,
} from "../utils/error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
class GameCntrl {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  private GameResponce(game: any, req: Request) {
    const baseUrl = `${req.protocol}://${req.get("host")}/game/image/${
      game.id
    }`;
    const cacheBuster = new Date().getTime();

    return {
      ...game,
      imageUrl: game.id ? `${baseUrl}?v=${cacheBuster}` : null,
    };
  }

  public createGameCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        name,
        description,
        price,
        releaseDate,
        rating,
        categoryIds: rawCategoryIds,
      } = req.body;

      const ImageBuffer = req.file?.buffer;
      const ImageMimeType = req.file?.mimetype;

      if (!ImageBuffer || !ImageMimeType) {
        throw new BadRequestError("Image is required", "IMAGE_MISSING_ERROR");
      }

      const categoryIds = Array.isArray(rawCategoryIds)
        ? rawCategoryIds.map((id) => Number(id))
        : [Number(rawCategoryIds)];
      const newgame = await this.prisma.game.create({
        data: {
          name,
          description,
          price,
          releaseDate,
          rating,
          image: ImageBuffer,
          imageMimeType: ImageMimeType,
          categories: {
            connect: categoryIds?.map((id: number) => ({ id })),
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          releaseDate: true,
          rating: true,
          imageMimeType: true,
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const response = this.GameResponce(newgame, req);
      res.json({
        success: true,
        data: response,
      });
      logger.info(`Game created successfully with id: ${newgame.id}`);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
      throw new AppError(
        `An unexpected error occurred during game creation: ${error.message}`, // Include original error message for debugging
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
      const deleteGame = await this.prisma.game.delete({
        where: { id: Number(gameId) },
      });
      res.status(200).json({
        message: "Game deleted successfully",
      });
      logger.info(`Game deleted successfully with id: ${gameId}`);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
      throw new AppError(
        `An unexpected error occurred during game deletion: ${error.message}`, // Include original error message for debugging
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
      throw new AppError(
        `getAllGameCntrl: Error getting all games: ${error.message}`,
        500
      );
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
        select: { image: true, imageMimeType: true },
      });

      if (!game || !game.image || !game.imageMimeType) {
        throw new NotFoundError(
          "Game image not found",
          "GAME_IMAGE_NOT_FOUND_ERROR"
        );
      }

      res.setHeader("Content-Type", game.imageMimeType);
      res.send(game.image);
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
      if (releaseDate !== undefined) updatedData.releaseDate = releaseDate;
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
      const gameId = req.params.id;
      const ImageBuffer = req.file?.buffer;
      const ImageMimeType = req.file?.mimetype;

      const updatedImage = await this.prisma.game.update({
        where: { id: Number(gameId) },
        data: {
          image: ImageBuffer,
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
          imageMimeType: true,
          imageUpdatedAt: true,
          categories: {
            select: { id: true, name: true },
          },
        },
      });
      const gameResponse = this.GameResponce(updatedImage, req);
      res.status(200).json(gameResponse);
      logger.info(
        `updateImageCntrl: Image updated successfully of game id ${gameId}.`
      );
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
      throw new AppError(
        `updateImageCntrl: Error updating image of game id ${req.params.id}: ${error.message}`,
        500
      );
    }
  };
}

export const gameCntrl = new GameCntrl();
