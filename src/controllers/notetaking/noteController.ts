import { Response } from "express";
import { notesModel, foldersModel, notebooksModel } from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

const createNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, folderId, notebookId } = req.body;

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

    const newNote = new notesModel({
      title,
      content,
      folderId,
      notebookId,
    });

    await newNote.save();

    logger.info("Note created successfully.");
    res.status(201).json(newNote);
  } catch (err) {
    logger.error("Error creating note:", err);
    res.status(500).send("Failed to create note. Please try again later.");
  }
};

const getNotesByNotebook = async (
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
    const notes = await notesModel.find({ notebookId });
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
    const note = await notesModel.findById(noteId);

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
    const notes = await notesModel.find({ folderId });

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
    const { title, content, folderId } = req.body;

    const updatedNote = await notesModel.findByIdAndUpdate(
      noteId,
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

    const deletedNote = await notesModel.findByIdAndDelete(noteId);

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

    const note = await notesModel.findById(noteId);
    if (!note) {
      logger.error("Note not found.");
      res.status(404).send("Note not found.");
      return;
    }

    if (folderId) {
      const folder = await foldersModel.findById(folderId);
      if (!folder) {
        logger.error("Folder not found.");
        res.status(404).send("Folder not found.");
        return;
      }

      if (folder.notebookId.toString() !== note.notebookId.toString()) {
        logger.error("Cannot move note to folder in different notebook.");
        res
          .status(400)
          .send("Cannot move note to folder in different notebook.");
        return;
      }
    }

    const updatedNote = await notesModel.findByIdAndUpdate(
      noteId,
      { folderId },
      { new: true }
    );

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
  getNotesByNotebook,
  updateNote,
  deleteNote,
  moveNote,
};
