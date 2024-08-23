import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, printf, errors } = format;

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const developmentLogger = () => {
  return createLogger({
    level: "debug",
    format: combine(
      errors({ stack: true }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      myFormat
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: "logs/development/error.log",
        level: "error",
      }),
      new transports.File({
        filename: "logs/development/warn.log",
        level: "warn",
      }),
      new transports.File({
        filename: "logs/development/info.log",
      }),
    ],
  });
};

const productionLogger = () => {
  return createLogger({
    level: "info",
    format: combine(
      errors({ stack: true }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.json()
    ),
    transports: [
      new transports.Console(),
      new transports.DailyRotateFile({
        filename: "logs/production/error.log",
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxFiles: "30d",
        zippedArchive: true,
      }),
      new transports.DailyRotateFile({
        filename: "logs/production/combined.log",
        datePattern: "YYYY-MM-DD",
        maxFiles: "30d",
        zippedArchive: true,
      }),
    ],
    exceptionHandlers: [
      new transports.File({
        filename: "logs/production/exceptions.log",
      }),
    ],
    rejectionHandlers: [
      new transports.File({
        filename: "logs/production/rejections.log",
      }),
    ],
  });
};

const env = process.env.NODE_ENV ?? "development";
const logger = env === "development" ? developmentLogger() : productionLogger();

export default logger;
