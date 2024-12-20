import { Response } from "express";
import {
  notesModel,
  foldersModel,
  usersModel,
  workspacesModel,
} from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

const createNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, folderId } = req.body;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    if (folderId) {
      const folder = await foldersModel.findOne({
        _id: folderId,
        userId: user._id,
        workspaceId: workspace._id,
      });

      if (!folder) {
        logger.error("Folder not found");
        res.status(404).send("Folder not found");
        return;
      }
    }

    const newNote = new notesModel({
      title,
      content,
      folderId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    await newNote.save();

    logger.info("Note created successfully.");
    res.status(201).json(newNote);
  } catch (err) {
    logger.error("Error creating note:", err);
    res.status(500).send("Failed to create note. Please try again later.");
  }
};

const getUserNotes = async (
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const notes = await notesModel.find({
      userId: user._id,
      workspaceId: workspace._id,
    });

    res.status(200).json(notes);
  } catch (err) {
    logger.error("Error retrieving notes:", err);
    res.status(500).send("Failed to retrieve notes. Please try again later.");
  }
};

const getNoteById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const note = await notesModel.findOne({
      _id: noteId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!note) {
      logger.error("Note not found.");
      res.status(404).send("Note not found.");
      return;
    }

    res.status(200).json(note);
  } catch (err) {
    logger.error("Error retrieving note:", err);
    res.status(500).send("Failed to retrieve note. Please try again later.");
  }
};

const updateNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { title, content, folderId } = req.body;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const updatedNote = await notesModel.findOneAndUpdate(
      {
        _id: noteId,
        userId: user._id,
        workspaceId: workspace._id,
      },
      { title, content, folderId },
      { new: true }
    );

    if (!updatedNote) {
      logger.error("Note not found.");
      res.status(404).send("Note not found.");
      return;
    }

    logger.info("Note updated successfully.");
    res.status(200).json(updatedNote);
  } catch (err) {
    logger.error("Error updating note:", err);
    res.status(500).send("Failed to update note. Please try again later.");
  }
};

const deleteNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const deletedNote = await notesModel.findOneAndDelete({
      _id: noteId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!deletedNote) {
      logger.error("Note not found.");
      res.status(404).send("Note not found.");
      return;
    }

    logger.info("Note deleted successfully.");
    res.status(200).send("Note deleted successfully.");
  } catch (err) {
    logger.error("Error deleting note:", err);
    res.status(500).send("Failed to delete note. Please try again later.");
  }
};

const moveNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { folderId } = req.body;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    if (folderId) {
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
    }

    const updatedNote = await notesModel.findOneAndUpdate(
      {
        _id: noteId,
        userId: user._id,
        workspaceId: workspace._id,
      },
      { folderId },
      { new: true }
    );

    if (!updatedNote) {
      logger.error("Note not found.");
      res.status(404).send("Note not found.");
      return;
    }

    logger.info("Note moved successfully.");
    res.status(200).json(updatedNote);
  } catch (err) {
    logger.error("Error moving note:", err);
    res.status(500).send("Failed to move note. Please try again later.");
  }
};

export {
  createNote,
  getNoteById,
  getUserNotes,
  updateNote,
  deleteNote,
  moveNote,
};