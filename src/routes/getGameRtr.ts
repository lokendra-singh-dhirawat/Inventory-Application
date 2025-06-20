import express from "express";
import { getAllGameCntrl, getGameByIdCntrl } from "../controllers/getGameCntrl";

const router = express.Router();

router.get("/games", getAllGameCntrl);
router.get("/games/:id", getGameByIdCntrl);

export default router;
