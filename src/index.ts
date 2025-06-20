import express from "express";
import dotenv from "dotenv";
import createGameRouter from "./routes/createGameRtr";
import getGameImageRtr from "./routes/getGameImageRtr";
import getGameRtr from "./routes/getGameRtr";
dotenv.config();

const app = express();

app.set("json spaces", 5);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/games", createGameRouter);
app.use("/", getGameImageRtr);
app.use("/", getGameRtr);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

export default app;
