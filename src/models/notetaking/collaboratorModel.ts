import mongoose, { Document, Schema, model } from "mongoose";

// Interface for the Collaborator model
export interface ICollaborator extends Document {
  workspaceId: mongoose.Types.ObjectId; // Reference to the Workspace model
  userId: mongoose.Types.ObjectId; // Reference to the User model
  createdAt: Date;
}

// Collaborator Schema definition
const collaboratorSchema: Schema<ICollaborator> = new Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspaces",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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

// Creating and exporting the Collaborator model
export const collaboratorModel = model<ICollaborator>("collaborators", collaboratorSchema);
