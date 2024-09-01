import { Response } from "express";
import { pomodoroTemplatesModel, usersModel } from "@models";
import { AuthenticatedRequest } from "@types";
import logger from "@logger";

const createPomodoroTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      sessionName,
      pomodoroDuration,
      shortBreakDuration,
      longBreakDuration,
    } = req.body;

    if (
      !sessionName ||
      !pomodoroDuration ||
      !shortBreakDuration ||
      !longBreakDuration
    ) {
      logger.error(
        "Error Creating Pomodoro Template: All fields are required."
      );
      res
        .status(400)
        .send("Error Creating Pomodoro Template: All fields are required.");
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

    const sessionTypeData = new pomodoroTemplatesModel({
      userId: user._id,
      sessionName,
      pomodoroDuration,
      shortBreakDuration,
      longBreakDuration,
    });

    const sessionTypeCreated = await sessionTypeData.save();

    if (!sessionTypeCreated) {
      logger.error("Failed to create Pomodoro Template.");
      res.status(500).send("Failed to create Pomodoro Template.");
      return;
    }

    logger.info("Pomodoro Template created successfully.");
    res.status(201).send("Pomodoro Template created successfully.");
  } catch (err) {
    logger.error("Error creating Pomodoro Template:", err);
    res
      .status(500)
      .send("Failed to create Pomodoro Template. Please try again later.");
  }
};

const getPomodoroTemplates = async (
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

    const Templates = await pomodoroTemplatesModel.find({
      userId: user._id,
    });

    if (!Templates || Templates.length === 0) {
      logger.error("Pomodoro Template not found.");
      res.status(404).send("Pomodoro Template not found.");
      return;
    }

    logger.info("Sending fetched Pomodoro Template");
    res.status(200).send(Templates);
  } catch (err) {
    logger.error("Error getting Pomodoro Template:", err);
    res
      .status(500)
      .send("Failed to get Pomodoro Template. Please try again later.");
  }
};

const updatePomodoroTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      templateName,
      pomodoroDuration,
      shortBreakDuration,
      longBreakDuration,
    } = req.body;

    const sessionType = await pomodoroTemplatesModel.findById(id);

    if (!sessionType) {
      logger.error("Pomodoro Template not found.");
      res.status(404).send("Pomodoro Template not found.");
      return;
    }

    sessionType.templateName = templateName || sessionType.templateName;
    sessionType.pomodoroDuration =
      pomodoroDuration || sessionType.pomodoroDuration;
    sessionType.shortBreakDuration =
      shortBreakDuration || sessionType.shortBreakDuration;
    sessionType.longBreakDuration =
      longBreakDuration || sessionType.longBreakDuration;

    const sessionTypeUpdated = await sessionType.save();

    if (!sessionTypeUpdated) {
      logger.error("Failed to update Pomodoro Template.");
      res.status(500).send("Failed to update Pomodoro Template.");
      return;
    }

    logger.info("Pomodoro Template updated successfully.");
    res.status(200).send("Pomodoro Template updated successfully.");
  } catch (err) {
    logger.error("Error updating Pomodoro Template:", err);
    res
      .status(500)
      .send("Failed to update Pomodoro Template. Please try again later.");
  }
};

const deletePomodoroTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const sessionTypeDeleted = await pomodoroTemplatesModel.findByIdAndDelete(
      id
    );

    if (!sessionTypeDeleted) {
      logger.error("Failed to delete Pomodoro Template.");
      res.status(500).send("Failed to delete Pomodoro Template.");
      return;
    }

    logger.info("Pomodoro Template deleted successfully.");
    res.status(200).send("Pomodoro Template deleted successfully.");
  } catch (err) {
    logger.error("Error deleting Pomodoro Template:", err);
    res
      .status(500)
      .send("Failed to delete Pomodoro Template. Please try again later.");
  }
};

export {
  createPomodoroTemplate,
  getPomodoroTemplates,
  updatePomodoroTemplate,
  deletePomodoroTemplate,
};
