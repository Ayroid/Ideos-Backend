import { Response } from "express";
import { pomodoroSessionTypesModel, usersModel } from "@models";
import { AuthenticatedRequest } from "@types";
import logger from "@logger";

const createPomodoroSessionType = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { sessionName, pomodoroDuration, shortBreakDuration, longBreakDuration } = req.body;

    if (!sessionName || !pomodoroDuration || !shortBreakDuration || !longBreakDuration) {
      logger.error("Error Creating Session Type: All fields are required.");
      res.status(400).send("Error Creating Session Type: All fields are required.");
      return;
    }

    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(400).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("Unauthorized Access");
      res.status(409).send("Unauthorized Access");
      return;
    }

    const sessionTypeData = new pomodoroSessionTypesModel({
      userId: user._id,
      sessionName,
      pomodoroDuration,
      shortBreakDuration,
      longBreakDuration,
    });

    const sessionTypeCreated = await sessionTypeData.save();

    if (!sessionTypeCreated) {
      logger.error("Failed to create Pomodoro session type.");
      res.status(500).send("Failed to create Pomodoro session type.");
      return;
    }

    logger.info("Pomodoro session type created successfully.");
    res.status(201).send("Pomodoro session type created successfully.");
  } catch (err) {
    logger.error("Error creating Pomodoro session type:", err);
    res.status(500).send("Failed to create Pomodoro session type. Please try again later.");
  }
};

const getPomodoroSessionTypes = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(400).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("Unauthorized Access");
      res.status(409).send("Unauthorized Access");
      return;
    }

    const sessionTypes = await pomodoroSessionTypesModel.find({ userId: user._id });

    if (!sessionTypes || sessionTypes.length === 0) {
      logger.error("Pomodoro session types not found.");
      res.status(404).send("Pomodoro session types not found.");
      return;
    }

    logger.info("Sending fetched Pomodoro session types");
    res.status(200).send(sessionTypes);
  } catch (err) {
    logger.error("Error getting Pomodoro session types:", err);
    res.status(500).send("Failed to get Pomodoro session types. Please try again later.");
  }
};

const updatePomodoroSessionType = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { sessionName, pomodoroDuration, shortBreakDuration, longBreakDuration } = req.body;

    const sessionType = await pomodoroSessionTypesModel.findById(id);

    if (!sessionType) {
      logger.error("Pomodoro session type not found.");
      res.status(404).send("Pomodoro session type not found.");
      return;
    }

    sessionType.sessionName = sessionName || sessionType.sessionName;
    sessionType.pomodoroDuration = pomodoroDuration || sessionType.pomodoroDuration;
    sessionType.shortBreakDuration = shortBreakDuration || sessionType.shortBreakDuration;
    sessionType.longBreakDuration = longBreakDuration || sessionType.longBreakDuration;

    const sessionTypeUpdated = await sessionType.save();

    if (!sessionTypeUpdated) {
      logger.error("Failed to update Pomodoro session type.");
      res.status(500).send("Failed to update Pomodoro session type.");
      return;
    }

    logger.info("Pomodoro session type updated successfully.");
    res.status(200).send("Pomodoro session type updated successfully.");
  } catch (err) {
    logger.error("Error updating Pomodoro session type:", err);
    res.status(500).send("Failed to update Pomodoro session type. Please try again later.");
  }
};

const deletePomodoroSessionType = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const sessionTypeDeleted = await pomodoroSessionTypesModel.findByIdAndDelete(id);

    if (!sessionTypeDeleted) {
      logger.error("Failed to delete Pomodoro session type.");
      res.status(500).send("Failed to delete Pomodoro session type.");
      return;
    }

    logger.info("Pomodoro session type deleted successfully.");
    res.status(200).send("Pomodoro session type deleted successfully.");
  } catch (err) {
    logger.error("Error deleting Pomodoro session type:", err);
    res.status(500).send("Failed to delete Pomodoro session type. Please try again later.");
  }
};

export {
  createPomodoroSessionType,
  getPomodoroSessionTypes,
  updatePomodoroSessionType,
  deletePomodoroSessionType,
};
