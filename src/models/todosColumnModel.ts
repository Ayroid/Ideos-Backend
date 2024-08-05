import mongoose, { Schema, model, Document } from "mongoose";

export interface ITodoColumn extends Document {
  userId: mongoose.Types.ObjectId;
  uniqueId: string;
  title: string;
  todoIds?: mongoose.Types.ObjectId[];
}

const todoColumnSchema: Schema<ITodoColumn> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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
    todoIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "todos",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const todoColumnModel = model<ITodoColumn>(
  "todocolumns",
  todoColumnSchema
);
