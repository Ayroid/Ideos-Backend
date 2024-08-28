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
  GrantType,
} = require("@kinde-oss/kinde-node-express");
import logger from "./logger";

import { todosRouter, usersRouter, todoColumnsRouter } from "./routes";

dotenv.config();

const PORT = process.env.PORT ?? 5000;
const MONGODB_URI = process.env.MONGODB_URI!;

const app = express();

const kindeConfig = {
  clientId: process.env.CLIENT_ID!,
  issuerBaseUrl: process.env.ISSUER_BASE_URL!,
  siteUrl: process.env.SITE_URL!,
  secret: process.env.SECRET!,
  redirectUrl: process.env.REDIRECT_URL!,
  scope: process.env.SCOPE!,
  grantType: GrantType.PKCE!,
  unAuthorisedUrl: process.env.UNAUTHORISED_URL!,
  postLogoutRedirectUrl: process.env.POST_LOGOUT_REDIRECT_URL!,
};

setupKinde(kindeConfig, app);

const database = new Database(MONGODB_URI);
database.connect();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/images", express.static("public/images"));

app.get("/test", (req, res) => {
  logger.info("Test Route");
  res.send("Application is running.");
});

app.get(
  "/protected",
  protectRoute,
  getUser,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userInfo = req.user;
      logger.info("Protected Route Accessed", userInfo);
      res.json({ message: "Protected Routes", user: userInfo });
    } catch (error) {
      logger.error("Error in protected route", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.use("/users", protectRoute, getUser, usersRouter);
app.use("/todoColumns", protectRoute, getUser, todoColumnsRouter);
app.use("/todos", protectRoute, getUser, todosRouter);

process.on("SIGINT", () => {
  database
    .disconnect()
    .then(() => {
      logger.info("Database connection closed.");
      process.exit(0);
    })
    .catch((err) => {
      logger.error("Error closing database connection", err);
      process.exit(1);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
