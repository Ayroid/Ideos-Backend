import dotenv from "dotenv";
import { Request, Response } from "express";
import { todosModel } from "../models/todosModel";
import { todoColumnModel } from "../models/todosColumnModel";
import { AuthenticatedRequest } from "../../types";
import { usersModel } from "../models/usersModel";

dotenv.config();

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

const getTodoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).send("Invalid Todo ID.");
      return;
    }

    const todo = await todosModel.findById(id);

    if (!todo) {
      res.status(404).send("Todo not found.");
      return;
    }

    res.status(200).send(todo);
  } catch (err) {
    console.error("Error getting todo:", err);
    res.status(500).send("Failed to get todo. Please try again later.");
  }
};

const getTodoColumns = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req.user;
    if (!userInfo) {
      res.status(400).send("User information missing in request.");
      return;
    }

    const user = await usersModel.findOne({ authId: userInfo.id });
    if (!user) {
      res.status(409).send("User not found");
      return;
    }

    const userId = user._id + "";

    const result = await todoColumnModel.find({ userId });

    if (!result) {
      res.status(404).send([]);
      return;
    }

    console.log("Sending fetched columns");
    res.status(200).send(result);
  } catch (err) {
    console.error("Error getting TodoColumns:", err);
    res.status(500).send("Failed to get TodoColumns. Please try again later.");
  }
};

const createTodoColumns = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title } = req.body;
    const userInfo = req.user;

    const user = await usersModel.findOne({ authId: userInfo!.id });

    const data = new todoColumnModel({
      title,
      userId: user?._id,
    });

    const created = await data.save();

    if (!created) {
      res.status(500).send("Failed to create TodoColumns.");
      return;
    }
    console.log("TodoColumns created successfully.");
    res.status(201).send(created._id);
  } catch (err) {
    console.error("Error creating TodoColumns:", err);
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
    const { id } = req.params;
    const { title } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).send("Invalid ID.");
      return;
    }

    const updated = await todoColumnModel.findByIdAndUpdate(id, {
      title,
    });

    if (!updated) {
      res.status(404).send("TodoColumns not updated.");
      return;
    }

    console.log("TodoColumns updated successfully.");
    res.status(200).send("TodoColumns updated successfully.");
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("Failed to update todo. Please try again later.");
  }
};

const deleteTodosColumn = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).send("Invalid todo ID.");
      return;
    }

    const todo = await todoColumnModel.findByIdAndDelete(id);

    if (!todo) {
      res.status(404).send("TodoColumns not found.");
      return;
    }
    console.log("TodoColumns deleted successfully.");
    res.status(200).send("TodoColumns deleted successfully.");
  } catch (err) {
    console.error("Error deleting TodoColumns:", err);
    res
      .status(500)
      .send("Failed to delete TodoColumns. Please try again later.");
  }
};

export {
  getTodoColumns,
  // getTodosColumnById,
  createTodoColumns,
  updateTodosColumn,
  deleteTodosColumn,
};
