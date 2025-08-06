import { Router } from "express";
import { healthcheck } from "src/controllers/healthCheckCntrl";

const systemRouter = Router();

systemRouter.get("/healthcheck", healthcheck);

export default systemRouter;
