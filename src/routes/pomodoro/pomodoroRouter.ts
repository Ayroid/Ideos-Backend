import { Router } from "express";

import {
  getPomodoroSessionById,
  getPomodoroSessions,
  createPomodoroSession,
  updatePomodoroSession,
  deletePomodoroSession,
} from "@controllers/pomodoroController";

import {
  getPomodoroTemplates,
  createPomodoroSessionType,
  updatePomodoroSessionType,
  deletePomodoroSessionType,
} from "@controllers/pomodoroTemplatesController";

const pomodoroRouter: Router = Router();

pomodoroRouter.route("/").get(getPomodoroSessions).post(createPomodoroSession);
pomodoroRouter
  .route("/:id")
  .get(getPomodoroSessionById)
  .put(updatePomodoroSession)
  .delete(deletePomodoroSession);

pomodoroRouter
  .route("/sessions")
  .get(getPomodoroTemplates)
  .post(createPomodoroSessionType);
pomodoroRouter
  .route("/sessions/:id")
  .put(updatePomodoroSessionType)
  .delete(deletePomodoroSessionType);

export { pomodoroRouter };
