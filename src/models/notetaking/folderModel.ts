import mongoose, { Document, Schema, model } from "mongoose";

interface IFolder extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
}

const folderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspaces",
      required: true,
    }
  },
  { timestamps: true }
);

folderSchema.index({ userId: 1, workspaceId: 1 });

export const foldersModel = model<IFolder>("folders", folderSchema);