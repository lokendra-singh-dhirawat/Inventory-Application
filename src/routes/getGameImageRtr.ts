import express from "express";
import getGameImageCntrl from "../controllers/getGameImageCntrl";

const router = express.Router();

router.get("/games/image/:id", getGameImageCntrl);

export default router;
