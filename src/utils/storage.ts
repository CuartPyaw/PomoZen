/**
 * PomoZen 存储工具
 *
 * 封装 chrome.storage 操作，支持 Chrome 插件环境
 * 提供同步风格 API，内部处理异步
 * @module utils/storage
 */

import { Logger } from './logger';
import { StorageError } from '../types/errors';

// 检查是否在 Chrome 扩展环境中
const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage && (chrome.storage.sync || chrome.storage.local);

// 内存缓存，用于同步 API
const memoryCache = new Map<string, unknown>();

/**
 * Chrome Storage 异步操作包装
 */
const ChromeStorage = {
  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          memoryCache.set(key, value); // 更新缓存
          Logger.debug(`Chrome storage saved: ${key}`);
          resolve();
        }
      });
    });
  },

  async get<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
      // 先检查内存缓存
      if (memoryCache.has(key)) {
        resolve(memoryCache.get(key) as T);
        return;
      }

      chrome.storage.sync.get(key, (result) => {
        if (chrome.runtime.lastError) {
          Logger.error(`Chrome storage read failed: ${key}`, new Error(chrome.runtime.lastError.message));
          resolve(undefined);
        } else {
          const value = result[key];
          if (value !== undefined) {
            memoryCache.set(key, value);
          }
          resolve(value as T);
        }
      });
    });
  },

  async getAll(): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        if (chrome.runtime.lastError) {
          resolve({});
        } else {
          // 更新内存缓存
          Object.entries(result).forEach(([k, v]) => memoryCache.set(k, v));
          resolve(result);
        }
      });
    });
  },

  async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          memoryCache.delete(key);
          Logger.debug(`Chrome storage removed: ${key}`);
          resolve();
        }
      });
    });
  },

  async clear(prefix: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          const keysToRemove = Object.keys(result).filter(k => k.startsWith(prefix));
          chrome.storage.sync.remove(keysToRemove, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              keysToRemove.forEach(k => memoryCache.delete(k));
              Logger.info(`Cleared ${keysToRemove.length} items with prefix: ${prefix}`);
              resolve();
            }
          });
        }
      });
    });
  },
};

/**
 * LocalStorage 同步操作（回退方案）
 */
const LocalStorageManager = {
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      Logger.debug(`Storage saved: ${key}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error(`Storage save failed: ${key}`, err);
      if (err.name === 'QuotaExceededError') {
        throw new StorageError('write', key, err);
      }
      throw err;
    }
  },

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

  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const item = localStorage.getItem(key);
          if (item !== null) {
            result[key] = JSON.parse(item);
          }
        }
      }
    } catch (error) {
      Logger.error('LocalStorage getAll failed', error);
    }
    return result;
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
      Logger.debug(`Storage removed: ${key}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error(`Storage remove failed: ${key}`, err);
    }
  },

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
};

// 统一的 StorageManager 接口 - 提供同步风格 API
export const StorageManager = {
  /**
   * 保存数据（同步风格，内部异步处理）
   */
  set<T>(key: string, value: T): void {
    if (isChromeExtension) {
      // 同步更新缓存，异步保存
      memoryCache.set(key, value);
      ChromeStorage.set(key, value).catch(err => Logger.error('Storage set failed', err));
    } else {
      LocalStorageManager.set(key, value);
    }
  },

  /**
   * 从存储读取数据（同步风格）
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    if (isChromeExtension) {
      // 从内存缓存读取（同步）
      if (memoryCache.has(key)) {
        return memoryCache.get(key) as T;
      }
      // 异步加载后返回默认值（首次加载时）
      ChromeStorage.get(key).then(value => {
        if (value !== undefined) {
          memoryCache.set(key, value);
        }
      }).catch(err => Logger.error('Storage get failed', err));
      return defaultValue;
    }
    return LocalStorageManager.get(key, defaultValue);
  },

  /**
   * 从存储读取数据（异步版本）
   */
  async getAsync<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    if (isChromeExtension) {
      return ChromeStorage.get<T>(key) ?? defaultValue;
    }
    return LocalStorageManager.get<T>(key, defaultValue);
  },

  /**
   * 异步保存所有数据
   */
  async setAsync<T>(key: string, value: T): Promise<void> {
    if (isChromeExtension) {
      return ChromeStorage.set(key, value);
    }
    LocalStorageManager.set(key, value);
  },

  /**
   * 删除存储中的数据
   */
  remove(key: string): void {
    if (isChromeExtension) {
      memoryCache.delete(key);
      ChromeStorage.remove(key).catch(err => Logger.error('Storage remove failed', err));
    } else {
      LocalStorageManager.remove(key);
    }
  },

  /**
   * 清空所有指定前缀的数据
   */
  clear(prefix: string): void {
    if (isChromeExtension) {
      // 清理缓存
      Array.from(memoryCache.keys())
        .filter(k => k.startsWith(prefix))
        .forEach(k => memoryCache.delete(k));
      ChromeStorage.clear(prefix).catch(err => Logger.error('Storage clear failed', err));
    } else {
      LocalStorageManager.clear(prefix);
    }
  },

  /**
   * 初始化内存缓存（Chrome 扩展环境）
   */
  async initCache(): Promise<void> {
    if (isChromeExtension) {
      const data = await ChromeStorage.getAll();
      Logger.info('Storage cache initialized', { keys: Object.keys(data).length });
    }
  },
};

// 同步版本（用于非 Chrome 扩展环境）
export const SyncStorageManager = LocalStorageManager;