import mongoose, { Document, model, Schema } from "mongoose";

export interface IPomodoroSessionSettings extends Document {
  userId: mongoose.Types.ObjectId;
  wallpaper: string;
  alarmTone: string;
  fontType: string;
  activePomodoroTemplateId: mongoose.Types.ObjectId;
  userPomodoroTemplateIds: mongoose.Types.ObjectId[];
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
      // TODO: Add default ideos wallpaper
    },
    alarmTone: {
      type: String,
      // TODO: Add default alarm tone
    },
    fontType: {
      type: String,
      default: "Arial",
    },
    activePomodoroTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pomodorotemplates",
      default: null,
    },
    userPomodoroTemplateIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "pomodorotemplates",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const pomodoroSettingsModel = model<IPomodoroSessionSettings>(
  "pomodorosettings",
  PomodoroSettingsSchema
);
