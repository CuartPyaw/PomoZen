/**
 * 设置管理 Hook
 *
 * 管理应用的用户设置，包括时间设置、自动切换等
 * @module hooks/useSettings
 */

import { useState, useCallback, useEffect } from 'react';
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
  DEBUG_MODE_ENABLED: 'tomato-debugModeEnabled',
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
  DEBUG_MODE_ENABLED: false,
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

  // 调试模式开关
  const [debugModeEnabled, setDebugModeEnabled] = useState(() =>
    loadBooleanSetting(STORAGE_KEYS.DEBUG_MODE_ENABLED, DEFAULTS.DEBUG_MODE_ENABLED)
  );

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

  // 临时状态（用于未保存的修改）
  const [tempSettings, setTempSettings] = useState({
    customFocusTime: customFocusTime,
    customBreakTime: customBreakTime,
    customLongBreakTime: customLongBreakTime,
    autoSwitch: autoSwitch,
    autoStart: autoStart,
    soundEnabled: soundEnabled,
    autoSkipNotification: autoSkipNotification,
  });

  // 是否有未保存的修改
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 同步临时状态
  useEffect(() => {
    setTempSettings({
      customFocusTime,
      customBreakTime,
      customLongBreakTime,
      autoSwitch,
      autoStart,
      soundEnabled,
      autoSkipNotification,
    });
  }, [customFocusTime, customBreakTime, customLongBreakTime, autoSwitch, autoStart, soundEnabled, autoSkipNotification]);

  /**
   * 处理时间设置变化（只更新临时状态）
   * @param timeType 时间类型
   * @param minutes 新的时间（分钟）
   */
  const handleTimeChange = useCallback((timeType: 'focus' | 'break' | 'longBreak', minutes: number) => {
    const newTime = Math.max(1, Math.min(120, minutes)) * 60;

    const keyMap = {
      focus: 'customFocusTime' as const,
      break: 'customBreakTime' as const,
      longBreak: 'customLongBreakTime' as const,
    };

    setTempSettings(prev => ({ ...prev, [keyMap[timeType]]: newTime }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * 清除数据（只清除统计和历史，保留设置）
   */
  const handleClearData = useCallback(() => {
    if (window.confirm('确定要清除所有数据吗？这将删除统计记录和历史数据，但保留设置。')) {
      try {
        // 只清除数据相关的键，保留设置
        const dataKeys = [
          'tomato-statistics',
          'tomato-dailyRecords',
          'tomato-hourlyData',
        ];
        dataKeys.forEach(key => {
          StorageManager.remove(key);
        });
        Logger.info('Data cleared successfully');
        // 重新加载页面以重新初始化统计
        window.location.reload();
      } catch (error) {
        Logger.error('Failed to clear data', error);
      }
    }
  }, []);

  /**
   * 保存设置到 localStorage
   */
  const handleSaveSettings = useCallback(() => {
    try {
      StorageManager.set(STORAGE_KEYS.CUSTOM_FOCUS_TIME, tempSettings.customFocusTime);
      StorageManager.set(STORAGE_KEYS.CUSTOM_BREAK_TIME, tempSettings.customBreakTime);
      StorageManager.set(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME, tempSettings.customLongBreakTime);
      StorageManager.set(STORAGE_KEYS.AUTO_SWITCH, tempSettings.autoSwitch);
      StorageManager.set(STORAGE_KEYS.AUTO_START, tempSettings.autoStart);
      StorageManager.set(STORAGE_KEYS.SOUND_ENABLED, tempSettings.soundEnabled);
      StorageManager.set(STORAGE_KEYS.AUTO_SKIP_NOTIFICATION, tempSettings.autoSkipNotification);
      StorageManager.set(STORAGE_KEYS.DEBUG_MODE_ENABLED, debugModeEnabled);

      // 更新实际状态
      setCustomFocusTime(tempSettings.customFocusTime);
      setCustomBreakTime(tempSettings.customBreakTime);
      setCustomLongBreakTime(tempSettings.customLongBreakTime);
      setAutoSwitch(tempSettings.autoSwitch);
      setAutoStart(tempSettings.autoStart);
      setSoundEnabled(tempSettings.soundEnabled);
      setAutoSkipNotification(tempSettings.autoSkipNotification);

      setHasUnsavedChanges(false);
      Logger.info('Settings saved successfully');
    } catch (error) {
      Logger.error('Failed to save settings', error);
    }
  }, [tempSettings, debugModeEnabled]);

  /**
   * 重置设置为默认值
   */
  const handleResetSettings = useCallback(() => {
    if (window.confirm('确定要重置所有设置为默认值吗？此操作不会清除统计数据。')) {
      setTempSettings({
        customFocusTime: DEFAULTS.FOCUS_TIME,
        customBreakTime: DEFAULTS.BREAK_TIME,
        customLongBreakTime: DEFAULTS.LONG_BREAK_TIME,
        autoSwitch: DEFAULTS.AUTO_SWITCH,
        autoStart: DEFAULTS.AUTO_START,
        soundEnabled: DEFAULTS.SOUND_ENABLED,
        autoSkipNotification: DEFAULTS.AUTO_SKIP_NOTIFICATION,
      });
      setHasUnsavedChanges(true);
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

  /**
   * 切换调试模式
   */
  const toggleDebugMode = useCallback((value: boolean) => {
    setDebugModeEnabled(value);
    try {
      StorageManager.set(STORAGE_KEYS.DEBUG_MODE_ENABLED, value);
    } catch (error) {
      Logger.error('Failed to save debugModeEnabled setting', error);
    }
  }, []);

  /**
   * 更新临时设置的开关值
   */
  const updateTempSwitch = useCallback((key: keyof typeof tempSettings, value: boolean) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
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
    debugModeEnabled,
    tempSettings,
    hasUnsavedChanges,
    // 方法
    handleTimeChange,
    handleClearData,
    handleSaveSettings,
    handleResetSettings,
    toggleAutoSwitch,
    toggleAutoStart,
    toggleSoundEnabled,
    toggleAutoSkipNotification,
    toggleDebugMode,
    updateTempSwitch,
    setDebugModeEnabled,
  };
}
