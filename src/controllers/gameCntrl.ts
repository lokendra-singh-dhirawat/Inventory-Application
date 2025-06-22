import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

class GameCntrl {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  private GameResponce(game: any, req: Request) {
    return {
      ...game,
      imageUrl: game.id
        ? `${req.protocol}://${req.get("host")}/game/image/${game.id}`
        : null,
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
        res.status(400).json({ error: "Image is required." });
        return;
      }

      const categoryIds = Array.isArray(rawCategoryIds)
        ? rawCategoryIds.map((id) => Number(id))
        : [Number(rawCategoryIds)];
      const newgame = await this.prisma.game.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          releaseDate: new Date(releaseDate),
          rating: parseFloat(rating),
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
    } catch (error) {
      res.status(500).json({ error: "Something went wrong." });
      console.error(error);
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
    } catch (error: any) {
      console.error("Error deleting game:", error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Game not found." });
      } else {
        res.status(500).json({ error: "Error deleting game." });
      }
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
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ error: "Error fetching games." });
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
        res.status(404).json({ error: "Invalid game ID" });
        return;
      }

      game.categories = game.categories.map((category) => {
        return {
          id: category.id,
          name: category.name,
        };
      });
      const response = this.GameResponce(game, req);
      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ error: "Error fetching game." });
    }
  };

  public getGameImageCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const gameId = Number(req.params.id);

    if (!gameId) {
      res.status(400).json({ error: "Game ID is required." });
      return;
    }

    try {
      const game = await this.prisma.game.findUnique({
        where: { id: Number(gameId) },
        select: { image: true, imageMimeType: true },
      });

      if (!game || !game.image || !game.imageMimeType) {
        res.status(404).json({ error: "Game not found." });
        return;
      }

      res.setHeader("Content-Type", game.imageMimeType);
      res.send(game.image);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ error: "Error fetching image." });
    }
  };

  public updateGameCntrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const gameId = req.params.id;
      if (!gameId) {
        res.status(400).json({ error: "Game ID is required." });
        return;
      }
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
    } catch (error: any) {
      console.error("Error updating game:", error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Game not found." });
      } else if (error.code === "P2003") {
        res
          .status(400)
          .json({ error: "One or more category IDs provided do not exist." });
      } else {
        res.status(500).json({ error: "Error updating game." });
      }
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
      if (!gameId) {
        res.status(400).json({ error: "Game ID is required." });
        return;
      }

      const updatedImage = await this.prisma.game.update({
        where: { id: Number(gameId) },
        data: {
          image: ImageBuffer,
          imageMimeType: ImageMimeType,
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
          categories: {
            select: { id: true, name: true },
          },
        },
      });
      const gameResponse = this.GameResponce(updatedImage, req);
      res.status(200).json(gameResponse);
    } catch (error) {
      console.error("Error updating image:", error);
      res.status(500).json({ error: "Error updating image." });
    }
  };
}

export const gameCntrl = new GameCntrl();
