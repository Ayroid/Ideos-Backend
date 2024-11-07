import { Response } from "express";
import { pomodoroSessionModel, usersModel } from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

const getPomodoroSessionById = async (
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

    const { id } = req.params;

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("Unauthorized Access");
      res.status(409).send("Unauthorized Access");
      return;
    }

    const session = await pomodoroSessionModel
      .findById(id)
      .populate("sessionTypeId");

    if (!session) {
      logger.error("Pomodoro Session not found.");
      res.status(404).send("Pomodoro Session not found.");
      return;
    }
    logger.info("Sending Pomodoro Session:", session._id);
    res.status(200).send(session);
  } catch (err) {
    logger.error("Error getting Pomodoro session:", err);
    res
      .status(500)
      .send("Failed to get Pomodoro session. Please try again later.");
  }
};

const getPomodoroSessions = async (
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

    const sessions = await pomodoroSessionModel
      .find({ userId: user._id })
      .populate("sessionTypeId");

    if (!sessions || sessions.length === 0) {
      logger.error("Pomodoro Sessions not found.");
      res.status(404).send("Pomodoro Sessions not found.");
      return;
    }

    logger.info("Sending fetched Pomodoro sessions");
    res.status(200).send(sessions);
  } catch (err) {
    logger.error("Error getting Pomodoro sessions:", err);
    res
      .status(500)
      .send("Failed to get Pomodoro sessions. Please try again later.");
  }
};

const createPomodoroSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { startTime, sessionTypeId } = req.body;

    if (!startTime || !sessionTypeId) {
      logger.info("Error Creating Pomodoro Session: All fields are required.");
      res
        .status(400)
        .send("Error Creating Pomodoro Session: All fields are required.");
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

    const pomodoroSessionData = new pomodoroSessionModel({
      userId: user._id,
      startTime: new Date(startTime),
      sessionTypeId,
    });

    const pomodoroSessionCreated = await pomodoroSessionData.save();

    if (!pomodoroSessionCreated) {
      logger.error("Failed to create Pomodoro session.");
      res.status(500).send("Failed to create Pomodoro session.");
      return;
    }

    logger.info("Pomodoro session created successfully.");
    res.status(201).send("Pomodoro session created successfully.");
  } catch (err) {
    logger.error("Error creating Pomodoro session:", err);
    res
      .status(500)
      .send("Failed to create Pomodoro session. Please try again later.");
  }
};

const updatePomodoroSession = async (
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

    const { id } = req.params;
    const { totalTime, startTime, endTime, sessionTypeId, sessionCount } =
      req.body;

    const session = await pomodoroSessionModel.findById(id);

    if (!session) {
      logger.error("Pomodoro Session not found.");
      res.status(404).send("Pomodoro Session not found.");
      return;
    }

    session.totalTime = totalTime || session.totalTime;
    session.startTime = startTime
      ? new Date(startTime)
      : new Date(session.startTime);
    session.endTime = endTime ? new Date(endTime) : new Date(session.endTime);
    session.sessionTypeId = sessionTypeId || session.sessionTypeId;
    session.sessionCount = sessionCount || session.sessionCount;

    const sessionUpdated = await session.save();

    if (!sessionUpdated) {
      logger.error("Failed to update Pomodoro session.");
      res.status(500).send("Failed to update Pomodoro session.");
      return;
    }

    logger.info("Pomodoro session updated successfully.");
    res.status(200).send("Pomodoro session updated successfully.");
  } catch (err) {
    logger.error("Error updating Pomodoro session:", err);
    res
      .status(500)
      .send("Failed to update Pomodoro session. Please try again later.");
  }
};

const deletePomodoroSession = async (
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

    const { id } = req.params;

    const sessionDeleted = await pomodoroSessionModel.findByIdAndDelete(id);

    if (!sessionDeleted) {
      logger.error("Failed to delete Pomodoro session.");
      res.status(500).send("Failed to delete Pomodoro session.");
      return;
    }

    logger.info("Pomodoro session deleted successfully.");
    res.status(200).send("Pomodoro session deleted successfully.");
  } catch (err) {
    logger.error("Error deleting Pomodoro session:", err);
    res
      .status(500)
      .send("Failed to delete Pomodoro session. Please try again later.");
  }
};

export {
  getPomodoroSessionById,
  getPomodoroSessions,
  createPomodoroSession,
  updatePomodoroSession,
  deletePomodoroSession,
};
