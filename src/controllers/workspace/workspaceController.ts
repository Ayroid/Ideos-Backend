import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { workspacesModel } from "../../models";
import { usersModel } from "../../models";
import logger from "../../logger";
import mongoose from "mongoose";

const createWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("User not found");
      res.status(404).send("User not found");
      return;
    }

    const { name } = req.body;

    const existingWorkspace = await workspacesModel.findOne({
      name,
      userId: user._id,
    });

    if (existingWorkspace) {
      logger.error("Workspace with this name already exists");
      res.status(409).send("Workspace with this name already exists");
      return;
    }

    const workspace = new workspacesModel({
      name,
      userId: user._id,
      members: [],
    });

    const savedWorkspace = await workspace.save();

    if (!savedWorkspace) {
      logger.error("Failed to create workspace");
      res.status(500).send("Failed to create workspace");
      return;
    }

    logger.info("Workspace created successfully");
    res.status(201).json(savedWorkspace);
  } catch (err) {
    logger.error("Error creating workspace:", err);
    res.status(500).send("Failed to create workspace. Please try again later.");
  }
};

const getWorkspaces = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("User not found");
      res.status(404).send("User not found");
      return;
    }

    const personalWorkspaces = await workspacesModel
      .find({ userId: user._id })
      .populate("members", "name email");

    const sharedWorkspaces = await workspacesModel
      .find({
        userId: { $ne: user._id },
        members: user._id
      })
      .populate("members", "name email");

    logger.info("Workspaces fetched successfully");
    res.status(200).json({
      personal: personalWorkspaces,
      shared: sharedWorkspaces
    });
  } catch (err) {
    logger.error("Error fetching workspaces:", err);
    res.status(500).send("Failed to fetch workspaces. Please try again later.");
  }
};

const getWorkspaceById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const workspace = await workspacesModel
      .findById(id)
      .populate("members", "name email");

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    logger.info("Workspace fetched successfully");
    res.status(200).json(workspace);
  } catch (err) {
    logger.error("Error fetching workspace:", err);
    res.status(500).send("Failed to fetch workspace. Please try again later.");
  }
};


const getActiveWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const user = await usersModel
      .findOne({ authId: userInfo.id })
      .populate('activeWorkspace');

    if (!user) {
      logger.error("User not found");
      res.status(404).send("User not found");
      return;
    }

    if (!user.activeWorkspace) {
      const workspaces = await workspacesModel
        .find({
          $or: [{ userId: user._id }, { members: user._id }]
        })
        .limit(1);

      if (workspaces.length > 0) {
        user.activeWorkspace = workspaces[0]._id as mongoose.Types.ObjectId;
        await user.save();
        logger.info("Default workspace set successfully");
        res.status(200).json(workspaces[0]);
        return;
      }

      logger.info("No active workspace found");
      res.status(404).send("No active workspace found");
      return;
    }

    logger.info("Active workspace fetched successfully");
    res.status(200).json(user.activeWorkspace);
  } catch (err) {
    logger.error("Error fetching active workspace:", err);
    res.status(500).send("Failed to fetch active workspace. Please try again later.");
  }
};

const setActiveWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("User not found");
      res.status(404).send("User not found");
      return;
    }

    const workspace = await workspacesModel.findOne({
      _id: workspaceId,
      $or: [{ userId: user._id }, { members: user._id }]
    });

    if (!workspace) {
      logger.error("Workspace not found or unauthorized");
      res.status(404).send("Workspace not found or unauthorized");
      return;
    }

    user.activeWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save();

    logger.info("Active workspace set successfully");
    res.status(200).json(workspace);
  } catch (err) {
    logger.error("Error setting active workspace:", err);
    res.status(500).send("Failed to set active workspace. Please try again later.");
  }
};

const updateWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("User not found");
      res.status(404).send("User not found");
      return;
    }

    const workspace = await workspacesModel.findOne({
      _id: id,
      userId: user._id,
    });

    if (!workspace) {
      logger.error("Workspace not found or unauthorized");
      res.status(404).send("Workspace not found or unauthorized");
      return;
    }

    workspace.name = name;
    const updatedWorkspace = await workspace.save();

    logger.info("Workspace updated successfully");
    res.status(200).json(updatedWorkspace);
  } catch (err) {
    logger.error("Error updating workspace:", err);
    res.status(500).send("Failed to update workspace. Please try again later.");
  }
};

const deleteWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      logger.error("User not found");
      res.status(404).send("User not found");
      return;
    }

    const workspace = await workspacesModel.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!workspace) {
      logger.error("Workspace not found or unauthorized");
      res.status(404).send("Workspace not found or unauthorized");
      return;
    }

    logger.info("Workspace deleted successfully");
    res.status(200).send("Workspace deleted successfully");
  } catch (err) {
    logger.error("Error deleting workspace:", err);
    res.status(500).send("Failed to delete workspace. Please try again later.");
  }
};

const addWorkspaceMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const workspace = await workspacesModel.findById(id);

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    if (workspace.members.includes(new mongoose.Types.ObjectId(memberId))) {
      logger.error("User is already a member");
      res.status(409).send("User is already a member");
      return;
    }

    workspace.members.push(new mongoose.Types.ObjectId(memberId));
    await workspace.save();

    logger.info("Member added successfully");
    res.status(200).send("Member added successfully");
  } catch (err) {
    logger.error("Error adding member:", err);
    res.status(500).send("Failed to add member. Please try again later.");
  }
};

const removeWorkspaceMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const userInfo = req.user;

    if (!userInfo) {
      logger.error("Unauthorized Access");
      res.status(401).send("Unauthorized Access");
      return;
    }

    const workspace = await workspacesModel.findById(id);

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    workspace.members = workspace.members.filter(
      (member) => member.toString() !== memberId
    );
    await workspace.save();

    logger.info("Member removed successfully");
    res.status(200).send("Member removed successfully");
  } catch (err) {
    logger.error("Error removing member:", err);
    res.status(500).send("Failed to remove member. Please try again later.");
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  getActiveWorkspace,
  setActiveWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
};
