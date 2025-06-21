import { Router } from "express";
import updateGameCntrl from "../controllers/updateGamecntrl";

const router = Router();

router.put("/game/:id", updateGameCntrl);

export default router;
