import mongoose, { Document, model, Schema } from "mongoose";

export interface IPomodoroSessionSettings extends Document {
  userId: mongoose.Types.ObjectId;
  wallpaper: string;
  alarmTone: string;
  fontType: string;
  activePomodoroTemplateId: mongoose.Types.ObjectId;
  pomodoroTemplates: mongoose.Types.ObjectId[];
}

const PomodoroSettingsSchema: Schema<IPomodoroSessionSettings> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    wallpaper: {
      type: String,
      // required: true,
      // TODO: Add default ideos wallpaper
    },
    alarmTone: {
      type: String,
      // required: true,
      // TODO: Add default alarm tone
    },
    fontType: {
      type: String,
      // required: true,
      default: "Arial",
    },
    activePomodoroTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pomodoroTemplates",
      required: true,
    },
    pomodoroTemplates: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "pomodoroTemplates",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const pomodoroSettingsModel = model<IPomodoroSessionSettings>(
  "pomodoroSettings",
  PomodoroSettingsSchema
);
