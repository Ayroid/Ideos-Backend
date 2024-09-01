import { Response } from "express";
import { usersModel } from "@models";
import dotenv from "dotenv";
import { AuthenticatedRequest } from "@types";
import logger from "@logger";
dotenv.config();

const createUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("User information is missing.");
      res.status(400).send("User information is missing.");
      return;
    }

    const userData = {
      authId: userInfo.id,
      email: userInfo.email,
      fullname: userInfo.name,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      picture: userInfo.picture,
      emailVerified: userInfo.email_verified,
    };

    const existingUser = await usersModel.findOne({ authId: userInfo.id });
    if (existingUser) {
      logger.info("User already exists");
      res.status(200).json({
        pomodoroSetup: existingUser.pomodoroSettingsId !== null,
      });
      return;
    }
    const newUser = new usersModel(userData);
    const userCreated = await newUser.save();

    if (!userCreated) {
      logger.error("Failed to create user.");
      res.status(500).send("Failed to create user.");
      return;
    }

    logger.info("User Created");
    res.status(201).json({
      pomodoroSetup: false,
    });
  } catch (err) {
    logger.error("Error creating user:", err);
    res.status(500).send("Failed to create user. Please try again later.");
  }
};

export { createUser };
