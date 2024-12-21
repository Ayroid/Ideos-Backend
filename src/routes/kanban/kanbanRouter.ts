import { Router } from "express";
import {
  getBoards,
  getBoardWithDetails,
  createBoard,
  updateBoard,
  deleteBoard,
  setDefaultBoard,
} from "../../controllers/kanban/kanbanController";
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

kanbanRouter.route("/boards").get(getBoards).post(createBoard);

kanbanRouter
  .route("/boards/:id")
  .get(getBoardWithDetails)
  .put(updateBoard)
  .delete(deleteBoard);

kanbanRouter.route("/boards/:id/default").put(setDefaultBoard);

kanbanRouter
  .route("/boards/:boardId/columns")
  .get(getTodoColumns)
  .post(createTodoColumns);

kanbanRouter
  .route("/boards/:boardId/columns/:id")
  .put(updateTodosColumn)
  .delete(deleteTodosColumn);

kanbanRouter.route("/boards/:boardId/todos").get(getTodos).post(createTodo);

kanbanRouter
  .route("/boards/:boardId/todos/:id")
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

export { kanbanRouter };
