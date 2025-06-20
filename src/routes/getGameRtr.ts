import express from "express";
import getAllGameCntrl from "../controllers/getAllGameCntrl";
import getGameByIdCntrl from "../controllers/getGameByIdCntrl";

const router = express.Router();

router.get("/game", getAllGameCntrl);
router.get("/game/:id", getGameByIdCntrl);

export default router;
