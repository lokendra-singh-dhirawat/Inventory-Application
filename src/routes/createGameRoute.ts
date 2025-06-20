import upload from "../middleware/uploadMiddleware";
import createGame from "../controllers/gameController";
import { Router } from "express";

const router = Router();

router.post("/create", upload.single("image"), createGame);

export default router;
