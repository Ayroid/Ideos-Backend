import dotenv from "dotenv";
import mongoose, { Document, ObjectId } from "mongoose";
import { Response } from "express";
import {
  usersModel,
  WorkspaceModel,
  NoteModel,
  FolderModel,
} from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

dotenv.config();

const createNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, folderId } = req.body;
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

    const newNote = new NoteModel({
      title,
      content,
      folderId,
    });

    await newNote.save();

    // Add the note ID to the folder's notes array
    await FolderModel.findByIdAndUpdate(
      folderId,
      { $push: { notes: newNote._id } },
      { new: true }
    );

    logger.info("Note created successfully.");
    res.status(201).json(newNote);
  } catch (err) {
    logger.error("Error creating note:", err);
    res.status(500).send("Failed to create note. Please try again later.");
  }
};

const getNoteById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;
    const note = await NoteModel.findById(noteId);

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

const getNotesByFolderId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { folderId } = req.params;
    const notes = await NoteModel.find({ folderId });

    res.status(200).json(notes);
  } catch (err) {
    logger.error("Error retrieving notes by folder:", err);
    res.status(500).send("Failed to retrieve notes. Please try again later.");
  }
};

const updateNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { title, content, folderId} = req.body;

    const existingNote = await NoteModel.findById(noteId);

    if (!existingNote) {
      logger.error("Note not found for update.");
      res.status(404).send("Note not found.");
      return;
    }

    const updatedNote = await NoteModel.findByIdAndUpdate(
      noteId,
      { title, content, folderId },
      { new: true }
    );

    if (!updatedNote) {
      res.status(404).send("Note not found.");
      return;
    }

    // Check if the folder ID has changed
    if (
      existingNote.folderId &&
      existingNote.folderId.toString() !== folderId
    ) {
      // Remove the note ID from the old folder
      await FolderModel.findByIdAndUpdate(existingNote.folderId, {
        $pull: { notes: noteId },
      });

      // Add the note ID to the new folder
      await FolderModel.findByIdAndUpdate(folderId, {
        $push: { notes: noteId },
      });
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

    const deletedNote = await NoteModel.findByIdAndDelete(noteId);

    if (!deletedNote) {
      logger.error("Note not found.");
      res.status(404).send("Note not found.");
      return;
    }

    // Remove the note ID from the folder's notes array
    await FolderModel.findByIdAndUpdate(deletedNote.folderId, {
      $pull: { notes: noteId },
    });

    logger.info("Note deleted successfully.");
    res.status(200).send("Note deleted successfully.");
  } catch (err) {
    logger.error("Error deleting note:", err);
    res.status(500).send("Failed to delete note. Please try again later.");
  }
};

const getAllNotes = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const notes = await NoteModel.find();

    if (!notes.length) {
      logger.info("No notes found.");
      res.status(404).send("No notes found.");
      return;
    }

    res.status(200).json(notes);
  } catch (err) {
    logger.error("Error retrieving all notes:", err);
    res.status(500).send("Failed to retrieve notes. Please try again later.");
  }
};

const getNotesByWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    // Check if the workspace exists
    const workspace = await WorkspaceModel.findById(workspaceId).populate({
      path: "folders",
      populate: { path: "notes" },
    });
    if (!workspace) {
      logger.error("Workspace not found.");
      res.status(404).send("Workspace not found.");
      return;
    }

    // Collect all notes across folders within the workspace
    const notes = workspace.folders.flatMap((folder: any) => folder.notes);

    // Instead of sending a 404 error, send an empty array if there are no notes
    if (!notes.length) {
      logger.info("No notes found for this workspace.");
      res.status(200).json([]); // Return an empty array
      return;
    }

    res.status(200).json(notes);
  } catch (err) {
    logger.error("Error retrieving notes for workspace:", err);
    res.status(500).send("Failed to retrieve notes. Please try again later.");
  }
};

const moveNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params; // Get the noteId from the URL parameters
    const { folderId } = req.body; // Get the new folderId from the request body

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

    // Find the existing note to check its current folderId
    const existingNote = await NoteModel.findById(noteId);
    if (!existingNote) {
      logger.error("Note not found.");
      res.status(404).send("Note not found.");
      return;
    }

    // Check if the folderId has changed, if not no need to update
    if (
      existingNote.folderId &&
      existingNote.folderId.toString() === folderId
    ) {
      logger.info("Note is already in the target folder.");
      res.status(200).json(existingNote); // Return the existing note if folder ID is the same
      return;
    }

    // Step 1: Remove the note ID from the old folder
    if (existingNote.folderId) {
      await FolderModel.findByIdAndUpdate(existingNote.folderId, {
        $pull: { notes: noteId },
      });
    }

    // Step 2: Update the note with the new folderId
    const updatedNote = await NoteModel.findByIdAndUpdate(
      noteId,
      { folderId },
      { new: true }
    );
    if (!updatedNote) {
      logger.error("Error updating the note with new folder.");
      res.status(500).send("Failed to update note.");
      return;
    }

    // Step 3: Add the note ID to the new folder
    await FolderModel.findByIdAndUpdate(folderId, {
      $push: { notes: noteId },
    });

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
  getNotesByFolderId,
  updateNote,
  deleteNote,
  getAllNotes,
  getNotesByWorkspace,
  moveNote,
};
