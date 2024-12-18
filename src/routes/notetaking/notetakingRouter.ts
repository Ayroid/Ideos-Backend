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
//  ✅
notetakingRouter.route("/notebooks").get(getUserNotebooks).post(createNotebook);

notetakingRouter
  .route("/notebooks/:notebookId")
  .get(getNotebookById)
  .put(updateNotebook)
  .delete(deleteNotebook);

// Note routes within notebooks
//  ✅
notetakingRouter
  .route("/notebooks/:notebookId/notes")
  .get(getNotesByNotebook)
  .post(createNote);

notetakingRouter
  .route("/notebooks/:notebookId/notes/:noteId")
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

// Special note operation
notetakingRouter
  .route("/notebooks/:notebookId/notes/:noteId/move")
  .put(moveNote);

// Folder routes within notebooks
notetakingRouter
  .route("/notebooks/:notebookId/folders")
  .get(getFoldersByNotebook)
  .post(createFolder);

notetakingRouter
  .route("/notebooks/:notebookId/folders/:folderId")
  .get(getFolderById)
  .put(updateFolder)
  .delete(deleteFolder);

export { notetakingRouter };
