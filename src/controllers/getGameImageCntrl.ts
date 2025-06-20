import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getGameImageCntrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const gameId = req.params.id;

  if (!gameId) {
    res.status(400).json({ error: "Game ID is required." });
    return;
  }

  try {
    const game = await prisma.game.findUnique({
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

export default getGameImageCntrl;
