import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createGame = async (req: Request, res: Response) => {
  try {
    const { name, description, price, releaseDate, rating, categoryIds } =
      req.body;

    const ImageBuffer = req.file?.buffer;

    const newgame = await prisma.game.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        releaseDate: new Date(releaseDate),
        rating: parseFloat(rating),
        image: ImageBuffer,
        categoryIds: {
          connect: categoryIds?.map((id: number) => ({ id })),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

export default createGame;
