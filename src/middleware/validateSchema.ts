import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, z } from "zod";

interface ValidationErrorDetail {
  path: string;
  message: string;
}

export class ValidationMiddleware {
  private handleZodError(
    error: ZodError,
    res: Response,
    messagePrefix: string = "Validation failed"
  ) {
    console.error(`${messagePrefix} Error:`, error.errors);
    return res.status(400).json({
      message: messagePrefix,
      errors: error.errors.map(
        (err: z.ZodIssue): ValidationErrorDetail => ({
          path: err.path.join("."),
          message: err.message,
        })
      ),
    });
  }

  private handleUnexpectedError(
    error: any,
    res: Response,
    messagePrefix: string = "Internal server error during validation."
  ) {
    console.error(`Unexpected error in ${messagePrefix} middleware:`, error);
    res.status(500).json({ error: messagePrefix });
  }

  public validateBody(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.validateBody = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          this.handleZodError(error, res, "Request body validation failed");
        } else {
          this.handleUnexpectedError(error, res, "Body validation");
        }
      }
    };
  }

  public validateParams(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.params);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          this.handleZodError(
            error,
            res,
            "Request parameters validation failed"
          );
        } else {
          this.handleUnexpectedError(error, res, "Parameter validation");
        }
      }
    };
  }
}

export const validationMiddleware = new ValidationMiddleware();
