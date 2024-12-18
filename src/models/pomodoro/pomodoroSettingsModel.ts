import mongoose, { Document, model, Schema } from "mongoose";

export interface IPomodoroSessionSettings extends Document {
 userId: mongoose.Types.ObjectId;
 workspaceId: mongoose.Types.ObjectId;
 wallpaper: string;
 alarmTone: string;
 fontType: string;
 activePomodoroTemplateId: mongoose.Types.ObjectId;
 userPomodoroTemplateIds: mongoose.Types.ObjectId[];
 activePomodoroTheme: string;
}

const PomodoroSettingsSchema: Schema<IPomodoroSessionSettings> = new Schema(
 {
   userId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "users",
     required: true,
   },
   workspaceId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "workspaces",
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
   activePomodoroTheme: {
     type: String,
     default: "/pomodoro/japanese-preview.jpg",
   },
 },
 {
   timestamps: true,
 }
);

PomodoroSettingsSchema.index({ userId: 1, workspaceId: 1 });

export const pomodoroSettingsModel = model<IPomodoroSessionSettings>(
 "pomodorosettings",
 PomodoroSettingsSchema
);