import { Router } from "express";

import {
  getTodoColumns,
  // getTodosColumnById,
  createTodoColumns,
  updateTodosColumn,
  deleteTodosColumn,
} from "../controllers/todoColumnsController";

const todosColumnRouter: Router = Router();

todosColumnRouter.route("/").get(getTodoColumns).post(createTodoColumns);
todosColumnRouter
  .route("/:id")
//   .get(getTodosColumnById)
  .put(updateTodosColumn)
  .delete(deleteTodosColumn);

export default todosColumnRouter;
