import upload from "../middleware/uploadMiddleware";
import createGameCntrl from "../controllers/createGameCntrl";
import { Router } from "express";

const router = Router();

router.post("/create", upload.single("image"), createGameCntrl);

export default router;
