import { Response } from "express";
import { pomodoroSettingsModel, usersModel } from "@models";
import { AuthenticatedRequest } from "@types";
import logger from "@logger";

const createPomodoroSessionSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { wallpaper, alarmTone, fontType, pomodoroTemplates } = req.body;

    if (!wallpaper || !alarmTone || !fontType) {
      logger.error("Error Creating Session Settings: All fields are required.");
      res
        .status(400)
        .send("Error Creating Session Settings: All fields are required.");
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

    const sessionSettingsData = new pomodoroSettingsModel({
      userId: user._id,
      wallpaper,
      alarmTone,
      fontType,
      pomodoroTemplates,
    });

    const sessionSettingsCreated = await sessionSettingsData.save();

    if (!sessionSettingsCreated) {
      logger.error("Failed to create Pomodoro session settings.");
      res.status(500).send("Failed to create Pomodoro session settings.");
      return;
    }

    logger.info("Pomodoro session settings created successfully.");
    res.status(201).send("Pomodoro session settings created successfully.");
  } catch (err) {
    logger.error("Error creating Pomodoro session settings:", err);
    res
      .status(500)
      .send(
        "Failed to create Pomodoro session settings. Please try again later."
      );
  }
};

const getPomodoroSessionSettings = async (
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

    const sessionSettings = await pomodoroSettingsModel
      .find({ userId: user._id })
      .populate("pomodoroTemplates");

    if (!sessionSettings || sessionSettings.length === 0) {
      logger.error("Pomodoro session settings not found.");
      res.status(404).send("Pomodoro session settings not found.");
      return;
    }

    logger.info("Sending fetched Pomodoro session settings");
    res.status(200).send(sessionSettings);
  } catch (err) {
    logger.error("Error getting Pomodoro session settings:", err);
    res
      .status(500)
      .send("Failed to get Pomodoro session settings. Please try again later.");
  }
};

const updatePomodoroSessionSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { wallpaper, alarmTone, fontType, pomodoroTemplates } = req.body;

    const sessionSettings = await pomodoroSettingsModel.findById(id);

    if (!sessionSettings) {
      logger.error("Pomodoro session settings not found.");
      res.status(404).send("Pomodoro session settings not found.");
      return;
    }

    sessionSettings.wallpaper = wallpaper || sessionSettings.wallpaper;
    sessionSettings.alarmTone = alarmTone || sessionSettings.alarmTone;
    sessionSettings.fontType = fontType || sessionSettings.fontType;
    sessionSettings.pomodoroTemplates =
      pomodoroTemplates || sessionSettings.pomodoroTemplates;
    const sessionSettingsUpdated = await sessionSettings.save();

    if (!sessionSettingsUpdated) {
      logger.error("Failed to update Pomodoro session settings.");
      res.status(500).send("Failed to update Pomodoro session settings.");
      return;
    }

    logger.info("Pomodoro session settings updated successfully.");
    res.status(200).send("Pomodoro session settings updated successfully.");
  } catch (err) {
    logger.error("Error updating Pomodoro session settings:", err);
    res
      .status(500)
      .send(
        "Failed to update Pomodoro session settings. Please try again later."
      );
  }
};

const deletePomodoroSessionSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const sessionSettingsDeleted =
      await pomodoroSettingsModel.findByIdAndDelete(id);

    if (!sessionSettingsDeleted) {
      logger.error("Failed to delete Pomodoro session settings.");
      res.status(500).send("Failed to delete Pomodoro session settings.");
      return;
    }

    logger.info("Pomodoro session settings deleted successfully.");
    res.status(200).send("Pomodoro session settings deleted successfully.");
  } catch (err) {
    logger.error("Error deleting Pomodoro session settings:", err);
    res
      .status(500)
      .send(
        "Failed to delete Pomodoro session settings. Please try again later."
      );
  }
};

export {
  createPomodoroSessionSettings,
  getPomodoroSessionSettings,
  updatePomodoroSessionSettings,
  deletePomodoroSessionSettings,
};
