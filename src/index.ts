import express from "express";
import dotenv from "dotenv";
import gameRtr from "./routes/gameRtr";
import morgan from "morgan";
import { error } from "winston";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.set("json spaces", 5);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", gameRtr);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

export default app;
