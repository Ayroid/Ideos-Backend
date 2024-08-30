import mongoose, { Document, model,Schema } from "mongoose";

export interface IPomodoroSessionSettings extends Document {
    userId: mongoose.Types.ObjectId;
    wallpaper : URL;
    alarmTone : URL;
    fontType : string;
    pomodoroSessionTypes : mongoose.Types.ObjectId[];
    }

    const PomodoroSessionSettingsSchema: Schema<IPomodoroSessionSettings> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        wallpaper: {
            type: URL,
            required: true,
        },
        alarmTone: {
            type: URL,
            required: true,
        },
        fontType: {
            type: String,
            required: true,
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

export const pomodoroSessionSettingsModel = model<IPomodoroSessionSettings>("pomodoroSessionSettings", PomodoroSessionSettingsSchema);