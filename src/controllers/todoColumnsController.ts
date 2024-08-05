import dotenv from "dotenv";
import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { todoColumnModel } from "../models/todosColumnModel";
import { usersModel } from "../models/usersModel";

dotenv.config();

const getTodoColumns = async (
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

    const result = await todoColumnModel.find({ userId: user._id });

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
    const { title, uniqueId } = req.body;

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

    const data = new todoColumnModel({
      title,
      uniqueId,
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

    const updated = await todoColumnModel.findOneAndUpdate(
      { uniqueId: id },
      {
        title,
      }
    );

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

    const todo = await todoColumnModel.findOneAndDelete({ uniqueId: id });

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
  createTodoColumns,
  deleteTodosColumn,
  getTodoColumns,
  updateTodosColumn,
};
