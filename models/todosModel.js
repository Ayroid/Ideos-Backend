import mongoose from "mongoose";

const TodoStatus = {
  TODO: "todo",
  IN_PROGRESS: "inprogress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
};

const TodoStatusValues = Object.values(TodoStatus);

const todosSchema = new mongoose.Schema(
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

const todosModel = mongoose.model("todos", todosSchema);

export default todosModel;
