export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export class Logger {
  private static currentLevel: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel) {
    this.currentLevel = level;
  }

  static debug(message: string, ...args: any[]) {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.debug(message, ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    if (this.currentLevel <= LogLevel.INFO) {
      console.info(message, ...args);
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.currentLevel <= LogLevel.WARN) {
      console.warn(message, ...args);
    }
  }

  static error(message: string, ...args: any[]) {
    if (this.currentLevel <= LogLevel.ERROR) {
      console.error(message, ...args);
    }
  }
}
