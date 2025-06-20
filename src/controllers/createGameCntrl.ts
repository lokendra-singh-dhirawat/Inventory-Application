import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createGameCntrl = async (req: Request, res: Response): Promise<void> => {
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
    const ImageMimeType = req.file?.mimetype;
    if (!ImageBuffer || !ImageMimeType) {
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
    res.status(201).json(newgame);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
    console.error(error);
  }
};

export default createGameCntrl;
