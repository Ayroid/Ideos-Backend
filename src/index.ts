// src/index.ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { AuthenticatedRequest } from "../types";
import { Database } from "./controllers/connectDatabase";
const {
  setupKinde,
  protectRoute,
  getUser,
} = require("@kinde-oss/kinde-node-express");

import { todosRouter, usersRouter, todoColumnsRouter } from "./routes";

dotenv.config();

const PORT = process.env.PORT ?? 5000;
const MONGODB_URI = process.env.MONGODB_URI!;

const app = express();

const kindeConfig = {
  clientId: process.env.CLIENT_ID,
  issuerBaseUrl: process.env.ISSUER_BASE_URL,
  siteUrl: process.env.SITE_URL,
  secret: process.env.SECRET,
  redirectUrl: process.env.REDIRECT_URL,
  scope: process.env.SCOPE,
  grantType: process.env.GRANT_TYPE,
  unAuthorisedUrl: process.env.UNAUTHORISED_URL,
  postLogoutRedirectUrl: process.env.POST_LOGOUT_REDIRECT_URL,
};

setupKinde(kindeConfig, app);

const database = new Database(MONGODB_URI);
database.connect();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/images", express.static("public/images"));

app.get("/api/test", (req, res) => {
  res.send("Application is running.");
});

app.get(
  "/api/protected",
  protectRoute,
  getUser,
  async (req: AuthenticatedRequest, res) => {
    const userInfo = req.user;
    res.json({ message: "Protected Routes", user: userInfo });
  }
);

app.use("/api/users", protectRoute, getUser, usersRouter);
app.use("/api/todoColumns", protectRoute, getUser, todoColumnsRouter);
app.use("/api/todos", protectRoute, getUser, todosRouter);

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
