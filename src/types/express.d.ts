import type { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: PrismaUser;
      validateBody?: any;
    }
  }
}
