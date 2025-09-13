// src/lib/client-logger.ts

const clientLogger = {
  info: (message: string, ...args: any[]) => {
    console.log(message, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(message, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },
};

export default clientLogger;
