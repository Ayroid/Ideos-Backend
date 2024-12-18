import dotenv from "dotenv";
import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import logger from "../../logger";
import { todoColumnModel, usersModel, todosModel, workspacesModel } from "../../models";

dotenv.config();

const getTodoColumns = async (
 req: AuthenticatedRequest,
 res: Response
): Promise<void> => {
 try {
   const userInfo = req.user;

   if (!userInfo) {
     logger.error("Unauthorized Access");
     res.status(400).send("Unauthorized Access");
     return;
   }

   const user = await usersModel.findOne({ authId: userInfo.id });

   if (!user) {
     logger.error("Unauthorized Access");
     res.status(409).send("Unauthorized Access");
     return;
   }

   const workspace = await workspacesModel.findOne({ userId: user._id });

   if (!workspace) {
     logger.error("Workspace not found");
     res.status(404).send("Workspace not found");
     return;
   }

   const result = await todoColumnModel
     .find({ userId: user._id, workspaceId: workspace._id })
     .populate("todoIds");

   if (!result) {
     logger.error("TodoColumns not found");
     res.status(404).send([]);
     return;
   }

   logger.info("TodoColumns read successfully.");
   res.status(200).send(result);
 } catch (err) {
   logger.error("Error getting TodoColumns:", err);
   res.status(500).send("Failed to get TodoColumns. Please try again later.");
 }
};

const createTodoColumns = async (
 req: AuthenticatedRequest,
 res: Response
): Promise<void> => {
 try {
   const { title, uniqueId, color } = req.body;

   if (!title || !uniqueId || !color) {
     logger.error("Error Fetching Columns: All fields are required.");
     res.status(400).send("Error Fetching Columns: All fields are required.");
     return;
   }

   const userInfo = req.user;

   if (!userInfo) {
     logger.error("Unauthorized Access");
     res.status(400).send("Unauthorized Access");
     return;
   }

   const user = await usersModel.findOne({ authId: userInfo.id });

   if (!user) {
     logger.error("Unauthorized Access");
     res.status(409).send("Unauthorized Access");
     return;
   }

   const workspace = await workspacesModel.findOne({ userId: user._id });

   if (!workspace) {
     logger.error("Workspace not found");
     res.status(404).send("Workspace not found");
     return;
   }

   const data = new todoColumnModel({
     userId: user._id,
     workspaceId: workspace._id,
     title,
     color,
     uniqueId,
   });

   const created = await data.save();

   if (!created) {
     logger.error("Failed to create TodoColumns.");
     res.status(500).send("Failed to create TodoColumns.");
     return;
   }
   logger.info("TodoColumns created successfully.");
   res.status(201).send(created._id);
 } catch (err) {
   logger.error("Error creating TodoColumns:", err);
   res.status(500).send("Failed to create TodoColumns. Please try again later.");
 }
};

const updateTodosColumn = async (
 req: AuthenticatedRequest,
 res: Response
): Promise<void> => {
 try {
   const { id } = req.params;
   const { title } = req.body;
   const userInfo = req.user;

   if (!userInfo) {
     logger.error("Unauthorized Access");
     res.status(400).send("Unauthorized Access");
     return;
   }

   const user = await usersModel.findOne({ authId: userInfo.id });

   if (!user) {
     logger.error("Unauthorized Access");
     res.status(409).send("Unauthorized Access");
     return;
   }

   const workspace = await workspacesModel.findOne({ userId: user._id });

   if (!workspace) {
     logger.error("Workspace not found");
     res.status(404).send("Workspace not found");
     return;
   }

   const updated = await todoColumnModel.findOneAndUpdate(
     { uniqueId: id, userId: user._id, workspaceId: workspace._id },
     {
       title,
     }
   );

   if (!updated) {
     logger.error("TodoColumns not updated.");
     res.status(404).send("TodoColumns not updated.");
     return;
   }

   logger.info("TodoColumns updated successfully.");
   res.status(200).send("TodoColumns updated successfully.");
 } catch (err) {
   logger.error("Error updating TodoColumns:", err);
   res.status(500).send("Failed to update todo. Please try again later.");
 }
};

const deleteTodosColumn = async (
 req: AuthenticatedRequest,
 res: Response
): Promise<void> => {
 try {
   const { id } = req.params;
   const userInfo = req.user;

   if (!userInfo) {
     logger.error("Unauthorized Access");
     res.status(400).send("Unauthorized Access");
     return;
   }

   const user = await usersModel.findOne({ authId: userInfo.id });

   if (!user) {
     logger.error("Unauthorized Access");
     res.status(409).send("Unauthorized Access");
     return;
   }

   const workspace = await workspacesModel.findOne({ userId: user._id });

   if (!workspace) {
     logger.error("Workspace not found");
     res.status(404).send("Workspace not found");
     return;
   }

   const todo = await todoColumnModel.findOneAndDelete({
     uniqueId: id,
     userId: user._id,
     workspaceId: workspace._id
   });

   if (!todo) {
     console.log("TodoColumns not found.");
     res.status(404).send("TodoColumns not found.");
     return;
   }

   todo.todoIds?.forEach(async (todoId) => {
     await todosModel.findOneAndDelete({ _id: todoId });
   });

   logger.info("TodoColumns deleted successfully.");
   res.status(200).send("TodoColumns deleted successfully.");
 } catch (err) {
   logger.error("Error deleting TodoColumns:", err);
   res.status(500).send("Failed to delete TodoColumns. Please try again later.");
 }
};

export {
 createTodoColumns,
 deleteTodosColumn,
 getTodoColumns,
 updateTodosColumn,
};