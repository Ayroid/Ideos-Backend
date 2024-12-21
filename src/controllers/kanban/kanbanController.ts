import dotenv from "dotenv";
import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";
import {
  kanbanBoardModel,
  todoColumnModel,
  todosModel,
  usersModel,
  workspacesModel,
} from "../../models";

dotenv.config();

const getBoards = async (
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const boards = await kanbanBoardModel.find({
      userId: user._id,
      workspaceId: workspace._id,
    });

    logger.info("Kanban boards fetched successfully");
    res.status(200).send(boards);
  } catch (err) {
    logger.error("Error getting boards:", err);
    res.status(500).send("Failed to get boards. Please try again later.");
  }
};

const getBoardWithDetails = async (
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

    // Get the board
    const board = await kanbanBoardModel.findOne({
      _id: id,
      userId: user._id,
    });

    if (!board) {
      logger.error("Board not found or unauthorized");
      res.status(404).send("Board not found or unauthorized");
      return;
    }

    // Get columns for the board with their todos
    const columns = await todoColumnModel
      .find({
        boardId: id,
      })
      .lean();

    // Get all todos for the board
    const todos = await todosModel
      .find({
        boardId: id,
      })
      .lean();

    // Map todos to their respective columns
    const columnsWithTodos = columns.map((column) => ({
      ...column,
      todoIds: todos.filter((todo) => todo.columnId === column.uniqueId),
    }));

    // Prepare the response
    const response = {
      ...board.toObject(),
      columns: columnsWithTodos,
      todos: todos,
    };

    logger.info(`Board ${id} fetched successfully with columns and todos`);
    res.status(200).json(response);
  } catch (err) {
    logger.error("Error fetching board details:", err);
    res.status(500).json({
      error: "Failed to fetch board details. Please try again later.",
    });
  }
};

const createBoard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description } = req.body;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    // Check if user has reached the board limit
    const boardCount = await kanbanBoardModel.countDocuments({
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (boardCount >= 5) {
      logger.error("Board limit reached");
      res.status(400).send("You have reached the maximum limit of 5 boards");
      return;
    }

    // Set as default if this is the first board
    const isDefault = boardCount === 0;

    const board = new kanbanBoardModel({
      userId: user._id,
      workspaceId: workspace._id,
      title,
      description,
      isDefault,
    });

    const created = await board.save();

    if (!created) {
      logger.error("Failed to create board");
      res.status(500).send("Failed to create board");
      return;
    }

    logger.info("Board created successfully");
    res.status(201).send(created);
  } catch (err) {
    logger.error("Error creating board:", err);
    res.status(500).send("Failed to create board. Please try again later.");
  }
};

const updateBoard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    const updated = await kanbanBoardModel.findOneAndUpdate(
      { _id: id, userId: user._id, workspaceId: workspace._id },
      { title, description },
      { new: true }
    );

    if (!updated) {
      logger.error("Board not found");
      res.status(404).send("Board not found");
      return;
    }

    logger.info("Board updated successfully");
    res.status(200).send(updated);
  } catch (err) {
    logger.error("Error updating board:", err);
    res.status(500).send("Failed to update board. Please try again later.");
  }
};

const deleteBoard = async (
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

    const board = await kanbanBoardModel.findOne({
      _id: id,
      userId: user._id,
    });

    if (!board) {
      logger.error("Board not found or unauthorized");
      res.status(404).send("Board not found or unauthorized");
      return;
    }

    const boardCount = await kanbanBoardModel.countDocuments({
      userId: user._id,
    });

    if (boardCount === 1 && board.isDefault) {
      logger.error("Cannot delete the only board");
      res.status(400).send("Cannot delete the only board");
      return;
    }

    if (board.isDefault && boardCount > 1) {
      const anotherBoard = await kanbanBoardModel.findOne({
        userId: user._id,
        _id: { $ne: id },
      });
      if (anotherBoard) {
        anotherBoard.isDefault = true;
        await anotherBoard.save();
      }
    }

    await Promise.all([
      kanbanBoardModel.findByIdAndDelete(id),
      todoColumnModel.deleteMany({ boardId: id }),
      todosModel.deleteMany({ boardId: id }),
    ]);

    logger.info(`Board ${id} deleted successfully`);
    res.status(200).json({ message: "Board deleted successfully" });
  } catch (err) {
    logger.error("Error deleting board:", err);
    res.status(500).json({
      error: "Failed to delete board. Please try again later.",
    });
  }
};

const setDefaultBoard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    // Remove default status from all boards
    await kanbanBoardModel.updateMany(
      { userId: user._id, workspaceId: workspace._id },
      { isDefault: false }
    );

    // Set the new default board
    const updated = await kanbanBoardModel.findOneAndUpdate(
      { _id: id, userId: user._id, workspaceId: workspace._id },
      { isDefault: true },
      { new: true }
    );

    if (!updated) {
      logger.error("Board not found");
      res.status(404).send("Board not found");
      return;
    }

    logger.info("Default board updated successfully");
    res.status(200).send(updated);
  } catch (err) {
    logger.error("Error setting default board:", err);
    res
      .status(500)
      .send("Failed to set default board. Please try again later.");
  }
};

export {
  getBoards,
  getBoardWithDetails,
  createBoard,
  updateBoard,
  deleteBoard,
  setDefaultBoard,
};
