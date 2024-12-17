import { Router } from "express";
import {
  createFolder,
  getFolderById,
  updateFolder,
  deleteFolder,
  getFoldersByNotebook,
} from "../../controllers/notetaking/folderController";

const folderRouter: Router = Router();

folderRouter.route("/").post(createFolder);
folderRouter.route("/:folderId").get(getFolderById).put(updateFolder);
folderRouter.route("/:folderId/notes/:noteId");
folderRouter.route("/:notebookId/:folderId").delete(deleteFolder);
folderRouter.route("/:notebookId").get(getFoldersByNotebook);

export { folderRouter };
