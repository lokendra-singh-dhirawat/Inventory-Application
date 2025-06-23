import { Router } from "express";
import { gameCntrl } from "../controllers/gameCntrl";
import upload from "../middleware/uploadMiddleware";

const router = Router();

//get all games
router.get("/games", gameCntrl.getAllGameCntrl);

//get game by id
router.get("/game/:id", gameCntrl.getGameByIdCntrl);

//get game image
router.get("/game/image/:id", gameCntrl.getGameImageCntrl);

//create game
router.post("/game", upload.single("image"), gameCntrl.createGameCntrl);

//delete game
router.delete("/game/:id", gameCntrl.deleteGameByIdCntrl);

//update game
router.put("/game/:id", gameCntrl.updateGameCntrl);

//update game image
router.put(
  "/game/image/:id",
  upload.single("image"),
  gameCntrl.updateImageCntrl
);

export default router;
