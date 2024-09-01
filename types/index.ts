import { Request } from "express";

interface UserInfo {
  id: string;
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
  updated_at: number;
  family_name: string;
  email_verified: boolean;
  preferred_username: string | null;
}

interface AuthenticatedRequest extends Request {
  user?: UserInfo;
}

type PomodoroData = {
  templateName: string;
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
};

export { AuthenticatedRequest, PomodoroData };
