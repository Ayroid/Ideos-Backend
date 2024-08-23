import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf } = format;
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  });
const developmentLogger = () =>{
    return createLogger({
        level: 'debug',
        format: combine(
            format.colorize(),timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            myFormat
          ),
        //defaultMeta: { service: 'user-service' },
        transports: [
          new transports.Console(),
          new transports.File({ filename: 'error.log', level: 'error' }),
        ],
      });
}
const productionLogger = () =>{
  return createLogger({
      level: 'debug',
      format: combine(
          format.colorize(),timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          myFormat
        ),
      //defaultMeta: { service: 'user-service' },
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
      ],
    });
}
export {developmentLogger, productionLogger};