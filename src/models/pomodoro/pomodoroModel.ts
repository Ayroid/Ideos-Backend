import mongoose, { Document, model, Schema } from "mongoose";

export interface IPomodoroSession extends Document {
  userId: mongoose.Types.ObjectId;
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

export const pomodoroSessionModel = model<IPomodoroSession>(
  "pomodorosessions",
  PomodoroSessionSchema
);
