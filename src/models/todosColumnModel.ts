import mongoose, { Schema, model, Document } from "mongoose";

export interface ITodoColumn extends Document {
  userId: mongoose.Types.ObjectId;
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

const todoColumnModel = model<ITodoColumn>("todocolumns", todoColumnSchema);

export default todoColumnModel;
