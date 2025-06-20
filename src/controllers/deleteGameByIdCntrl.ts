import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
const prisma = new PrismaClient();

const deleteGameByIdCntrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const gameId = req.params.id;
    const deleteGame = await prisma.game.delete({
      where: { id: Number(gameId) },
    });
    res.status(200).json({
      message: "Game deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({ error: "Error deleting game." });
  }
};

export default deleteGameByIdCntrl;
