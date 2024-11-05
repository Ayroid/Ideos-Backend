import mongoose, { Document, Schema, model } from "mongoose";

interface FolderDocument extends Document {
  name: string;
  notes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const folderSchema = new Schema<FolderDocument>({
  name: {
    type: String,
    required: true,
  },
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const FolderModel = model<FolderDocument>("Folder", folderSchema);
