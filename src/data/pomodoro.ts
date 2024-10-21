import type { PomodoroData } from "../../types";

const pomodoroData: PomodoroData[] = [
  {
    templateName: "Default",
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  },
  {
    templateName: "Power Focus",
    pomodoroDuration: 90,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    sessionsBeforeLongBreak: 4,
  },
  {
    templateName: "Creative Sprint",
    pomodoroDuration: 30,
    shortBreakDuration: 5,
    longBreakDuration: 20,
    sessionsBeforeLongBreak: 4,
  },
];

export { pomodoroData };
