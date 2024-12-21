import mongoose, { Document, Schema, model } from "mongoose";

export interface ITodoColumn extends Document {
  boardId: mongoose.Types.ObjectId; // New field
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  uniqueId: string;
  title: string;
  color: string;
  todoIds?: mongoose.Types.ObjectId[];
  order: number;
}

const todoColumnSchema: Schema<ITodoColumn> = new Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "kanbanboards",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspaces",
      required: true,
    },
    uniqueId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "#000000",
      required: true,
    },
    todoIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "todos",
      default: [],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

todoColumnSchema.index({ boardId: 1, uniqueId: 1 });
todoColumnSchema.index({ userId: 1, workspaceId: 1 });
todoColumnSchema.index({ boardId: 1, order: 1 });

export const todoColumnModel = model<ITodoColumn>(
  "todocolumns",
  todoColumnSchema
);
