import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info", // Change to 'debug' for verbose logging
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ level, message, timestamp, ...meta }) => {
      const msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
      return `${timestamp} [${level.toUpperCase()}]: ${msg} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
