import mongoose, { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  uniqueId: string;
  columnId: string;
  title: string;
  description: string;
  tags: { title: string; color: string }[];
  dueDate: Date;
}

const todosSchema: Schema<ITodo> = new Schema(
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
    uniqueId: {
      type: String,
      required: true,
    },
    columnId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    tags: {
      type: [
        {
          title: { type: String, required: true },
          color: { type: String, required: true },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

todosSchema.index({ workspaceId: 1, columnId: 1 });
todosSchema.index({ userId: 1, workspaceId: 1 });
todosSchema.index({ workspaceId: 1, uniqueId: 1 });

export const todosModel = model<ITodo>("todos", todosSchema);
