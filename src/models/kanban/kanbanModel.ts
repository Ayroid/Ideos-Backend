import mongoose, { Schema, model, Document } from "mongoose";

export interface IKanbanBoard extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  isDefault: boolean;
}

const kanbanBoardSchema: Schema<IKanbanBoard> = new Schema(
  {
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
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

kanbanBoardSchema.index({ userId: 1, workspaceId: 1 });

export const kanbanBoardModel = model<IKanbanBoard>(
  "kanbanboards",
  kanbanBoardSchema
);
