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
const MONGODB_URI =
  "mongodb+srv://ideos:tgmpeGz1pxPcsTC9@ideos.p5eiugq.mongodb.net/development"!;

const app = express();

const kindeConfig = {
  clientId: "7227012ff53145f6bc3acf3271799450",
  issuerBaseUrl: "https://iideos.kinde.com",
  siteUrl: "https://api.ideos.live",
  secret: "ecw1h97HMMpSpli5bSmVIv6zqTLilZvPEicj5aclIfhsFaHjG",
  redirectUrl: "https://api.ideos.live",
  scope: "openid profile email",
  grantType: GrantType.PKCE,
  unAuthorisedUrl: "https://api.ideos.live/unauthorised",
  postLogoutRedirectUrl: "https://api.ideos.live",
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
app.use(
  "/todoColumns",
  (req, res, next) => {
    console.log("Column 1");
    next();
  },
  protectRoute,
  (req, res, next) => {
    console.log("Column 2");
    next();
  },
  getUser,
  (req, res, next) => {
    console.log("Column 3");
    next();
  },
  todoColumnsRouter
);
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
