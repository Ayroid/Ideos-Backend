import mongoose, { Document, model, Schema } from "mongoose";

export interface IPomodoroTemplates extends Document {
  userId: mongoose.Types.ObjectId;
  templateName: string;
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

const PomodoroTemplatesSchema: Schema<IPomodoroTemplates> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    templateName: {
      type: String,
      required: true,
    },
    pomodoroDuration: {
      type: Number,
      required: true,
    },
    shortBreakDuration: {
      type: Number,
      required: true,
    },
    longBreakDuration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const pomodoroTemplatesModel = model<IPomodoroTemplates>(
  "pomodoroTemplates",
  PomodoroTemplatesSchema
);
