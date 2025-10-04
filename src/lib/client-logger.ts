// src/lib/client-logger.ts

const clientLogger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(message, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },
};

export default clientLogger;
