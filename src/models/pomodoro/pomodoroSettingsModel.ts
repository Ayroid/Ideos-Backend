import mongoose, { Document, model, Schema } from "mongoose";

export interface IPomodoroSessionSettings extends Document {
  userId: mongoose.Types.ObjectId;
  wallpaper: string;
  alarmTone: string;
  fontType: string;
  pomodoroSessionTypes: mongoose.Types.ObjectId[];
}

const PomodoroSessionSettingsSchema: Schema<IPomodoroSessionSettings> =
  new Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      wallpaper: {
        type: String,
        required: true,
        // TODO: Add default ideos wallpaper
      },
      alarmTone: {
        type: String,
        required: true,
        // TODO: Add default alarm tone
      },
      fontType: {
        type: String,
        required: true,
        default: "Arial",
      },
      pomodoroSessionTypes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "pomodoroSessionTypes",
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

export const pomodoroSessionSettingsModel = model<IPomodoroSessionSettings>(
  "pomodoroSessionSettings",
  PomodoroSessionSettingsSchema
);
