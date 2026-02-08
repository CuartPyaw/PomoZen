/**
 * PomoZen 存储工具
 *
 * 封装 localStorage 操作，提供统一的接口和错误处理
 * @module utils/storage
 */

import { Logger } from './logger';
import { StorageError } from '../types/errors';

export const StorageManager = {
  /**
   * 保存数据到 localStorage
   * @param key 存储键名
   * @param value 要存储的值
   * @throws {StorageError} 当存储失败时抛出
   */
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      Logger.debug(`Storage saved: ${key}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error(`Storage save failed: ${key}`, err);

      // 检查是否为配额错误
      if (err.name === 'QuotaExceededError') {
        throw new StorageError('write', key, err);
      }
      throw err;
    }
  },

  /**
   * 从 localStorage 读取数据
   * @param key 存储键名
   * @param defaultValue 默认值（当读取失败或不存在时返回）
   * @returns 存储的值或默认值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error(`Storage read failed: ${key}`, err);
      return defaultValue;
    }
  },

  /**
   * 删除 localStorage 中的数据
   * @param key 存储键名
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
      Logger.debug(`Storage removed: ${key}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error(`Storage remove failed: ${key}`, err);
    }
  },

  /**
   * 清空所有指定前缀的数据
   * @param prefix 键名前缀
   */
  clear(prefix: string): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      Logger.info(`Cleared ${keysToRemove.length} items with prefix: ${prefix}`);
    } catch (error) {
      Logger.error(`Storage clear failed for prefix: ${prefix}`, error);
    }
  },

  /**
   * 检查键是否存在
   * @param key 存储键名
   * @returns 是否存在
   */
  has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      Logger.error(`Storage check failed for key: ${key}`, error);
      return false;
    }
  },
};
