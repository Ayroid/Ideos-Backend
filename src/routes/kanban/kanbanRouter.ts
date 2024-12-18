import { Router } from "express";
import {
  getTodoColumns,
  createTodoColumns,
  updateTodosColumn,
  deleteTodosColumn,
} from "../../controllers/kanban/todoColumnsController";
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../controllers/kanban/todosController";

const kanbanRouter: Router = Router();

kanbanRouter.route("/columns").get(getTodoColumns).post(createTodoColumns);

kanbanRouter
  .route("/columns/:id")
  .put(updateTodosColumn)
  .delete(deleteTodosColumn);

kanbanRouter.route("/todos").get(getTodos).post(createTodo);

kanbanRouter
  .route("/todos/:id")
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

export { kanbanRouter };
