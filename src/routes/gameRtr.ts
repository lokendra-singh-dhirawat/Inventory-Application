import { Router } from "express";
import { gameCntrl } from "../controllers/gameCntrl";
import upload from "../middleware/uploadMiddleware";

const router = Router();

//get all games
router.get("/game", gameCntrl.getAllGameCntrl);

//get game by id
router.get("/game/:id", gameCntrl.getGameByIdCntrl);

//get game image
router.get("/game/image/:id", gameCntrl.getGameImageCntrl);

//create game
router.post("/create", upload.single("image"), gameCntrl.createGameCntrl);

//delete game
router.delete("/game/:id", gameCntrl.deleteGameByIdCntrl);

//update game
router.put("/game/:id", gameCntrl.updateGameCntrl);

//update game image
router.put("/game/image/:id", gameCntrl.updateImageCntrl);

export default router;
