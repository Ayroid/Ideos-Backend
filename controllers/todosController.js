import todosModel from "../models/todosModel.js";
import dotenv from "dotenv";
dotenv.config();

const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send("Invalid Todo ID.");
    }

    const todo = await todosModel.findById(id);

    if (!todo) {
      return res.status(404).send("Todo not found.");
    }
    res.status(200).send(todo);
  } catch (err) {
    console.error("Error getting todo:", err);
    res.status(500).send("Failed to get todo. Please try again later.");
  }
};

const getTodos = async (req, res) => {
  try {
    const { status, sort } = req.query;
    const query = status ? { status } : {};

    const todos = await todosModel.find(query).sort({
      ratings: sort === "asc" ? 1 : -1,
    });

    if (!todos) {
      return res.status(404).send("Todos not found.");
    }

    res.status(200).send(todos);
  } catch (err) {
    console.error("Error getting todos:", err);
    res.status(500).send("Failed to get todos. Please try again later.");
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, description, status, tags, dueDate } = req.body;

    if (!title || !description || !status || !tags || !dueDate) {
      return res.status(400).send("All fields are required.");
    }

    const todoData = {
      title,
      description,
      status,
      tags,
      dueDate,
    };

    const newTodo = new todosModel(todoData);

    const todoCreated = await newTodo.save();

    if (!todoCreated) {
      return res.status(500).send("Failed to create todo.");
    }

    res.status(201).send("Todo created successfully.");
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).send("Failed to create todo. Please try again later.");
  }
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, tags, dueDate } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send("Invalid todo ID.");
    }

    const todo = await todosModel.findById(id);

    console.log(todo);

    if (!todo) {
      return res.status(404).send("Todo not found.");
    }

    todo.title = title || todo.title;
    todo.description = description || todo.description;
    todo.status = status || todo.status;
    todo.tags = tags || todo.tags;
    todo.dueDate = dueDate || todo.dueDate;

    const todoUpdated = await todo.save();

    if (!todoUpdated) {
      return res.status(500).send("Failed to update todo.");
    }

    res.status(200).send("Todo updated successfully.");
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("Failed to update todo. Please try again later.");
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send("Invalid todo ID.");
    }

    const todo = await todosModel.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).send("Todo not found.");
    }

    res.status(200).send("Todo deleted successfully.");
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).send("Failed to delete todo. Please try again later.");
  }
};

export { getTodoById, getTodos, createTodo, updateTodo, deleteTodo };
