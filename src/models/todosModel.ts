import mongoose, { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  userId: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
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
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "todocolumns",
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

export const todosModel = model<ITodo>("todos", todosSchema);
