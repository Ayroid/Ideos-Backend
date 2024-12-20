import { Router } from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  getActiveWorkspace,
  setActiveWorkspace,
} from "../../controllers/workspace/workspaceController";

const workspaceRouter: Router = Router();

workspaceRouter.get("/active", getActiveWorkspace);
workspaceRouter.put("/active/:workspaceId", setActiveWorkspace);

workspaceRouter.route("/").get(getWorkspaces).post(createWorkspace);

workspaceRouter
  .route("/:id")
  .get(getWorkspaceById)
  .put(updateWorkspace)
  .delete(deleteWorkspace);

workspaceRouter
  .route("/:id/members")
  .post(addWorkspaceMember)
  .delete(removeWorkspaceMember);

export { workspaceRouter };
