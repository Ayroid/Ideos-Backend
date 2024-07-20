import mongoose, { Schema } from "mongoose";

enum TodoStatus {
  TODO = "todo",
  IN_PROGRESS = "inprogress",
  COMPLETED = "completed",
  OVERDUE = "overdue",
}

const TodoStatusValues = Object.values(TodoStatus) as string[];

export interface ITodo {
  title: string;
  description: string;
  status: string;
  tags: string[];
  dueDate: Date;
}

const todosSchema: Schema<ITodo> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: TodoStatusValues,
      required: true,
      default: TodoStatus.TODO,
    },
    tags: {
      type: [String],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const todosModel = mongoose.model<ITodo>("todos", todosSchema);

export default todosModel;
