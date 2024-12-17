// folder.controller.ts
import { Response } from "express";
import { foldersModel, notesModel, notebooksModel } from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

const createFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, notebookId } = req.body;

    if (!notebookId) {
      logger.error("Notebook ID is required");
      res.status(400).send("Notebook ID is required");
      return;
    }

    const notebook = await notebooksModel.findById(notebookId);
    if (!notebook) {
      logger.error("Notebook not found");
      res.status(404).send("Notebook not found");
      return;
    }

    const newFolder = new foldersModel({
      name,
      notebookId,
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
    const folder = await foldersModel.findById(folderId);

    if (!folder) {
      logger.error("Folder not found.");
      res.status(404).send("Folder not found.");
      return;
    }

    const notes = await notesModel.find({ folderId });

    res.status(200).json({
      ...folder.toObject(),
      notes,
    });
  } catch (err) {
    logger.error("Error retrieving folder:", err);
    res.status(500).send("Failed to retrieve folder. Please try again later.");
  }
};

const getFoldersByNotebook = async (
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

    const folders = await foldersModel.find({ notebookId });

    if (!folders.length) {
      logger.info("No folders found in this notebook.");
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

    const updatedFolder = await foldersModel.findByIdAndUpdate(
      folderId,
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
    await notesModel.deleteMany({ folderId });
    const deletedFolder = await foldersModel.findByIdAndDelete(folderId);

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
  getFoldersByNotebook,
  updateFolder,
  deleteFolder,
};
