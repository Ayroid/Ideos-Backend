import { Router } from "express";
import {
  createFolder,
  getFolderById,
  getAllFolders,
  updateFolder,
  deleteFolder,
  addNoteToFolder,
  removeNoteFromFolder,
} from "../../controllers/folderController";

const folderRouter: Router = Router();

folderRouter.route("/").post(createFolder);

folderRouter.route("/").get(getAllFolders);

folderRouter.route("/:folderId").get(getFolderById);

folderRouter.route("/:folderId").put(updateFolder);

folderRouter.route("/:folderId").delete(deleteFolder);

folderRouter.route("/:folderId/notes/:noteId").post(addNoteToFolder);

folderRouter.route("/:folderId/notes/:noteId").delete(removeNoteFromFolder);

export { folderRouter };
