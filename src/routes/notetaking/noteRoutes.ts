import { Router } from "express";
import {
  createNote,
  getNoteById,
  getNotesByFolderId,
  updateNote,
  deleteNote,
  getAllNotes,
} from "../../controllers/noteController";

const noteRouter: Router = Router();

noteRouter.route("/").post(createNote);

noteRouter.route("/all").get(getAllNotes);

noteRouter.route("/:noteId")
  .get(getNoteById)     
  .put(updateNote)      
  .delete(deleteNote);  

// Route for getting notes by folder ID
noteRouter.route("/folder/:folderId").get(getNotesByFolderId);

export { noteRouter };
