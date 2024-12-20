import { Response } from "express";
import {
  foldersModel,
  notesModel,
  usersModel,
  workspacesModel,
} from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

const createFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const newFolder = new foldersModel({
      name,
      userId: user._id,
      workspaceId: workspace._id,
    });

    const folderCreated = await newFolder.save();

    logger.info("Folder created successfully");
    res.status(201).json(folderCreated);
  } catch (err) {
    logger.error("Error creating folder:", err);
    res.status(500).send("Failed to create folder. Please try again later.");
  }
};

const getFolderById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId } = req.params;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const folder = await foldersModel.findOne({
      _id: folderId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!folder) {
      logger.error("Folder not found.");
      res.status(404).send("Folder not found.");
      return;
    }

    const notes = await notesModel.find({
      folderId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    res.status(200).json({
      ...folder.toObject(),
      notes,
    });
  } catch (err) {
    logger.error("Error retrieving folder:", err);
    res.status(500).send("Failed to retrieve folder. Please try again later.");
  }
};

const getUserFolders = async (
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const folders = await foldersModel.find({
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!folders.length) {
      logger.info("No folders found for this user.");
      res.status(200).json([]);
      return;
    }

    res.status(200).json(folders);
  } catch (err) {
    logger.error("Error retrieving folders:", err);
    res.status(500).send("Failed to retrieve folders. Please try again later.");
  }
};

const updateFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const updatedFolder = await foldersModel.findOneAndUpdate(
      {
        _id: folderId,
        userId: user._id,
        workspaceId: workspace._id,
      },
      { name },
      { new: true }
    );

    if (!updatedFolder) {
      logger.error("Folder not found.");
      res.status(404).send("Folder not found.");
      return;
    }

    logger.info("Folder updated successfully.");
    res.status(200).json(updatedFolder);
  } catch (err) {
    logger.error("Error updating folder:", err);
    res.status(500).send("Failed to update folder. Please try again later.");
  }
};

const deleteFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId } = req.params;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    await notesModel.deleteMany({
      folderId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    const deletedFolder = await foldersModel.findOneAndDelete({
      _id: folderId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!deletedFolder) {
      logger.error("Folder not found.");
      res.status(404).send("Folder not found.");
      return;
    }

    logger.info("Folder and associated notes deleted successfully.");
    res.status(200).send("Folder and associated notes deleted successfully.");
  } catch (err) {
    logger.error("Error deleting folder:", err);
    res.status(500).send("Failed to delete folder. Please try again later.");
  }
};

export {
  createFolder,
  getFolderById,
  getUserFolders,
  updateFolder,
  deleteFolder,
};