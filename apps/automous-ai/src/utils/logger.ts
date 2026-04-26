import winston from 'winston';
import { env } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const { combine, timestamp, json, colorize, simple } = winston.format;

const consoleTransport = new winston.transports.Console({
  format:
    env.NODE_ENV === 'production'
      ? combine(timestamp(), json())
      : combine(colorize(), simple()),
});

const fileTransport = new winston.transports.File({
  filename: env.LOG_FILE_PATH,
  maxsize: env.LOG_MAX_SIZE,
  maxFiles: env.LOG_MAX_FILES,
  format: combine(timestamp(), json()),
  tailable: true,
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'codekang' },
  transports: [consoleTransport, fileTransport],
});
