import { Router } from "express";
import {
  getNotebookById,
  createNotebook,
  updateNotebook,
  deleteNotebook,
} from "../../controllers/notetaking/notebookController";

const notebookRouter: Router = Router();

notebookRouter.post("/", createNotebook);
notebookRouter
  .route("/:notebookId")
  .get(getNotebookById)
  .put(updateNotebook)
  .delete(deleteNotebook);

export { notebookRouter };
