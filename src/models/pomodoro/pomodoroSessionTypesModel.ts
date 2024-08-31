import mongoose, { Document, model,Schema } from "mongoose";

export interface IPomodoroSessionTypes extends Document {
    userId: mongoose.Types.ObjectId;
    sessionName : string;
    pomodoroDuration : number;
    shortBreakDuration : number;
    longBreakDuration : number;
    }

    const PomodoroSessionTypesSchema: Schema<IPomodoroSessionTypes> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        sessionName: {
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

export const pomodoroSessionTypesModel = model<IPomodoroSessionTypes>("pomodoroSessionTypes", PomodoroSessionTypesSchema);