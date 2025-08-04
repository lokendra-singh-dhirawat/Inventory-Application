import { Router } from "express";
import { gameCntrl } from "../controllers/gameCntrl";
import upload from "../middleware/uploadMiddleware";
import { validationMiddleware } from "../middleware/validateSchema";
import { zodSchema } from "../schema/gameSchema";
import { authenticated } from "src/config/passport";
import { AuthorizeUserOrAdmin } from "src/middleware/authorization";

const router = Router();

//get all games
router.get("/games", gameCntrl.getAllGameCntrl);

//get game by id
router.get(
  "/game/:id",
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  gameCntrl.getGameByIdCntrl
);

//get game image
router.get(
  "/game/image/:id",
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  gameCntrl.getGameImageCntrl
);

//create game
router.post(
  "/game",
  authenticated,
  upload.single("image"),
  validationMiddleware.validateBody(zodSchema.createSchema),
  AuthorizeUserOrAdmin("Game"),
  gameCntrl.createGameCntrl
);

//delete game
router.delete(
  "/game/:id",
  authenticated,
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  AuthorizeUserOrAdmin("Game"),
  gameCntrl.deleteGameByIdCntrl
);

//update game
router.put(
  "/game/:id",
  authenticated,
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  AuthorizeUserOrAdmin("Game"),
  validationMiddleware.validateBody(zodSchema.updateGameSchema),
  gameCntrl.updateGameCntrl
);

//update game image
router.put(
  "/game/image/:id",
  authenticated,
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  AuthorizeUserOrAdmin("Game"),
  upload.single("image"),
  gameCntrl.updateImageCntrl
);

export default router;
