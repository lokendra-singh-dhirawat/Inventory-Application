import { Router } from "express";
import deleteGameByIdCntrl from "../controllers/deleteGameByIdCntrl";

const router = Router();

router.delete("/game/:id", deleteGameByIdCntrl);

export default router;
