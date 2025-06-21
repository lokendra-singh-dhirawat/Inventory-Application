import { Router } from "express";
import updateImageCntrl from "../controllers/updateImageCntrl";

const router = Router();

router.put("/image/:id", updateImageCntrl);

export default router;
