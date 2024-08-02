import { Response } from "express";
import { usersModel } from "../models/usersModel"; // Assuming usersModel exports User interface
import dotenv from "dotenv";
import { AuthenticatedRequest } from "../../types";
dotenv.config();

const createUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
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

    // Check if user already exists
    const existingUser = await usersModel.findOne({ authId: userInfo.id });
    if (existingUser) {
      console.log("User already exists");
      res.status(200).send("User already exists");
      return;
    } else {
      // Create new user
      const newUser = new usersModel(userData);
      const userCreated = await newUser.save();

      if (!userCreated) {
        res.status(500).send("Failed to create user.");
        return;
      }

      console.log("User Created");
      res.status(201).send("User created successfully.");
    }
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).send("Failed to create user. Please try again later.");
  }
};

export { createUser };
