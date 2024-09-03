import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import logger from "../logger";
import {
  pomodoroSettingsModel,
  pomodoroTemplatesModel,
  usersModel,
} from "../models";
import mongoose from "mongoose";

const createPomodoroTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      templateName,
      pomodoroDuration,
      shortBreakDuration,
      longBreakDuration,
      sessionsBeforeLongBreak,
    } = req.body;

    if (
      !templateName ||
      !pomodoroDuration ||
      !shortBreakDuration ||
      !longBreakDuration ||
      !sessionsBeforeLongBreak
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

    const pomodoroSettings = await pomodoroSettingsModel.findById(
      user.pomodoroSettingsId
    );

    if (!pomodoroSettings) {
      logger.error("Pomodoro Template does not exist.");
      res.status(404).send("Pomodoro Template does not exist.");
      return;
    }

    const pomodoroTemplateData = new pomodoroTemplatesModel({
      userId: user._id,
      pomodoroSettingsId: pomodoroSettings._id,
      templateName,
      pomodoroDuration,
      shortBreakDuration,
      longBreakDuration,
      sessionsBeforeLongBreak,
    });

    const pomodoroTemplateCreated = await pomodoroTemplateData.save();

    if (!pomodoroTemplateCreated) {
      logger.error("Failed to create Pomodoro Template.");
      res.status(500).send("Failed to create Pomodoro Template.");
      return;
    }

    pomodoroSettings.userPomodoroTemplateIds.push(
      pomodoroTemplateCreated._id as mongoose.Types.ObjectId
    );

    const pomodoroSettingsUpdated = await pomodoroSettings.save();

    if (!pomodoroSettingsUpdated) {
      await pomodoroTemplatesModel.findByIdAndDelete(
        pomodoroTemplateCreated._id
      );
      logger.error("Failed to update Pomodoro Settings.");
      res.status(500).send("Failed to update Pomodoro Settings.");
      return;
    }

    logger.info("Pomodoro Template created successfully.");
    res.status(201).json({
      _id: pomodoroTemplateCreated._id,
    });
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
      sessionsBeforeLongBreak,
    } = req.body;

    console.log(id);

    const pomodoroTemplate = await pomodoroTemplatesModel.findById(id);

    if (!pomodoroTemplate) {
      logger.error("Pomodoro Template not found.");
      res.status(404).send("Pomodoro Template not found.");
      return;
    }

    pomodoroTemplate.templateName =
      templateName || pomodoroTemplate.templateName;
    pomodoroTemplate.pomodoroDuration =
      pomodoroDuration || pomodoroTemplate.pomodoroDuration;
    pomodoroTemplate.shortBreakDuration =
      shortBreakDuration || pomodoroTemplate.shortBreakDuration;
    pomodoroTemplate.longBreakDuration =
      longBreakDuration || pomodoroTemplate.longBreakDuration;
    pomodoroTemplate.sessionsBeforeLongBreak =
      sessionsBeforeLongBreak || pomodoroTemplate.sessionsBeforeLongBreak;

    const pomodoroTemplateUpdated = await pomodoroTemplate.save();

    if (!pomodoroTemplateUpdated) {
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

    const pomodoroTemplateDeleted =
      await pomodoroTemplatesModel.findByIdAndDelete(id);

    if (!pomodoroTemplateDeleted) {
      logger.error(`Pomodoro Template with ID ${id} not found.`);
      res.status(404).send("Pomodoro Template not found.");
      return;
    }

    // IF POMODORO TEMPLATE IS DELETED, REMOVE IT FROM POMODORO SETTINGS

    const pomodoroSettingsId = pomodoroTemplateDeleted.pomodoroSettingsId;

    const pomodoroSettings = await pomodoroSettingsModel.findById(
      pomodoroSettingsId
    );

    if (!pomodoroSettings) {
      logger.error("Pomodoro Settings not found.");
      res.status(404).send("Pomodoro Settings not found.");
      return;
    }

    const index = pomodoroSettings.userPomodoroTemplateIds.indexOf(
      pomodoroTemplateDeleted._id as mongoose.Types.ObjectId
    );

    if (index > -1) {
      pomodoroSettings.userPomodoroTemplateIds.splice(index, 1);
    }

    const pomodoroSettingsUpdated = await pomodoroSettings.save();

    if (!pomodoroSettingsUpdated) {
      logger.error("Failed to update Pomodoro Settings.");
      res.status(500).send("Failed to update Pomodoro Settings.");
      return;
    }

    logger.info(`Pomodoro Template with ID ${id} deleted successfully.`);
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
  deletePomodoroTemplate,
  getPomodoroTemplates,
  updatePomodoroTemplate,
};
