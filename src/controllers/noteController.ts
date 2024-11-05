import dotenv from "dotenv";
import mongoose, { Document, ObjectId } from "mongoose";
import { Response } from "express";
import { usersModel, WorkspaceModel, NoteModel, FolderModel } from "../models";
import { AuthenticatedRequest } from "../../types";
import logger from "../logger";

dotenv.config();

const createNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, folderId, isMarkup } = req.body;
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
      isMarkup,
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
    const { title, content, folderId, isMarkup } = req.body;

    const existingNote = await NoteModel.findById(noteId);

    if (!existingNote) {
      logger.error("Note not found for update.");
      res.status(404).send("Note not found.");
      return;
    }

    const updatedNote = await NoteModel.findByIdAndUpdate(
      noteId,
      { title, content, folderId, isMarkup },
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

export {
  createNote,
  getNoteById,
  getNotesByFolderId,
  updateNote,
  deleteNote,
  getAllNotes,
};
