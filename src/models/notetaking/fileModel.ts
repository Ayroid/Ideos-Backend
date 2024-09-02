import mongoose, { Document, Schema, model } from "mongoose";

// Interface for the File model
export interface IFile extends Document {
  title: string;
  iconId: string;
  bannerUrl: string;
  data: any;  // To handle any data type, including null
  workspaceId: mongoose.Types.ObjectId; // Reference to the Workspace model
  folderId: mongoose.Types.ObjectId; // Reference to the Folder model
  createdAt: Date;
}

// File Schema definition
const fileSchema: Schema<IFile> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    iconId: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    data: {
      type: Schema.Types.Mixed,  // Allows any data type, including null
      default: null,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspaces",
      required: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folders",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,  // Ensures the createdAt field is set automatically
      updatedAt: false, // Prevents automatic creation of updatedAt field
    },
  }
);

// Creating and exporting the File model
export const fileModel = model<IFile>("files", fileSchema);
