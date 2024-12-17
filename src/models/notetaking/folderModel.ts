import mongoose, { Document, Schema, model } from "mongoose";

interface IFolder extends Document {
  name: string;
  notebookId: mongoose.Types.ObjectId;
}

const folderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: true,
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notebooks",
      required: true,
    },
  },
  { timestamps: true }
);

export const foldersModel = model<IFolder>("folders", folderSchema);
