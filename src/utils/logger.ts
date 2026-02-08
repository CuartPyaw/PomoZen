/**
 * PomoZen 日志工具
 *
 * 提供统一的日志记录接口，支持日志级别控制
 * @module utils/logger
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/** 当前日志级别 */
let currentLevel = LogLevel.DEBUG;

/**
 * Logger 工具对象
 *
 * 提供不同级别的日志方法，根据当前日志级别过滤输出
 */
export const Logger = {
  /**
   * 设置日志级别
   * @param level 目标日志级别
   */
  setLevel(level: LogLevel): void {
    currentLevel = level;
  },

  /**
   * 记录调试级别日志
   * @param message 日志消息
   * @param data 附加数据
   */
  debug(message: string, data?: unknown): void {
    if (currentLevel <= LogLevel.DEBUG) {
      console.log(`[PomoZen] ${message}`, data ?? '');
    }
  },

  /**
   * 记录信息级别日志
   * @param message 日志消息
   * @param data 附加数据
   */
  info(message: string, data?: unknown): void {
    if (currentLevel <= LogLevel.INFO) {
      console.info(`[PomoZen] ${message}`, data ?? '');
    }
  },

  /**
   * 记录警告级别日志
   * @param message 日志消息
   * @param data 附加数据
   */
  warn(message: string, data?: unknown): void {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(`[PomoZen] ${message}`, data ?? '');
    }
  },

  /**
   * 记录错误级别日志
   * @param message 日志消息
   * @param error 错误对象或数据
   */
  error(message: string, error?: Error | unknown): void {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(`[PomoZen Error] ${message}`, error);
    }
  },
};
