import dotenv from "dotenv";
import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";
import {
  todoColumnModel,
  usersModel,
  todosModel,
  workspacesModel,
  kanbanBoardModel,
} from "../../models";

dotenv.config();

const getTodoColumns = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId } = req.params;
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

    // Verify board exists and belongs to user
    const board = await kanbanBoardModel.findOne({
      _id: boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!board) {
      logger.error("Board not found");
      res.status(404).send("Board not found");
      return;
    }

    const result = await todoColumnModel
      .find({
        userId: user._id,
        workspaceId: workspace._id,
        boardId,
      })
      .sort({ order: 1 })
      .populate("todoIds");

    if (!result) {
      logger.error("TodoColumns not found");
      res.status(404).send([]);
      return;
    }

    logger.info("TodoColumns read successfully.");
    res.status(200).send(result);
  } catch (err) {
    logger.error("Error getting TodoColumns:", err);
    res.status(500).send("Failed to get TodoColumns. Please try again later.");
  }
};

const createTodoColumns = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { title, uniqueId, color } = req.body;

    if (!title || !uniqueId || !color) {
      logger.error("Error Creating Column: All fields are required.");
      res.status(400).send("Error Creating Column: All fields are required.");
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

    const workspace = await workspacesModel.findOne({ userId: user._id });

    if (!workspace) {
      logger.error("Workspace not found");
      res.status(404).send("Workspace not found");
      return;
    }

    // Verify board exists and belongs to user
    const board = await kanbanBoardModel.findOne({
      _id: boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!board) {
      logger.error("Board not found");
      res.status(404).send("Board not found");
      return;
    }

    // Get highest order number and add 1
    const highestOrder = await todoColumnModel
      .findOne({ boardId })
      .sort({ order: -1 })
      .select("order");

    const nextOrder = (highestOrder?.order || -1) + 1;

    const data = new todoColumnModel({
      userId: user._id,
      workspaceId: workspace._id,
      boardId,
      title,
      color,
      uniqueId,
      order: nextOrder,
    });

    const created = await data.save();

    if (!created) {
      logger.error("Failed to create TodoColumns.");
      res.status(500).send("Failed to create TodoColumns.");
      return;
    }
    logger.info("TodoColumns created successfully.");
    res.status(201).send(created._id);
  } catch (err) {
    logger.error("Error creating TodoColumns:", err);
    res
      .status(500)
      .send("Failed to create TodoColumns. Please try again later.");
  }
};

const updateTodosColumn = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId, id } = req.params;
    const { title, order } = req.body;
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

    // Verify board exists and belongs to user
    const board = await kanbanBoardModel.findOne({
      _id: boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!board) {
      logger.error("Board not found");
      res.status(404).send("Board not found");
      return;
    }

    const updateData: { title?: string; order?: number } = {};
    if (title) updateData.title = title;
    if (typeof order === "number") updateData.order = order;

    const updated = await todoColumnModel.findOneAndUpdate(
      {
        uniqueId: id,
        boardId,
        userId: user._id,
        workspaceId: workspace._id,
      },
      updateData,
      { new: true }
    );

    if (!updated) {
      logger.error("TodoColumns not updated.");
      res.status(404).send("TodoColumns not updated.");
      return;
    }

    logger.info("TodoColumns updated successfully.");
    res.status(200).send(updated);
  } catch (err) {
    logger.error("Error updating TodoColumns:", err);
    res
      .status(500)
      .send("Failed to update todo column. Please try again later.");
  }
};

const deleteTodosColumn = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId, id } = req.params;
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

    // Verify board exists and belongs to user
    const board = await kanbanBoardModel.findOne({
      _id: boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!board) {
      logger.error("Board not found");
      res.status(404).send("Board not found");
      return;
    }

    const column = await todoColumnModel.findOneAndDelete({
      uniqueId: id,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!column) {
      logger.error("TodoColumns not found.");
      res.status(404).send("TodoColumns not found.");
      return;
    }

    // Delete all todos in the column
    await todosModel.deleteMany({
      _id: { $in: column.todoIds },
    });

    logger.info("TodoColumns and associated todos deleted successfully.");
    res.status(200).send("TodoColumns deleted successfully.");
  } catch (err) {
    logger.error("Error deleting TodoColumns:", err);
    res
      .status(500)
      .send("Failed to delete TodoColumns. Please try again later.");
  }
};

const reorderColumns = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId } = req.params;
    const columnOrders: { columnId: string; order: number }[] =
      req.body.columnOrders; 
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

    // Verify board exists and belongs to user
    const board = await kanbanBoardModel.findOne({
      _id: boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!board) {
      logger.error("Board not found");
      res.status(404).send("Board not found");
      return;
    }

    // Update orders in bulk
    await Promise.all(
      columnOrders.map(({ columnId, order }) =>
        todoColumnModel.findOneAndUpdate(
          {
            uniqueId: columnId,
            boardId,
            userId: user._id,
            workspaceId: workspace._id,
          },
          { order },
          { new: true }
        )
      )
    );

    logger.info("Column orders updated successfully.");
    res.status(200).send("Column orders updated successfully.");
  } catch (err) {
    logger.error("Error reordering columns:", err);
    res.status(500).send("Failed to reorder columns. Please try again later.");
  }
};

export {
  createTodoColumns,
  deleteTodosColumn,
  getTodoColumns,
  updateTodosColumn,
  reorderColumns,
};
