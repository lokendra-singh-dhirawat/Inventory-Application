import express from "express";
import createGame from "./controllers/gameController";
const app = express();

app.use(express.json());
app.use("/games", createGame);

const PORT = process.env.PORT;
app.listen(PORT);
