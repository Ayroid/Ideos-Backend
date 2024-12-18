import mongoose, { Document, model, Schema } from "mongoose";

export interface IPomodoroTemplates extends Document {
 userId: mongoose.Types.ObjectId;
 workspaceId: mongoose.Types.ObjectId;
 pomodoroSettingsId: mongoose.Types.ObjectId;
 templateName: string;
 pomodoroDuration: number;
 shortBreakDuration: number;
 longBreakDuration: number;
 sessionsBeforeLongBreak: number;
}

const PomodoroTemplatesSchema: Schema<IPomodoroTemplates> = new Schema(
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
   pomodoroSettingsId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "pomodoroSettings",
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
   sessionsBeforeLongBreak: {
     type: Number,
     required: true,
   },
 },
 {
   timestamps: true,
 }
);

PomodoroTemplatesSchema.index({ userId: 1, workspaceId: 1 });
PomodoroTemplatesSchema.index({ workspaceId: 1, pomodoroSettingsId: 1 });

export const pomodoroTemplatesModel = model<IPomodoroTemplates>(
 "pomodorotemplates",
 PomodoroTemplatesSchema
);