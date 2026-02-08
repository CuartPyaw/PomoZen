/**
 * 设置管理 Hook
 *
 * 管理应用的用户设置，包括时间设置、自动切换等
 * @module hooks/useSettings
 */

import { useState, useCallback } from 'react';
import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';

// 存储键配置
const STORAGE_KEYS = {
  AUTO_SWITCH: 'tomato-autoSwitch',
  AUTO_START: 'tomato-autoStart',
  CUSTOM_FOCUS_TIME: 'tomato-customFocusTime',
  CUSTOM_BREAK_TIME: 'tomato-customBreakTime',
  CUSTOM_LONG_BREAK_TIME: 'tomato-customLongBreakTime',
  SOUND_ENABLED: 'tomato-soundEnabled',
  AUTO_SKIP_NOTIFICATION: 'tomato-autoSkipNotification',
} as const;

// 默认值配置
const DEFAULTS = {
  FOCUS_TIME: 25 * 60,
  BREAK_TIME: 5 * 60,
  LONG_BREAK_TIME: 30 * 60,
  AUTO_SWITCH: true,
  AUTO_START: true,
  SOUND_ENABLED: true,
  AUTO_SKIP_NOTIFICATION: false,
} as const;

/**
 * 从 localStorage 加载布尔值设置
 */
function loadBooleanSetting(key: string, defaultValue: boolean): boolean {
  const saved = StorageManager.get<string>(key);
  return saved ? saved === 'true' : defaultValue;
}

/**
 * 从 localStorage 加载时间设置（秒）
 */
function loadTimeSetting(key: string, defaultValue: number): number {
  const saved = StorageManager.get<string>(key);
  if (saved !== undefined && saved !== null) {
    const time = parseInt(saved, 10);
    if (!isNaN(time) && time >= 60 && time <= 7200) {
      return time;
    }
  }
  return defaultValue;
}

/**
 * 设置管理 Hook
 *
 * 提供用户设置的管理功能，包括：
 * - 时间设置（专注/休息时长）
 * - 自动切换设置
 * - 通知设置
 * - 数据清除
 *
 * @returns 设置状态和方法
 */
export function useSettings() {
  // 设置面板显示状态
  const [showSettings, setShowSettings] = useState(false);

  // 自动切换模式开关
  const [autoSwitch, setAutoSwitch] = useState(() =>
    loadBooleanSetting(STORAGE_KEYS.AUTO_SWITCH, DEFAULTS.AUTO_SWITCH)
  );

  // 自动开始计时开关
  const [autoStart, setAutoStart] = useState(() =>
    loadBooleanSetting(STORAGE_KEYS.AUTO_START, DEFAULTS.AUTO_START)
  );

  // 通知声音开关
  const [soundEnabled, setSoundEnabled] = useState(() =>
    loadBooleanSetting(STORAGE_KEYS.SOUND_ENABLED, DEFAULTS.SOUND_ENABLED)
  );

  // 自动跳过通知开关
  const [autoSkipNotification, setAutoSkipNotification] = useState(() =>
    loadBooleanSetting(STORAGE_KEYS.AUTO_SKIP_NOTIFICATION, DEFAULTS.AUTO_SKIP_NOTIFICATION)
  );

  // 自定义专注时长（秒）
  const [customFocusTime, setCustomFocusTime] = useState(() =>
    loadTimeSetting(STORAGE_KEYS.CUSTOM_FOCUS_TIME, DEFAULTS.FOCUS_TIME)
  );

  // 自定义短休息时长（秒）
  const [customBreakTime, setCustomBreakTime] = useState(() =>
    loadTimeSetting(STORAGE_KEYS.CUSTOM_BREAK_TIME, DEFAULTS.BREAK_TIME)
  );

  // 自定义长休息时长（秒）
  const [customLongBreakTime, setCustomLongBreakTime] = useState(() =>
    loadTimeSetting(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME, DEFAULTS.LONG_BREAK_TIME)
  );

  /**
   * 处理时间设置变化
   * @param timeType 时间类型
   * @param minutes 新的时间（分钟）
   */
  const handleTimeChange = useCallback((timeType: 'focus' | 'break' | 'longBreak', minutes: number) => {
    const newTime = Math.max(1, Math.min(120, minutes)) * 60;

    const setterMap = {
      focus: setCustomFocusTime,
      break: setCustomBreakTime,
      longBreak: setCustomLongBreakTime,
    };
    const keyMap = {
      focus: STORAGE_KEYS.CUSTOM_FOCUS_TIME,
      break: STORAGE_KEYS.CUSTOM_BREAK_TIME,
      longBreak: STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME,
    };

    setterMap[timeType](newTime);

    try {
      StorageManager.set(keyMap[timeType], newTime);
      Logger.debug(`Time setting updated: ${timeType} = ${newTime}s`);
    } catch (error) {
      Logger.error(`Failed to save time setting: ${timeType}`, error);
    }
  }, []);

  /**
   * 清除所有缓存
   */
  const handleClearCache = useCallback(() => {
    if (window.confirm('确定要清除所有缓存吗？这将删除所有设置和数据，此操作不可撤销。')) {
      try {
        StorageManager.clear('tomato-');
        Logger.info('All cache cleared successfully');

        // 重置所有状态为默认值
        setCustomFocusTime(DEFAULTS.FOCUS_TIME);
        setCustomBreakTime(DEFAULTS.BREAK_TIME);
        setCustomLongBreakTime(DEFAULTS.LONG_BREAK_TIME);
        setAutoSwitch(DEFAULTS.AUTO_SWITCH);
        setAutoStart(DEFAULTS.AUTO_START);
        setSoundEnabled(DEFAULTS.SOUND_ENABLED);
        setAutoSkipNotification(DEFAULTS.AUTO_SKIP_NOTIFICATION);
      } catch (error) {
        Logger.error('Failed to clear cache', error);
      }
    }
  }, []);

  /**
   * 切换自动切换设置
   */
  const toggleAutoSwitch = useCallback((value: boolean) => {
    setAutoSwitch(value);
    try {
      StorageManager.set(STORAGE_KEYS.AUTO_SWITCH, value);
    } catch (error) {
      Logger.error('Failed to save autoSwitch setting', error);
    }
  }, []);

  /**
   * 切换自动开始设置
   */
  const toggleAutoStart = useCallback((value: boolean) => {
    setAutoStart(value);
    try {
      StorageManager.set(STORAGE_KEYS.AUTO_START, value);
    } catch (error) {
      Logger.error('Failed to save autoStart setting', error);
    }
  }, []);

  /**
   * 切换声音设置
   */
  const toggleSoundEnabled = useCallback((value: boolean) => {
    setSoundEnabled(value);
    try {
      StorageManager.set(STORAGE_KEYS.SOUND_ENABLED, value);
    } catch (error) {
      Logger.error('Failed to save soundEnabled setting', error);
    }
  }, []);

  /**
   * 切换自动跳过通知设置
   */
  const toggleAutoSkipNotification = useCallback((value: boolean) => {
    setAutoSkipNotification(value);
    try {
      StorageManager.set(STORAGE_KEYS.AUTO_SKIP_NOTIFICATION, value);
    } catch (error) {
      Logger.error('Failed to save autoSkipNotification setting', error);
    }
  }, []);

  return {
    // 状态
    showSettings,
    setShowSettings,
    autoSwitch,
    autoStart,
    soundEnabled,
    autoSkipNotification,
    customFocusTime,
    customBreakTime,
    customLongBreakTime,
    // 方法
    handleTimeChange,
    handleClearCache,
    toggleAutoSwitch,
    toggleAutoStart,
    toggleSoundEnabled,
    toggleAutoSkipNotification,
  };
}
