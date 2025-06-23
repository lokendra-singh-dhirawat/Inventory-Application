import express from "express";
import dotenv from "dotenv";
import gameRtr from "./routes/gameRtr";

dotenv.config();

const app = express();

app.set("json spaces", 5);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", gameRtr);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

export default app;
