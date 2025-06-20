import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createGame = async (req: Request, res: Response): Promise<void> => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
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
    if (!ImageBuffer) {
      res.status(400).json({ error: "Image is required." });
      return;
    }

    const categoryIds = Array.isArray(rawCategoryIds)
      ? rawCategoryIds.map((id) => Number(id))
      : [Number(rawCategoryIds)];
    const newgame = await prisma.game.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        releaseDate: new Date(releaseDate),
        rating: parseFloat(rating),
        image: ImageBuffer,
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
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Game created successfully",
      data: {
        ...newgame,
        imageUrl: `${req.protocol}://${req.get("host")}/games/${
          newgame.id
        }/image`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
    console.error(error);
  }
};

export default createGame;
