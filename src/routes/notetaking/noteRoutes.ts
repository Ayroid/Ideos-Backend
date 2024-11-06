import { Router } from "express";
import {
  createNote,
  getNoteById,
  getNotesByFolderId,
  updateNote,
  deleteNote,
  getAllNotes,
  getNotesByWorkspace,
  moveNote,
} from "../../controllers/noteController";

const noteRouter: Router = Router();

noteRouter.route("/").post(createNote);

noteRouter.route("/all").get(getAllNotes);

noteRouter.route("/:noteId").get(getNoteById);

noteRouter.route("/:noteId").put(updateNote);

noteRouter.route("/:noteId").delete(deleteNote);

// Route for getting notes by folder ID
noteRouter.route("/folder/:folderId").get(getNotesByFolderId);

noteRouter.route("/workspace/:workspaceId").get(getNotesByWorkspace);

noteRouter.route("/move/:noteId").put(moveNote);

export { noteRouter };
