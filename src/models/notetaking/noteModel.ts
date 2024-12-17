import mongoose, { Document, Schema, model } from "mongoose";

interface INote extends Document {
  title: string;
  content: string;
  folderId: mongoose.Types.ObjectId;
  notebookId: mongoose.Types.ObjectId;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folders",
      default: null,
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notebooks",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const notesModel = model<INote>("notes", noteSchema);
