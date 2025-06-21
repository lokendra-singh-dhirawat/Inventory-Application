import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

const updateGameCntrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.id;
    if (!gameId) {
      res.status(400).json({ error: "Game ID is required." });
      return;
    }
    const { name, description, price, releaseDate, rating, categoryIds } =
      req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (releaseDate !== undefined) updateData.releaseDate = releaseDate;
    if (rating !== undefined) updateData.rating = rating;

    if (categoryIds !== undefined) {
      const parsedCategoryIds = Array.isArray(categoryIds)
        ? categoryIds.map((id) => Number(id))
        : [Number(categoryIds)];

      updateData.categories = {
        set: parsedCategoryIds.map((id) => ({ id })),
      };
    }

    const Updategame = await prisma.game.update({
      where: { id: Number(gameId) },
      data: updateData,
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
    const UpdateResponse = {
      ...Updategame,
      imageUrl: Updategame.id
        ? `http://localhost:3000/games/${Updategame.id}/image`
        : null,
    };
    res.status(200).json(UpdateResponse);
  } catch (error) {
    console.error("Error updating game:", error);
    res.status(500).json({ error: "Error updating game." });
  }
};

export default updateGameCntrl;
