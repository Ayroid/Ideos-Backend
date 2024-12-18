import mongoose, { Document, Schema } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}

const WorkspaceSchema: Schema<IWorkspace> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

WorkspaceSchema.index({ name: 1, userId: 1 });

export const workspacesModel = mongoose.model<IWorkspace>(
  "workspaces",
  WorkspaceSchema
);
