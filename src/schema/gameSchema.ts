import { z } from "zod";

export class zodSchema {
  static createSchema = z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(30, "Name must be less than 30 characters"),
    description: z
      .string()
      .min(3, "Description must be at least 3 characters")
      .max(1000, "Description must be less than 1000 characters"),
    price: z.preprocess(
      (a) => parseFloat(a as string),
      z.number().positive("Price must be a positive number")
    ),
    releaseDate: z.preprocess(
      (a) => new Date(a as string),
      z.date().max(new Date(), "Release date can't be in the future")
    ),
    rating: z.preprocess(
      (a) => parseFloat(a as string),
      z
        .number()
        .min(0, "Rating must be a number between 0 and 5")
        .max(5, "Rating must be a number between 0 and 5")
    ),

    categoryIds: z.union([
      z
        .array(
          z.preprocess(
            (a) => Number(a),
            z.number().int().positive("Category ID must be a positive integer.")
          )
        )
        .min(1, "At least one category is required."),
      z.preprocess(
        (a) => [Number(a)],
        z
          .array(
            z.number().int().positive("Category ID must be a positive integer.")
          )
          .length(1)
      ),
    ]),
  });

  static updateGameSchema = z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long.")
      .max(100, "Name cannot exceed 100 characters.")
      .optional(),
    description: z
      .string()
      .min(3, "Description must be at least 10 characters long.")
      .max(1000, "Description cannot exceed 1000 characters.")
      .optional(),
    price: z
      .preprocess(
        (a) => parseFloat(a as string),
        z.number().positive("Price must be a positive number.")
      )
      .optional(),
    releaseDate: z
      .preprocess(
        (a) => new Date(a as string),
        z.date().max(new Date(), "Release date can't be in the future")
      )
      .optional(),
    rating: z
      .preprocess(
        (a) => parseFloat(a as string),
        z
          .number()
          .min(0, "Rating cannot be less than 0.")
          .max(5, "Rating cannot exceed 5.")
      )
      .optional(),
    categoryIds: z
      .union([
        z
          .array(
            z.preprocess(
              (a) => Number(a),
              z
                .number()
                .int()
                .positive("Category ID must be a positive integer.")
            )
          )
          .min(1, "At least one category is required."),
        z.preprocess(
          (a) => [Number(a)],
          z
            .array(
              z
                .number()
                .int()
                .positive("Category ID must be a positive integer.")
            )
            .length(1)
        ),
      ])
      .optional(),
  });

  static idParamSchema = z.object({
    id: z.preprocess(
      (a) => Number(a),
      z.number().int().positive("ID must be a positive integer.")
    ),
  });
}

export function idParamSchema(
  idParamSchema: any
): import("express-serve-static-core").RequestHandler<
  import("express-serve-static-core").ParamsDictionary,
  any,
  any,
  import("qs").ParsedQs,
  Record<string, any>
> {
  throw new Error("Function not implemented.");
}
