import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import type { StrategyOptions } from "passport-jwt";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient();

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: jwt_payload.id,
      },
    });
    process.nextTick(() => {
      if (user) {
        logger.debug(`User authenticated: ${user.email}`);
        return done(null, user);
      } else {
        logger.warn(
          `Passport:User id  ${jwt_payload.id} not found in database`
        );
        return done(null, false);
      }
    });
  } catch (error: any) {
    logger.error(`passport error during JWT authentication: ${error.message}`);
    return done(error, false);
  }
});

export const configurePassport = () => {
  passport.use(jwtStrategy);
  logger.info("Passport JWT Strategy configured");
};

export const authenticated = passport.authenticate("jwt", { session: false });
