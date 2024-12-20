import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNoteById,
  getUserNotes,
  moveNote,
  updateNote,
} from "../../controllers/notetaking/noteController";

import {
  createFolder,
  getFolderById,
  updateFolder,
  deleteFolder,
  getUserFolders,
} from "../../controllers/notetaking/folderController";

const notetakingRouter = Router();

notetakingRouter.route("/notes").get(getUserNotes).post(createNote);

notetakingRouter
  .route("/notes/:noteId")
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

notetakingRouter.route("/notes/:noteId/move").put(moveNote);

notetakingRouter.route("/folders").get(getUserFolders).post(createFolder);

notetakingRouter
  .route("/folders/:folderId")
  .get(getFolderById)
  .put(updateFolder)
  .delete(deleteFolder);

export { notetakingRouter };
