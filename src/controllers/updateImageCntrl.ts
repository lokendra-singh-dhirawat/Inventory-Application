import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
const prisma = new PrismaClient();

const updateImageCntrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.id;
    const ImageBuffer = req.file?.buffer;
    const ImageMimeType = req.file?.mimetype;
    if (!gameId) {
      res.status(400).json({ error: "Game ID is required." });
      return;
    }

    const updatedImage = await prisma.game.update({
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
    const gameResponse = {
      ...updatedImage,
      imageUrl: updatedImage.id
        ? `http://localhost:3000/games/${updatedImage.id}/image`
        : null,
    };

    res.status(200).json(gameResponse);
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ error: "Error updating image." });
  }
};

export default updateImageCntrl;
