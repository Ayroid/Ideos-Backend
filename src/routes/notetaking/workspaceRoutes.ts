import { Router } from "express";

import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  getUsersWorkspaces,
  updateWorkspace,
  deleteWorkspace,
} from "../../controllers/workspaceController";

const workspaceRouter: Router = Router();

// Existing routes
workspaceRouter.route("/").get(getWorkspaces).post(createWorkspace);
workspaceRouter.route("/:workspaceId").get(getWorkspaceById).put(updateWorkspace);
workspaceRouter.route("/get/user").get(getUsersWorkspaces).delete(deleteWorkspace);


export { workspaceRouter };
