import { Router } from "express";

import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getCollaboratingWorkspaces,
  getSharedWorkspaces,
  getPrivateWorkspaces,
} from "@controllers/workspaceController";

const workspaceRouter: Router = Router();

// Existing routes
workspaceRouter.route("/").get(getWorkspaces).post(createWorkspace);
workspaceRouter
  .route("/:workspaceId")
  .get(getWorkspaceById)
  .put(updateWorkspace)
  .delete(deleteWorkspace);

// New routes
workspaceRouter.route("/collaborating/:userId").get(getCollaboratingWorkspaces);
workspaceRouter.route("/shared/:userId").get(getSharedWorkspaces);
workspaceRouter.route("/private/:userId").get(getPrivateWorkspaces);

export { workspaceRouter };
