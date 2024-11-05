import mongoose, { Document, Schema, model } from "mongoose";

interface WorkspaceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  theme: string;
  createdAt: Date;
  folders: mongoose.Types.ObjectId[]; // Array of folder IDs
}

const workspaceSchema = new Schema<WorkspaceDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  theme: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  folders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
  ],
});

export const WorkspaceModel = model<WorkspaceDocument>(
  "Workspace",
  workspaceSchema
);
