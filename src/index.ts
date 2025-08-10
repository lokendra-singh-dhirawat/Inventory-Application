import express from "express";
import dotenv from "dotenv";
import gameRtr from "./routes/gameRtr";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler";
import passport from "passport";
import authRtr from "./routes/authRtr";
import { configurePassport } from "./config/passport";
import categoryRtr from "./routes/categoryRtr";
import path from "path";
import corsMiddleware from "./middleware/corsMiddleware";

dotenv.config();

const app = express();

app.use(morgan("dev"));

app.set("json spaces", 5);
app.use(passport.initialize());
configurePassport();

app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", gameRtr);
app.use("/auth", authRtr);
app.use("/categories", categoryRtr);
app.use("/healthcheck", require("./routes/systemHealthCheckRtr").default);

const UPLOAD_DIR_NAME = "uploads";
app.use(
  `/${UPLOAD_DIR_NAME}`,
  express.static(path.join(process.cwd(), UPLOAD_DIR_NAME))
);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

export default app;
