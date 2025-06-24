import { Router } from "express";
import { gameCntrl } from "../controllers/gameCntrl";
import upload from "../middleware/uploadMiddleware";
import { validationMiddleware } from "../middleware/validateSchema";
import { zodSchema } from "../schema/gameSchema";

const router = Router();

//get all games
router.get(
  "/games",
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  gameCntrl.getAllGameCntrl
);

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
  upload.single("image"),
  validationMiddleware.validateBody(zodSchema.createSchema),
  gameCntrl.createGameCntrl
);

//delete game
router.delete(
  "/game/:id",
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  gameCntrl.deleteGameByIdCntrl
);

//update game
router.put(
  "/game/:id",
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  validationMiddleware.validateBody(zodSchema.updateGameSchema),
  gameCntrl.updateGameCntrl
);

//update game image
router.put(
  "/game/image/:id",
  validationMiddleware.validateParams(zodSchema.idParamSchema),
  upload.single("image"),
  gameCntrl.updateImageCntrl
);

export default router;
