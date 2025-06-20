import express from "express";
import dotenv from "dotenv";
import createGameRouter from "./routes/createGameRoute";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/games", createGameRouter);
app.get("/", (req, res) => {
  res.send("Server is alive!");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

export default app;
