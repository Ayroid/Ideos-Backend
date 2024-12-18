import mongoose, { Document, model, Schema } from "mongoose";

export interface IPomodoroSession extends Document {
 userId: mongoose.Types.ObjectId;
 workspaceId: mongoose.Types.ObjectId;
 totalTime: number;
 startTime: Date;
 endTime: Date;
 sessionTypeId: mongoose.Types.ObjectId;
 sessionCount: number;
}

const PomodoroSessionSchema: Schema<IPomodoroSession> = new Schema(
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
   totalTime: {
     type: Number,
     default: 0,
   },
   startTime: {
     type: Date,
     required: true,
     default: Date.now(),
   },
   endTime: {
     type: Date,
   },
   sessionTypeId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "pomodorotemplates",
     required: true,
   },
   sessionCount: {
     type: Number,
     default: 0,
   },
 },
 {
   timestamps: true,
 }
);

PomodoroSessionSchema.index({ userId: 1, workspaceId: 1 });
PomodoroSessionSchema.index({ workspaceId: 1, sessionTypeId: 1 });

export const pomodoroSessionModel = model<IPomodoroSession>(
 "pomodorosessions",
 PomodoroSessionSchema
);