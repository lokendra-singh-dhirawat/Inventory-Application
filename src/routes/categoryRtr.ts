import { Router } from "express";
import { categoryCntrl } from "../controllers/categoryCntrl";

const router = Router();

router.get("/", categoryCntrl.getAllCategories);

export default router;
