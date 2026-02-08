/**
 * 主题管理 Hook
 *
 * 管理应用的主题模式（浅色/深色/跟随系统）
 * @module hooks/useTheme
 */

import { useState, useEffect } from 'react';
import { createZenTheme, type ThemeMode } from '../theme';
import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';

/** 主题模式偏好类型 */
export type ThemeModePreference = 'light' | 'dark' | 'system';

/** 主题存储键 */
const THEME_MODE_KEY = 'tomato-theme-mode';

/**
 * 获取系统主题偏好
 * @returns 系统主题模式
 */
function getSystemTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 主题管理 Hook
 *
 * 提供主题模式的管理功能，包括：
 * - 跟随系统设置自动切换
 * - 手动选择浅色/深色模式
 * - 持久化用户偏好
 *
 * @returns 主题管理状态和方法
 */
export function useTheme() {
  /**
   * 主题模式偏好（用户选择）
   */
  const [themePreference, setThemePreference] = useState<ThemeModePreference>(() => {
    const saved = StorageManager.get<ThemeModePreference>(THEME_MODE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'system';
  });

  /**
   * 实际应用的主题模式
   */
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = StorageManager.get<ThemeModePreference>(THEME_MODE_KEY);
    if (saved === 'light') return 'light';
    if (saved === 'dark') return 'dark';
    return getSystemTheme();
  });

  /**
   * 同步主题模式到根元素和 localStorage
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    try {
      StorageManager.set(THEME_MODE_KEY, themePreference);
    } catch (error) {
      Logger.error('Failed to save theme mode', error);
    }
  }, [themeMode, themePreference]);

  /**
   * 处理主题偏好变化
   */
  useEffect(() => {
    if (themePreference === 'system') {
      setThemeMode(getSystemTheme());
    } else {
      setThemeMode(themePreference);
    }
  }, [themePreference]);

  /**
   * 监听系统主题变化
   * 当用户选择「跟随系统」时，自动切换主题
   */
  useEffect(() => {
    if (themePreference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeMode(e.matches ? 'dark' : 'light');
    };

    // 立即设置当前系统主题
    setThemeMode(getSystemTheme());

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  /**
   * 创建禅意主题对象
   */
  const theme = createZenTheme(themeMode);

  return {
    theme,
    themeMode,
    themePreference,
    setThemePreference,
  };
}
