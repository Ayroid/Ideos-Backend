import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Database } from "./controllers/connectDatabase.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

import todoRouter from "./routers/todosRouter.js";

const app = express();

const database = new Database(MONGODB_URI);
database.connect();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/images", express.static("public/images"));

app.get("/api/test", (req, res) => {
  res.send("Application is running.");
});

app.use("/api/todos", todoRouter);

process.on("SIGINT", () => {
  database
    .disconnect()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
