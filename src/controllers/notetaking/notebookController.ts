import { Response } from "express";
import {
  usersModel,
  workspacesModel,
  notebooksModel,
  notesModel,
  foldersModel,
} from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

const getUserNotebooks = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("User not found");
      res.status(404).send("User not found");
      return;
    }

    const notebook = await notebooksModel.findOne({ userId: user._id });

    if (!notebook) {
      logger.info("No notebooks found for user.");
      res.status(200).json([]);
      return;
    }

    logger.info(`User Notebook Id ${notebook._id}`);
    res.status(200).json(notebook);
  } catch (err) {
    logger.error("Error fetching user notebooks:", err);
    res.status(500).send("Failed to fetch notebooks. Please try again later.");
  }
};

const getNotebookById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { notebookId } = req.params;

    const notebook = await notebooksModel.findById(notebookId);

    if (!notebook) {
      logger.error("Notebook not found.");
      res.status(404).send("Notebook not found.");
      return;
    }

    logger.info("Sending Notebook:", notebook._id);
    res.status(200).json(notebook);
  } catch (err) {
    logger.error("Error getting notebook:", err);
    res.status(500).send("Failed to get notebook. Please try again later.");
  }
};

const createNotebook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { title, description } = req.body;

  if (!title) {
    logger.info("Error Creating Notebook: Title is required.");
    res.status(400).send("Error Creating Notebook: Title is required.");
    return;
  }

  const userInfo = req.user;

  if (!userInfo) {
    logger.error("Unauthorized Access");
    res.status(401).send("Unauthorized Access");
    return;
  }

  const user = await usersModel.findOne({ authId: userInfo.id });

  if (!user) {
    logger.error("User not found");
    res.status(404).send("User not found");
    return;
  }

  // const userWorkspace = await workspacesModel.findOne({ userId: user._id });

  // if (!userWorkspace) {
  //   logger.error("Workspace not found");
  //   res.status(404).send("Workspace not found");
  //   return;
  // }

  try {
    const newNotebook = new notebooksModel({
      userId: user._id,
      // workspaceId: userWorkspace._id,
      title,
      description,
    });

    const notebookCreated = await newNotebook.save();

    if (!notebookCreated) {
      logger.error("Failed to create notebook.");
      res.status(500).send("Failed to create notebook.");
      return;
    }

    logger.info("Notebook created successfully.");
    res.status(201).json(notebookCreated);
  } catch (err) {
    logger.error("Error creating notebook:", err);
    res.status(500).send("Failed to create notebook. Please try again later.");
  }
};

const updateNotebook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { notebookId } = req.params;
    const { title, description } = req.body;

    const notebook = await notebooksModel.findById(notebookId);

    if (!notebook) {
      logger.error("Notebook not found.");
      res.status(404).send("Notebook not found.");
      return;
    }

    notebook.title = title || notebook.title;
    notebook.description = description || notebook.description;

    const updatedNotebook = await notebook.save();

    logger.info("Notebook updated successfully.");
    res.status(200).json(updatedNotebook);
  } catch (err) {
    logger.error("Error updating notebook:", err);
    res.status(500).send("Failed to update notebook. Please try again later.");
  }
};

const deleteNotebook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { notebookId } = req.params;
    await notesModel.deleteMany({ notebookId });
    await foldersModel.deleteMany({ notebookId });
    const deletedNotebook = await notebooksModel.findByIdAndDelete(notebookId);

    if (!deletedNotebook) {
      logger.error("Notebook not found.");
      res.status(404).send("Notebook not found.");
      return;
    }

    logger.info("Notebook and its contents deleted successfully.");
    res.status(200).send("Notebook deleted successfully.");
  } catch (err) {
    logger.error("Error deleting notebook:", err);
    res.status(500).send("Failed to delete notebook. Please try again later.");
  }
};

export {
  getNotebookById,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  getUserNotebooks,
};
