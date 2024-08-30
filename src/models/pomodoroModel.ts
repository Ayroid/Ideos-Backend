import mongoose, { Document,model,Schema } from "mongoose";

export interface IPomodoroSession extends Document {
  userId: mongoose.Types.ObjectId;
  totalTime : number;
  startTime : Date;
  endTime : Date;
  sessionTypeId : mongoose.Types.ObjectId;
  sessionCount : number;
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
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    sessionTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pomodoroSessionTypes",
        required: true,
    },
    sessionCount: {
        type: Number,
        required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const pomodoroSessionModel = model<IPomodoroSession>("pomodoroSessions", PomodoroSessionSchema);