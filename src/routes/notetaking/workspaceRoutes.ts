import { Router } from "express";

import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  // updateWorkspace,
  // deleteWorkspace,
} from "../../controllers/workspaceController";

const workspaceRouter: Router = Router();

// Existing routes
workspaceRouter.route("/").get(getWorkspaces).post(createWorkspace);
workspaceRouter
  .route("/:workspaceId")
  .get(getWorkspaceById)
  // .put(updateWorkspace)
  // .delete(deleteWorkspace);

// New routes

export { workspaceRouter };
