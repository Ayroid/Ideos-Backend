import dotenv from "dotenv";
import mongoose from "mongoose";
import { Response } from "express";
import {
  todoColumnModel,
  usersModel,
  todosModel,
  workspacesModel,
  kanbanBoardModel,
} from "../../models";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";

dotenv.config();

const getTodoById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId, uniqueId } = req.params;
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

    const todo = await todosModel.findOne({
      uniqueId,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!todo) {
      logger.error("Todo not found.");
      res.status(404).send("Todo not found.");
      return;
    }
    logger.info("Sending Todo:", todo._id);
    res.status(200).send(todo);
  } catch (err) {
    logger.error("Error getting todo:", err);
    res.status(500).send("Failed to get todo. Please try again later.");
  }
};

const getTodos = async (
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

    const todos = await todosModel
      .find({
        userId: user._id,
        workspaceId: workspace._id,
        boardId,
      })
      .sort({ order: 1 });

    if (!todos || todos.length === 0) {
      logger.info("No todos found for this board.");
      res.status(200).send([]);
      return;
    }

    logger.info("Sending fetched todos");
    res.status(200).send(todos);
  } catch (err) {
    logger.error("Error getting todos:", err);
    res.status(500).send("Failed to get todos. Please try again later.");
  }
};

const createTodo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { uniqueId, columnId, title, description, tags, dueDate } = req.body;

    if (!uniqueId || !columnId || !title || !description || !tags || !dueDate) {
      logger.info("Error Creating Todo: All fields are required.");
      res.status(400).send("Error Creating Todo: All fields are required.");
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

    const highestOrder = await todosModel
      .findOne({ boardId, columnId })
      .sort({ order: -1 })
      .select("order");

    const nextOrder = (highestOrder?.order || -1) + 1;

    const todoData = new todosModel({
      userId: user._id,
      workspaceId: workspace._id,
      boardId,
      uniqueId,
      columnId,
      title,
      description,
      tags,
      dueDate: new Date(dueDate),
      order: nextOrder,
    });

    const todoCreated = await todoData.save();

    if (!todoCreated) {
      logger.error("Failed to create todo.");
      res.status(500).send("Failed to create todo.");
      return;
    }

    const todoColumn = await todoColumnModel.findOne({
      uniqueId: columnId,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!todoColumn) {
      await todosModel.findByIdAndDelete(todoCreated._id);
      logger.error("Todo column not found.");
      res.status(404).send("Todo column not found.");
      return;
    }

    todoColumn.todoIds!.push(todoCreated._id as mongoose.Types.ObjectId);
    const todoColumnSaved = await todoColumn.save();

    if (!todoColumnSaved) {
      await todosModel.findByIdAndDelete(todoCreated._id);

      const todoIndex = todoColumn.todoIds!.indexOf(
        todoCreated._id as mongoose.Types.ObjectId
      );
      if (todoIndex > -1) {
        todoColumn.todoIds!.splice(todoIndex, 1);
      }
      logger.error("Failed to update todo column.");
      res.status(500).send("Failed to update todo column.");
      return;
    }

    logger.info("Todo created and added to column successfully.");
    res.status(201).send(todoCreated);
  } catch (err) {
    logger.error("Error creating todo:", err);
    res.status(500).send("Failed to create todo. Please try again later.");
  }
};

const updateTodo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId, id } = req.params;
    const { columnId, title, description, tags, dueDate, order } = req.body;
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

    const todo = await todosModel.findOne({
      uniqueId: id,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!todo) {
      logger.error("Todo not found.");
      res.status(404).send("Todo not found.");
      return;
    }

    if (columnId && columnId !== todo.columnId) {
      const oldColumn = await todoColumnModel.findOne({
        todoIds: todo._id,
        boardId,
        userId: user._id,
        workspaceId: workspace._id,
      });

      const newColumn = await todoColumnModel.findOne({
        uniqueId: columnId,
        boardId,
        userId: user._id,
        workspaceId: workspace._id,
      });

      if (!newColumn) {
        logger.error("Target column not found.");
        res.status(404).send("Target column not found.");
        return;
      }

      if (oldColumn) {
        const todoIndex = oldColumn.todoIds!.indexOf(
          todo._id as mongoose.Types.ObjectId
        );
        if (todoIndex > -1) {
          oldColumn.todoIds!.splice(todoIndex, 1);
          await oldColumn.save();
        }
      }

      newColumn.todoIds!.push(todo._id as mongoose.Types.ObjectId);
      await newColumn.save();
    }

    todo.title = title || todo.title;
    todo.columnId = columnId || todo.columnId;
    todo.description = description || todo.description;
    todo.tags = tags || todo.tags;
    todo.dueDate = dueDate ? new Date(dueDate) : todo.dueDate;
    if (typeof order === "number") todo.order = order;

    const todoUpdated = await todo.save();

    if (!todoUpdated) {
      logger.error("Failed to update todo.");
      res.status(500).send("Failed to update todo.");
      return;
    }

    logger.info("Todo updated successfully.");
    res.status(200).send(todoUpdated);
  } catch (err) {
    logger.error("Error updating todo:", err);
    res.status(500).send("Failed to update todo. Please try again later.");
  }
};

const deleteTodo = async (
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

    const todo = await todosModel.findOne({
      uniqueId: id,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!todo) {
      logger.error("Todo not found.");
      res.status(404).send("Todo not found.");
      return;
    }

    const todoColumn = await todoColumnModel.findOne({
      todoIds: todo._id,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (todoColumn) {
      const todoIndex = todoColumn.todoIds!.indexOf(
        todo._id as mongoose.Types.ObjectId
      );
      if (todoIndex > -1) {
        todoColumn.todoIds!.splice(todoIndex, 1);
        await todoColumn.save();
      }
    }

    await todosModel.findOneAndDelete({
      uniqueId: id,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    logger.info("Todo deleted successfully.");
    res.status(200).send("Todo deleted successfully.");
  } catch (err) {
    logger.error("Error deleting todo:", err);
    res.status(500).send("Failed to delete todo. Please try again later.");
  }
};

const reorderTodos = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId, columnId } = req.params;
    const { todoOrders } = req.body as {
      todoOrders: { todoId: string; order: number }[];
    };
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

    await Promise.all(
      todoOrders.map(({ todoId, order }) =>
        todosModel.findOneAndUpdate(
          {
            uniqueId: todoId,
            boardId,
            columnId,
            userId: user._id,
            workspaceId: workspace._id,
          },
          { order },
          { new: true }
        )
      )
    );

    logger.info("Todo orders updated successfully.");
    res.status(200).send("Todo orders updated successfully.");
  } catch (err) {
    logger.error("Error reordering todos:", err);
    res.status(500).send("Failed to reorder todos. Please try again later.");
  }
};

const moveTodo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId, id } = req.params;
    const { targetColumnId, newOrder } = req.body;
    const userInfo = req.user;

    if (!userInfo || !targetColumnId || typeof newOrder !== "number") {
      logger.error("Invalid request parameters");
      res.status(400).send("Invalid request parameters");
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

    const todo = await todosModel.findOne({
      uniqueId: id,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!todo) {
      logger.error("Todo not found");
      res.status(404).send("Todo not found");
      return;
    }

    const sourceColumn = await todoColumnModel.findOne({
      uniqueId: todo.columnId,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    const targetColumn = await todoColumnModel.findOne({
      uniqueId: targetColumnId,
      boardId,
      userId: user._id,
      workspaceId: workspace._id,
    });

    if (!sourceColumn || !targetColumn) {
      logger.error("Column not found");
      res.status(404).send("Column not found");
      return;
    }

    const sourceIndex = sourceColumn.todoIds!.indexOf(
      todo._id as mongoose.Types.ObjectId
    );
    if (sourceIndex > -1) {
      sourceColumn.todoIds!.splice(sourceIndex, 1);
      await sourceColumn.save();
    }

    targetColumn.todoIds!.push(todo._id as mongoose.Types.ObjectId);
    await targetColumn.save();

    todo.columnId = targetColumnId;
    todo.order = newOrder;
    await todo.save();

    await todosModel.updateMany(
      {
        boardId,
        columnId: targetColumnId,
        order: { $gte: newOrder },
        uniqueId: { $ne: id },
      },
      { $inc: { order: 1 } }
    );

    logger.info("Todo moved successfully");
    res.status(200).send("Todo moved successfully");
  } catch (err) {
    logger.error("Error moving todo:", err);
    res.status(500).send("Failed to move todo. Please try again later.");
  }
};

export {
  getTodoById,
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
  reorderTodos,
  moveTodo,
};
