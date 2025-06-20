import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
const prisma = new PrismaClient();

export const getAllGameCntrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const games = await prisma.game.findMany({
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

    const response = games.map((game) => ({
      ...game,
      imageUrl: `${req.protocol}://${req.get("host")}/games/image/${game.id}`,
    }));

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Error fetching games." });
  }
};

export const getGameByIdCntrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const gameId = req.params.id;
  try {
    const game = await prisma.game.findUnique({
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
    res.json({
      success: true,
      data: {
        ...game,
        imageUrl: `${req.protocol}://${req.get("host")}/games/image/${game.id}`,
      },
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Error fetching game." });
  }
};
