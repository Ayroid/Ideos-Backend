import mongoose, { Document, Schema, model } from "mongoose";

// Interface for the Workspace model
export interface IWorkspace extends Document {
  userId: mongoose.Types.ObjectId;  // Corresponds to "workspaceOwner" in your payload
  title: string;  // Corresponds to "title" in your payload
  iconId: string;
  bannerUrl: string;
  logo: string | null;
  inTrash: boolean;
  folders: string[];
  data: any;  // To handle any data type, including null
  createdAt: Date;
}

// Workspace Schema definition
const workspaceSchema: Schema<IWorkspace> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
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
    logo: {
      type: String,
      default: null,
    },
    inTrash: {
      type: Boolean,
      default: false,
    },
    folders: {
      type: [String],
      default: [],
    },
    data: {
      type: Schema.Types.Mixed,  // Allows any data type, including null
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,  // Ensures the createdAt field is set automatically
      updatedAt: false, // Prevents automatic creation of updatedAt field
    },
  }
);

// Creating and exporting the Workspace model
export const workspaceModel = model<IWorkspace>("workspaces", workspaceSchema);
