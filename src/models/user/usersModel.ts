import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  authId: string;
  email: string;
  fullname?: string;
  picture?: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  pomodoroSettingsId: mongoose.Types.ObjectId;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    authId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
    },
    picture: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const usersModel = mongoose.model<IUser>("users", UserSchema);
