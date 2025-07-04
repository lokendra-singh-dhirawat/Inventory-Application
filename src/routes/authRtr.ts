import { Router } from "express";
import { authCntrl } from "../controllers/authCntrl";
import { validationMiddleware } from "../middleware/validateSchema";
import { authenticated } from "../config/passport";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../schema/authSchema";

const router = Router();

router.post(
  "/register",
  validationMiddleware.validateBody(registerSchema),
  authCntrl.register
);

router.post(
  "/login",
  validationMiddleware.validateBody(loginSchema),
  authCntrl.login
);

router.post(
  "/refresh-token",
  validationMiddleware.validateBody(refreshTokenSchema),
  authCntrl.refreshToken
);

router.post("/logout", authenticated, authCntrl.logout);

export default router;
