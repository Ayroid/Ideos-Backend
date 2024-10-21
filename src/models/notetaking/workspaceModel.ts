import mongoose, { Document, Schema, model } from "mongoose";

interface WorkspaceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  logo: string | null;
  description: string;
  theme: string;
  createdAt: Date;
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
  logo: {
    type: String,
    default: null,
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
});

export const WorkspaceModel = model<WorkspaceDocument>(
  "Workspace",
  workspaceSchema
);
