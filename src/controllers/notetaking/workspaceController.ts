import dotenv from "dotenv";
import mongoose, { Document, ObjectId } from "mongoose";
import { Response } from "express";
import { usersModel, WorkspaceModel, NoteModel, FolderModel } from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

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

    const workspace = await WorkspaceModel.findOne({ _id: workspaceId });

    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    logger.info("Sending Workspace:", workspace._id);
    res.status(200).json(workspace);
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

    const workspaces = await WorkspaceModel.find().sort({ createdAt: -1 });

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
  const { title, description, theme } = req.body;

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

  try {
    const newWorkspace = new WorkspaceModel({
      userId: user._id,
      title,
      description,
      theme,
      folders: [],
      createdAt: new Date(),
    });

    const workspaceCreated = await newWorkspace.save();

    if (!workspaceCreated) {
      logger.error("Failed to create workspace.");
      res.status(500).send("Failed to create workspace.");
      return;
    }

    logger.info("Workspace created successfully.");
    res.status(201).send(workspaceCreated._id)  ;
  } catch (err) {
    logger.error("Error creating workspace:", err);
    res.status(500).send("Failed to create workspace. Please try again later.");
  }
};

const getUsersWorkspaces = async (
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

    const workspaces = await WorkspaceModel.find({ userId: user._id });

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

const updateWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { title, description, theme } = req.body;

    const workspace = await WorkspaceModel.findOne({ _id: workspaceId });

    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    workspace.title = title || workspace.title;
    workspace.description = description || workspace.description;
    workspace.theme = theme || workspace.theme;

    const updatedWorkspace = await workspace.save();

    if (!updatedWorkspace) {
      logger.error("Failed to update workspace.");
      res.status(500).send("Failed to update workspace.");
      return;
    }

    logger.info("Workspace updated successfully.");
    res.status(200).send(updatedWorkspace);
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

    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    const folders = await FolderModel.find({ _id: { $in: workspace.folders } });
    const folderIds = folders.map((folder) => folder._id);

    await NoteModel.deleteMany({ folderId: { $in: folderIds } });

    await FolderModel.deleteMany({ _id: { $in: folderIds } });

    const deletedWorkspace = await WorkspaceModel.deleteOne({
      _id: workspaceId,
    });

    if (deletedWorkspace.deletedCount === 0) {
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

export {
  getWorkspaceById,
  getWorkspaces,
  createWorkspace,
  getUsersWorkspaces,
  updateWorkspace,
  deleteWorkspace,
};
