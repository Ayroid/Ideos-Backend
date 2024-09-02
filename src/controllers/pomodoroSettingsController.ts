import { Response } from "express";
import {
  pomodoroSettingsModel,
  pomodoroTemplatesModel,
  usersModel,
} from "../models";
import { AuthenticatedRequest } from "../../types";
import logger from "../logger";
import { pomodoroData } from "../data";
import mongoose from "mongoose";

const createPomodoroSettings = async (
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

    if (user.pomodoroSettingsId) {
      logger.info("User already has Pomodoro settings.");
      res.status(200).json({
        pomodoroSetup: true,
      });
      return;
    }

    const pomodoroSettingsData = new pomodoroSettingsModel({
      userId: user._id,
    });

    const pomodoroSettingsCreated = await pomodoroSettingsData.save();

    if (!pomodoroSettingsCreated) {
      logger.error("Failed to create Pomodoro session settings.");
      res.status(500).send("Failed to create Pomodoro session settings.");
      return;
    }

    const createdTemplateIds: mongoose.Types.ObjectId[] = [];
    let createdActiveTemplateId = new mongoose.Types.ObjectId();

    for (const template of pomodoroData) {
      const pomodoroTemplateData = {
        userId: user._id,
        pomodoroSettingsId: pomodoroSettingsCreated._id,
        templateName: template.templateName,
        pomodoroDuration: template.pomodoroDuration,
        shortBreakDuration: template.shortBreakDuration,
        longBreakDuration: template.longBreakDuration,
      };

      const savedTemplate = await new pomodoroTemplatesModel(
        pomodoroTemplateData
      ).save();

      if (!savedTemplate) {
        logger.error("Failed to create Pomodoro Template.");
        res.status(500).send("Failed to create Pomodoro Template.");
        return;
      }

      console.log("Template Saved - ", savedTemplate._id);

      const savedTemplateId = savedTemplate._id as mongoose.Types.ObjectId;
      createdTemplateIds.push(savedTemplateId);

      if (template.templateName === "Default") {
        createdActiveTemplateId = savedTemplateId;
      }
    }

    console.log("Created Template Ids - ", createdTemplateIds);

    const pomodoroSettingsUpdated =
      await pomodoroSettingsModel.findByIdAndUpdate(
        pomodoroSettingsCreated._id,
        {
          activePomodoroTemplateId: createdActiveTemplateId,
          pomodoroTemplateIds: createdTemplateIds,
        },
        { new: true }
      );

    if (!pomodoroSettingsUpdated) {
      logger.error("Failed to update Pomodoro session settings.");
      res.status(500).send("Failed to update Pomodoro session settings.");
      return;
    }

    const userUpdated = await usersModel.findByIdAndUpdate(user._id, {
      pomodoroSettingsId: pomodoroSettingsCreated._id,
    });

    if (!userUpdated) {
      logger.error("Failed to update user with Pomodoro settings.");
      res.status(500).send("Failed to update user with Pomodoro settings.");
      return;
    }

    logger.info("Pomodoro session settings created successfully.");
    res.status(201).json({
      pomodoroSetup: true,
    });
  } catch (err) {
    logger.error("Error creating Pomodoro session settings:", err);
    res
      .status(500)
      .send(
        "Failed to create Pomodoro session settings. Please try again later."
      );
  }
};

const getPomodoroSettings = async (
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

    const pomodoroSettings = await pomodoroSettingsModel
      .findOne({ userId: user._id })
      .populate({
        path: "userPomodoroTemplateIds",
      });

    if (!pomodoroSettings) {
      logger.error("Pomodoro session settings not found.");
      res.status(404).send("Pomodoro session settings not found.");
      return;
    }

    logger.info("Sending fetched Pomodoro session settings");
    res.status(200).send(pomodoroSettings);
  } catch (err) {
    logger.error("Error getting Pomodoro session settings:", err);
    res
      .status(500)
      .send("Failed to get Pomodoro session settings. Please try again later.");
  }
};

const updatePomodoroSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      wallpaper,
      alarmTone,
      fontType,
      activePomodoroTemplateId,
      userPomodoroTemplateIds,
    } = req.body;

    const pomodoroSettings = await pomodoroSettingsModel.findById(id);

    if (!pomodoroSettings) {
      logger.error("Pomodoro session settings not found.");
      res.status(404).send("Pomodoro session settings not found.");
      return;
    }

    pomodoroSettings.wallpaper = wallpaper || pomodoroSettings.wallpaper;
    pomodoroSettings.alarmTone = alarmTone || pomodoroSettings.alarmTone;
    pomodoroSettings.fontType = fontType || pomodoroSettings.fontType;
    pomodoroSettings.activePomodoroTemplateId =
      activePomodoroTemplateId || pomodoroSettings.activePomodoroTemplateId;
    pomodoroSettings.userPomodoroTemplateIds =
      userPomodoroTemplateIds || pomodoroSettings.userPomodoroTemplateIds;
    const pomodoroSettingsUpdated = await pomodoroSettings.save();

    if (!pomodoroSettingsUpdated) {
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

const deletePomodoroSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const pomodoroSettingsDeleted =
      await pomodoroSettingsModel.findByIdAndDelete(id);

    if (!pomodoroSettingsDeleted) {
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

const setActivePomodoroTemplate = async (
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

    console.log(req.body);
    // console.log("Template ID - ", template_id);

    // const pomodoroSettingsUpdated =
    //   await pomodoroSettingsModel.findOneAndUpdate(
    //     { userId: user._id },
    //     { activePomodoroTemplateId: template_id },
    //     { new: true }
    //   );

    // if (!pomodoroSettingsUpdated) {
    //   logger.error("Pomodoro session settings not found.");
    //   res.status(404).send("Pomodoro session settings not found.");
    //   return;
    // }

    logger.info("Active Pomodoro Template set successfully.");
    res.status(200).send("Active Pomodoro Template set successfully.");
  } catch (err) {
    logger.error("Error setting Active Pomodoro Template:", err);
    res
      .status(500)
      .send("Failed to set Active Pomodoro Template. Please try again later.");
  }
};

export {
  createPomodoroSettings,
  getPomodoroSettings,
  updatePomodoroSettings,
  deletePomodoroSettings,
  setActivePomodoroTemplate,
};
