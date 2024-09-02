import { Router } from "express";

import {
  getTodoColumns,
  createTodoColumns,
  updateTodosColumn,
  deleteTodosColumn,
} from "../../controllers/todoColumnsController";

const todoColumnsRouter: Router = Router();

todoColumnsRouter.route("/").get(getTodoColumns).post(createTodoColumns);
todoColumnsRouter
  .route("/:id")
  .put(updateTodosColumn)
  .delete(deleteTodosColumn);

export { todoColumnsRouter };
