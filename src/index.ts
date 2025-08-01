import express from "express";
import dotenv from "dotenv";
import gameRtr from "./routes/gameRtr";
import morgan from "morgan";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";
import passport from "passport";
import authRtr from "./routes/authRtr";
import { configurePassport } from "./config/passport";
import categoryRtr from "./routes/categoryRtr";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.set("json spaces", 5);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
configurePassport();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use("/auth", authRtr);
app.use("/", gameRtr);
app.use("/categories", categoryRtr);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

export default app;
