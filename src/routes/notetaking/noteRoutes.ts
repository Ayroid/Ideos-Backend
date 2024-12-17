import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByFolderId,
  getNotesByNotebook,
  moveNote,
  updateNote,
} from "../../controllers/notetaking/noteController";

const noteRouter: Router = Router();

noteRouter.route("/").post(createNote);
noteRouter.route("/folder/:folderId").get(getNotesByFolderId);
noteRouter.route("/move/:noteId").put(moveNote);
noteRouter.route("/:noteId").delete(deleteNote);
noteRouter.route("/:noteId").get(getNoteById);
noteRouter.route("/:noteId").put(updateNote);
noteRouter.route("/notebook/:notebookId").get(getNotesByNotebook);

export { noteRouter };
