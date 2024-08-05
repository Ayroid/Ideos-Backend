import dotenv from "dotenv";
import mongoose from "mongoose";
import { Response } from "express";
import { todoColumnModel, usersModel, todosModel } from "../models";
import { AuthenticatedRequest } from "../../types";

dotenv.config();

const getTodoById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { uniqueId } = req.params;

    const todo = await todosModel.findOne({ uniqueId });

    if (!todo) {
      res.status(404).send("Todo not found.");
      return;
    }
    console.log("Sending Todo:", todo._id);
    res.status(200).send(todo);
  } catch (err) {
    console.error("Error getting todo:", err);
    res.status(500).send("Failed to get todo. Please try again later.");
  }
};

const getTodos = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;

    if (!userInfo) {
      res.status(400).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      res.status(409).send("Unauthorized Access");
      return;
    }

    const todos = await todosModel.find({ userId: user._id });

    if (!todos || todos.length === 0) {
      res.status(404).send("Todos not found.");
      return;
    }

    console.log("Sending fetched columns");
    res.status(200).send(todos);
  } catch (err) {
    console.error("Error getting todos:", err);
    res.status(500).send("Failed to get todos. Please try again later.");
  }
};

const createTodo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { uniqueId, columnId, title, description, tags, dueDate } = req.body;

    if (!uniqueId || !columnId || !title || !description || !tags || !dueDate) {
      res.status(400).send("All fields are required.");
      return;
    }

    const userInfo = req.user;

    if (!userInfo) {
      res.status(400).send("Unauthorized Access");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });

    if (!user) {
      res.status(409).send("Unauthorized Access");
      return;
    }

    const todoData = new todosModel({
      userId: user?._id,
      uniqueId,
      columnId,
      title,
      description,
      tags,
      dueDate: new Date(dueDate),
    });

    const todoCreated = await todoData.save();

    if (!todoCreated) {
      res.status(500).send("Failed to create todo.");
      return;
    }

    const todoColumn = await todoColumnModel.findOne({ uniqueId: columnId });

    if (!todoColumn) {
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

      res.status(500).send("Failed to update todo column.");
      return;
    }

    console.log("Todo created and added to column successfully.");
    res.status(201).send("Todo created successfully.");
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).send("Failed to create todo. Please try again later.");
  }
};

const updateTodo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { columnId, title, description, tags, dueDate } = req.body;

    const todo = await todosModel.findOne({ uniqueId: id });

    if (!todo) {
      res.status(404).send("Todo not found.");
      return;
    }

    todo.title = title || todo.title;
    todo.columnId = columnId || todo.columnId;
    todo.description = description || todo.description;
    todo.tags = tags || todo.tags;
    todo.dueDate = dueDate ? new Date(dueDate) : todo.dueDate;

    const todoUpdated = await todo.save();

    if (!todoUpdated) {
      res.status(500).send("Failed to update todo.");
      return;
    }

    console.log("Todo updated successfully.");
    res.status(200).send("Todo updated successfully.");
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("Failed to update todo. Please try again later.");
  }
};

const deleteTodo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const todo = await todosModel.findOne({ uniqueId: id });

    if (!todo) {
      res.status(404).send("Todo not found.");
      return;
    }

    const todoColumn = await todoColumnModel.findOne({ todoIds: todo._id });

    if (todoColumn) {
      const todoIndex = todoColumn.todoIds!.indexOf(
        todo._id as mongoose.Types.ObjectId
      );
      if (todoIndex > -1) {
        todoColumn.todoIds!.splice(todoIndex, 1);
        const todoColumnSaved = await todoColumn.save();

        if (!todoColumnSaved) {
          console.error("Failed to update todo column.");
          res.status(500).send("Failed to update todo column.");
          return;
        }
      }
    }

    const todoDeleted = await todosModel.findOneAndDelete({ uniqueId: id });

    if (!todoDeleted) {
      res.status(500).send("Failed to delete todo.");
      return;
    }

    console.log("Todo deleted successfully.");
    res.status(200).send("Todo deleted successfully.");
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).send("Failed to delete todo. Please try again later.");
  }
};

export { getTodoById, getTodos, createTodo, deleteTodo, updateTodo };
