import mongoose, { Document, Schema, model } from "mongoose";

interface NoteDocument extends Document {
  title: string;
  content: string;
  folderId: mongoose.Types.ObjectId | null;
  isMarkup: boolean;
  createdAt: Date;
}

const noteSchema = new Schema<NoteDocument>({
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
    ref: "Folder",
    default: null,
  },
  isMarkup: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const NoteModel = model<NoteDocument>("Note", noteSchema);
