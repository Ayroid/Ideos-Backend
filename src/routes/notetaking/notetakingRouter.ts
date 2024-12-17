import { Router } from "express";
import {
  getNotebookById,
  getUserNotebooks,
  createNotebook,
  updateNotebook,
  deleteNotebook,
} from "../../controllers/notetaking/notebookController";

import {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByFolderId,
  getNotesByNotebook,
  moveNote,
  updateNote,
} from "../../controllers/notetaking/noteController";

import {
  createFolder,
  getFolderById,
  updateFolder,
  deleteFolder,
  getFoldersByNotebook,
} from "../../controllers/notetaking/folderController";

const notetakingRouter = Router();

// Notebook routes
notetakingRouter.route("/notebooks")
  .get(getUserNotebooks)
  .post(createNotebook);

notetakingRouter.route("/notebooks/:notebookId")
  .get(getNotebookById)
  .put(updateNotebook)
  .delete(deleteNotebook);

// Note routes
notetakingRouter.route("/notes")
  .post(createNote);

notetakingRouter.route("/notes/:noteId")
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

notetakingRouter.route("/notes/move/:noteId")
  .put(moveNote);

notetakingRouter.route("/notes/folder/:folderId")
  .get(getNotesByFolderId);

notetakingRouter.route("/notes/notebook/:notebookId")
  .get(getNotesByNotebook);

// Folder routes
notetakingRouter.route("/folders")
  .post(createFolder);

notetakingRouter.route("/folders/:folderId")
  .get(getFolderById)
  .put(updateFolder);

notetakingRouter.route("/folders/:notebookId/:folderId")
  .delete(deleteFolder);

notetakingRouter.route("/folders/notebook/:notebookId")
  .get(getFoldersByNotebook);

export { notetakingRouter };