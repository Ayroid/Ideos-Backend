import { Request, Response } from "express";
import mongoose from "mongoose";
import { FolderModel, NoteModel, WorkspaceModel } from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

// Create a new folder and add it to a specific workspace
const createFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, workspaceId } = req.body;
    const newFolder = new FolderModel({ name });

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    await newFolder.save();
    workspace.folders.push(newFolder._id as mongoose.Types.ObjectId);
    await workspace.save();

    logger.info("Folder created and added to workspace successfully.");
    res.status(201).json(newFolder);
  } catch (err) {
    logger.error("Error creating folder:", err);
    res.status(500).send("Failed to create folder. Please try again later.");
  }
};

// Get a folder by ID with its notes
const getFolderById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId } = req.params;
    const folder = await FolderModel.findById(folderId).populate("notes");

    if (!folder) {
      logger.error("Folder not found.");
      res.status(404).send("Folder not found.");
      return;
    }

    res.status(200).json(folder);
  } catch (err) {
    logger.error("Error retrieving folder:", err);
    res.status(500).send("Failed to retrieve folder. Please try again later.");
  }
};

// Get all folders (optional: add workspace filter if needed)
const getAllFolders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const folders = await FolderModel.find().populate("notes");

    if (!folders.length) {
      logger.info("No folders found.");
      res.status(404).send("No folders found.");
      return;
    }

    res.status(200).json(folders);
  } catch (err) {
    logger.error("Error retrieving folders:", err);
    res.status(500).send("Failed to retrieve folders. Please try again later.");
  }
};

// Update folder name by ID
const updateFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    const updatedFolder = await FolderModel.findByIdAndUpdate(
      folderId,
      { name },
      { new: true }
    );

    if (!updatedFolder) {
      logger.error("Folder not found for update.");
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

// Delete a folder and remove it from the associated workspace
const deleteFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId, workspaceId } = req.params;

    const deletedFolder = await FolderModel.findByIdAndDelete(folderId);

    if (!deletedFolder) {
      logger.error("Folder not found.");
      res.status(404).send("Folder not found.");
      return;
    }

    await WorkspaceModel.findByIdAndUpdate(
      workspaceId,
      { $pull: { folders: folderId } },
      { new: true }
    );

    logger.info("Folder deleted and removed from workspace successfully.");
    res.status(200).send("Folder deleted successfully.");
  } catch (err) {
    logger.error("Error deleting folder:", err);
    res.status(500).send("Failed to delete folder. Please try again later.");
  }
};

// Add a note to a folder
const addNoteToFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId, noteId } = req.params;

    const folder = await FolderModel.findById(folderId);
    if (!folder) {
      logger.error("Folder not found.");
      res.status(404).send("Folder not found.");
      return;
    }

    const note = await NoteModel.findById(noteId);
    if (!note) {
      logger.error("Note not found.");
      res.status(404).send("Note not found.");
      return;
    }

    folder.notes.push(note._id as mongoose.Types.ObjectId);
    await folder.save();

    logger.info("Note added to folder successfully.");
    res.status(200).json(folder);
  } catch (err) {
    logger.error("Error adding note to folder:", err);
    res
      .status(500)
      .send("Failed to add note to folder. Please try again later.");
  }
};

// Remove a note from a folder
const removeNoteFromFolder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId, noteId } = req.params;

    const folder = await FolderModel.findById(folderId);
    if (!folder) {
      logger.error("Folder not found.");
      res.status(404).send("Folder not found.");
      return;
    }

    folder.notes = folder.notes.filter((id) => id.toString() !== noteId);
    await folder.save();

    logger.info("Note removed from folder successfully.");
    res.status(200).json(folder);
  } catch (err) {
    logger.error("Error removing note from folder:", err);
    res
      .status(500)
      .send("Failed to remove note from folder. Please try again later.");
  }
};

const getFoldersByWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    // Check if the workspace exists
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    // Fetch folders associated with the specified workspace
    const folders = await FolderModel.find({ _id: { $in: workspace.folders } }).populate("notes");

    if (!folders.length) {
      logger.info("No folders found for this workspace.");
      res.status(404).send("No folders found for this workspace.");
      return;
    }

    res.status(200).json(folders);
  } catch (err) {
    logger.error("Error retrieving folders for workspace:", err);
    res.status(500).send("Failed to retrieve folders. Please try again later.");
  }
};


export {
  createFolder,
  getFolderById,
  getAllFolders,
  updateFolder,
  deleteFolder,
  addNoteToFolder,
  removeNoteFromFolder,
  getFoldersByWorkspace
};
