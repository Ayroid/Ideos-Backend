import dotenv from "dotenv";
import { Request, Response } from "express";
import { todosModel } from "../models/todosModel"; // Assuming todosModel exports Todo interface

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

const getTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, sort } = req.query;
    const query: any = status ? { status } : {}; // Adjust type as per your schema

    const todos = await todosModel.find(query).sort({
      ratings: sort === "asc" ? 1 : -1,
    });

    if (!todos || todos.length === 0) {
      res.status(404).send("Todos not found.");
      return;
    }

    res.status(200).send(todos);
  } catch (err) {
    console.error("Error getting todos:", err);
    res.status(500).send("Failed to get todos. Please try again later.");
  }
};

const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, columnId, title, description, tags, dueDate } = req.body;

    if (!userId || !columnId || !title || !description || !tags || !dueDate) {
      res.status(400).send("All fields are required.");
      return;
    }

    const todoData = new todosModel({
      userId,
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

    res.status(201).send("Todo created successfully.");
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).send("Failed to create todo. Please try again later.");
  }
};

const updateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, columnId, title, description, tags, dueDate } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).send("Invalid todo ID.");
      return;
    }

    const todo = await todosModel.findById(id);

    if (!todo) {
      res.status(404).send("Todo not found.");
      return;
    }

    todo.userId = userId || todo.userId;
    todo.columnId = columnId || todo.columnId;
    todo.title = title || todo.title;
    todo.description = description || todo.description;
    todo.tags = tags || todo.tags;
    todo.dueDate = dueDate ? new Date(dueDate) : todo.dueDate;

    const todoUpdated = await todo.save();

    if (!todoUpdated) {
      res.status(500).send("Failed to update todo.");
      return;
    }

    res.status(200).send("Todo updated successfully.");
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("Failed to update todo. Please try again later.");
  }
};

const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).send("Invalid todo ID.");
      return;
    }

    const todo = await todosModel.findByIdAndDelete(id);

    if (!todo) {
      res.status(404).send("Todo not found.");
      return;
    }

    res.status(200).send("Todo deleted successfully.");
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).send("Failed to delete todo. Please try again later.");
  }
};

export { createTodo, deleteTodo, getTodoById, getTodos, updateTodo };
