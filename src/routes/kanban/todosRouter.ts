import { Router } from "express";

import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../controllers/kanban/todosController";

const todosRouter: Router = Router();

todosRouter.route("/").get(getTodos).post(createTodo);
todosRouter.route("/:id").get(getTodoById).put(updateTodo).delete(deleteTodo);

export { todosRouter };
