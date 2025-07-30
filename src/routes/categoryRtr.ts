import { Router } from "express";
import { categoryCntrl } from "../controllers/categoryCntrl"; // Import the controller instance

const router = Router();

router.get("/", categoryCntrl.getAllCategories);

export default router;
