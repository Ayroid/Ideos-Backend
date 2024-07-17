import { Router } from "express";

import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todosController.js";

const todosRouter = Router();

todosRouter.route("/").get(getTodos).post(createTodo);
todosRouter.route("/:id").get(getTodoById).put(updateTodo).delete(deleteTodo);

export default todosRouter;
