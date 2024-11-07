import { Router } from "express";

import {
  getPomodoroSessionById,
  getPomodoroSessions,
  createPomodoroSession,
  updatePomodoroSession,
  deletePomodoroSession,
} from "../../controllers/pomodoroController";

import {
  getPomodoroTemplates,
  createPomodoroTemplate,
  updatePomodoroTemplate,
  deletePomodoroTemplate,
} from "../../controllers/pomodoroTemplatesController";

import {
  createPomodoroSettings,
  getPomodoroSettings,
  updatePomodoroSettings,
  deletePomodoroSettings,
  setActivePomodoroTemplate,
  setActivePomodoroTheme,
} from "../../controllers/pomodoroSettingsController";

const pomodoroRouter: Router = Router();

pomodoroRouter
  .route("/templates")
  .get(getPomodoroTemplates)
  .post(createPomodoroTemplate);
pomodoroRouter
  .route("/templates/:id")
  .put(updatePomodoroTemplate)
  .delete(deletePomodoroTemplate);

pomodoroRouter
  .route("/settings")
  .get(getPomodoroSettings)
  .post(createPomodoroSettings);

pomodoroRouter
  .route("/settings/activeTemplate")
  .post(setActivePomodoroTemplate);

pomodoroRouter
  .route("/settings/activeTheme")
  .post(setActivePomodoroTheme);

pomodoroRouter
  .route("/settings/:id")
  .put(updatePomodoroSettings)
  .delete(deletePomodoroSettings);

pomodoroRouter.route("/").get(getPomodoroSessions).post(createPomodoroSession);
pomodoroRouter
  .route("/:id")
  .get(getPomodoroSessionById)
  .put(updatePomodoroSession)
  .delete(deletePomodoroSession);

export { pomodoroRouter };
