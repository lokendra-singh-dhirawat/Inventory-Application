import type { RequestHandler } from "express";

const ALLOW = new Set([
  "http://localhost:5173",
  "https://inventory-frontend-yjxe.vercel.app",
]);

const corsMiddleware: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  if (origin) {
    let host = "";
    try {
      host = new URL(origin).hostname;
    } catch {}

    if (origin && (ALLOW.has(origin) || host.endsWith(".vercel.app"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");

      res.setHeader(
        "Access-Control-Allow-Headers",
        req.header("Access-Control-Request-Headers") ||
          "Content-Type, Authorization"
      );
      res.setHeader(
        "Access-Control-Allow-Methods",
        req.header("Access-Control-Request-Method") ||
          "GET,HEAD,PUT,PATCH,POST,DELETE"
      );
    }
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
};

export default corsMiddleware;
