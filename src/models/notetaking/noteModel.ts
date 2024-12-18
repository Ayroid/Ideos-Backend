import mongoose, { Document, Schema, model } from "mongoose";

interface INote extends Document {
 title: string;
 content: string;
 folderId: mongoose.Types.ObjectId;
 notebookId: mongoose.Types.ObjectId;
 userId: mongoose.Types.ObjectId;
 workspaceId: mongoose.Types.ObjectId;
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
 {
   timestamps: true,
 }
);

noteSchema.index({ userId: 1, workspaceId: 1 });
noteSchema.index({ notebookId: 1, workspaceId: 1 });
noteSchema.index({ folderId: 1, workspaceId: 1 });

export const notesModel = model<INote>("notes", noteSchema);