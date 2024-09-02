import dotenv from "dotenv";
import mongoose, { Document, ObjectId } from "mongoose";
import { Response } from "express";
import { usersModel, workspaceModel, collaboratorModel } from "@models";
import { AuthenticatedRequest } from "@types";
import logger from "@logger";

dotenv.config();

interface WorkspaceDocument extends Document {
  userId: ObjectId;
  name: string;
  description: string;
  createdAt: Date;
}

const getWorkspaceById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    const workspace = await workspaceModel.findOne({ _id: workspaceId });

    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    logger.info("Sending Workspace:", workspace._id);
    res.status(200).send(workspace);
  } catch (err) {
    logger.error("Error getting workspace:", err);
    res.status(500).send("Failed to get workspace. Please try again later.");
  }
};

const getWorkspaces = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(400).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("Unauthorized Access");
      res.status(409).send("Unauthorized Access");
      return;
    }

    const workspaces = await workspaceModel.find({ userId: user._id });

    if (!workspaces || workspaces.length === 0) {
      logger.error("Workspaces not found.");
      res.status(404).send("Workspaces not found.");
      return;
    }

    logger.info("Sending fetched workspaces");
    res.status(200).send(workspaces);
  } catch (err) {
    logger.error("Error getting workspaces:", err);
    res.status(500).send("Failed to get workspaces. Please try again later.");
  }
};

const createWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      iconId,
      bannerUrl,
      logo,
      inTrash,
      folders,
      data,
    } = req.body;

    if (!title) {
      logger.info("Error Creating Workspace: Title is required.");
      res.status(400).send("Error Creating Workspace: Title is required.");
      return;
    }

    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(400).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("Unauthorized Access");
      res.status(409).send("Unauthorized Access");
      return;
    }

    const workspaceData = new workspaceModel({
      userId: user._id, // Set the userId field correctly
      workspaceOwner: user._id, // Also setting workspaceOwner
      title,
      iconId,
      bannerUrl,
      logo,
      inTrash,
      folders,
      data,
      createdAt: new Date(),
    });

    const workspaceCreated = await workspaceData.save();

    if (!workspaceCreated) {
      logger.error("Failed to create workspace.");
      res.status(500).send("Failed to create workspace.");
      return;
    }

    logger.info("Workspace created successfully.");
    res.status(201).send(workspaceCreated);
  } catch (err) {
    logger.error("Error creating workspace:", err);
    res.status(500).send("Failed to create workspace. Please try again later.");
  }
};

const updateWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { title, iconId, bannerUrl, logo, inTrash, folders, data } = req.body;

    const workspace = await workspaceModel.findOne({ _id: workspaceId });

    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    workspace.title = title || workspace.title;
    workspace.iconId = iconId || workspace.iconId;
    workspace.bannerUrl = bannerUrl !== undefined ? bannerUrl : workspace.bannerUrl;
    workspace.logo = logo !== undefined ? logo : workspace.logo;
    workspace.inTrash = inTrash !== undefined ? inTrash : workspace.inTrash;
    workspace.folders = folders || workspace.folders;
    workspace.data = data !== undefined ? data : workspace.data;

    const workspaceUpdated = await workspace.save();

    if (!workspaceUpdated) {
      logger.error("Failed to update workspace.");
      res.status(500).send("Failed to update workspace.");
      return;
    }

    logger.info("Workspace updated successfully.");
    res.status(200).send("Workspace updated successfully.");
  } catch (err) {
    logger.error("Error updating workspace:", err);
    res.status(500).send("Failed to update workspace. Please try again later.");
  }
};

const deleteWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    const workspace = await workspaceModel.findOne({ _id: workspaceId });

    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    const workspaceDeleted = await workspaceModel.findOneAndDelete({
      _id: workspaceId,
    });

    if (!workspaceDeleted) {
      logger.error("Failed to delete workspace.");
      res.status(500).send("Failed to delete workspace.");
      return;
    }

    logger.info("Workspace deleted successfully.");
    res.status(200).send("Workspace deleted successfully.");
  } catch (err) {
    logger.error("Error deleting workspace:", err);
    res.status(500).send("Failed to delete workspace. Please try again later.");
  }
};

// New functions for MongoDB queries
const getCollaboratingWorkspaces = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).send("User ID is required.");
      return;
    }

    const workspaces = await workspaceModel
      .aggregate([
        { $lookup: {
          from: "collaborators",
          localField: "_id",
          foreignField: "workspaceId",
          as: "collaborators"
        }},
        { $unwind: "$collaborators" },
        { $match: { "collaborators.userId": new mongoose.Types.ObjectId(userId) }},
        { $project: {
          _id: 1,
          createdAt: 1,
          workspaceOwner: 1,
          title: 1,
          iconId: 1,
          data: 1,
          inTrash: 1,
          logo: 1,
          bannerUrl: 1
        }}
      ]);

    if (workspaces.length === 0) {
      res.status(404).send("No collaborating workspaces found.");
      return;
    }

    res.status(200).send(workspaces);
  } catch (err) {
    logger.error("Error getting collaborating workspaces:", err);
    res.status(500).send("Failed to get collaborating workspaces. Please try again later.");
  }
};

const getSharedWorkspaces = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).send("User ID is required.");
      return;
    }

    const workspaces = await workspaceModel
      .aggregate([
        { $lookup: {
          from: "collaborators",
          localField: "_id",
          foreignField: "workspaceId",
          as: "collaborators"
        }},
        { $match: { workspaceOwner: new mongoose.Types.ObjectId(userId) }},
        { $project: {
          _id: 1,
          createdAt: 1,
          workspaceOwner: 1,
          title: 1,
          iconId: 1,
          data: 1,
          inTrash: 1,
          logo: 1,
          bannerUrl: 1
        }}
      ])
      .sort({ createdAt: 1 });

    if (workspaces.length === 0) {
      res.status(404).send("No shared workspaces found.");
      return;
    }

    res.status(200).send(workspaces);
  } catch (err) {
    logger.error("Error getting shared workspaces:", err);
    res.status(500).send("Failed to get shared workspaces. Please try again later.");
  }
};

const getPrivateWorkspaces = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).send("User ID is required.");
      return;
    }

    const workspaces = await workspaceModel
      .find({ workspaceOwner: new mongoose.Types.ObjectId(userId), inTrash: false })
      .sort({ createdAt: 1 });

    if (workspaces.length === 0) {
      res.status(404).send("No private workspaces found.");
      return;
    }

    res.status(200).send(workspaces);
  } catch (err) {
    logger.error("Error getting private workspaces:", err);
    res.status(500).send("Failed to get private workspaces. Please try again later.");
  }
};

export {
  getWorkspaceById,
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getCollaboratingWorkspaces,
  getSharedWorkspaces,
  getPrivateWorkspaces,
};
