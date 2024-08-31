import mongoose, { Document, Schema, model } from "mongoose";

export interface ITodoColumn extends Document {
  userId: mongoose.Types.ObjectId;
  uniqueId: string;
  title: string;
  color: string;
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
  },
  {
    timestamps: true,
  }
);

export const todoColumnModel = model<ITodoColumn>(
  "todocolumns",
  todoColumnSchema
);
