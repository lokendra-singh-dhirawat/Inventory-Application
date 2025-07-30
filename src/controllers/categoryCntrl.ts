import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import logger from "../config/logger";
import { AppError } from "../utils/error";

const prisma = new PrismaClient();

class CategoryCntrl {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public getAllCategories = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const categories = await this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      logger.info(`Fetched ${categories.length} categories.`);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      logger.error(`Error fetching categories: ${error.message}`, { error });

      throw new AppError(
        "An unexpected error occurred while fetching categories.",
        500,
        "CATEGORY_FETCH_ERROR"
      );
    }
  };
}

export const categoryCntrl = new CategoryCntrl();
