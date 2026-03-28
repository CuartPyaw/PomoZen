/**
 * 计时器核心逻辑 Hook
 *
 * 管理番茄钟计时器的核心逻辑
 * 使用 chrome.alarms 进行后台计时，通过消息传递与 background script 通信
 * @module hooks/useTimer
 */

import { useState, useCallback, useEffect } from 'react';
import type { TimerMode } from '../types/worker';
import { Logger } from '../utils/logger';

// 常量配置
const POMODORO_CYCLE_COUNT = 4;
const MODE_SWITCH_DELAY = 2000;

// 通信函数 - 与 background script 通信
const sendMessage = (message: { type: string; data?: unknown }): Promise<{ success: boolean; state?: TimerState; settings?: Settings }> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: unknown) => {
      resolve(response as { success: boolean; state?: TimerState; settings?: Settings });
    });
  });
};

interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  pomodoroCycle: number;
}

interface Settings {
  customFocusTime: number;
  customBreakTime: number;
  customLongBreakTime: number;
  autoSwitch: boolean;
  autoStart: boolean;
  soundEnabled: boolean;
  autoSkipNotification: boolean;
}

/**
 * 计时器核心逻辑 Hook
 *
 * 提供计时器的管理功能，包括：
 * - 三种模式的切换（专注/短休息/长休息）
 * - 计时器启动/暂停/重置/跳过
 * - 番茄钟周期管理
 * - 自动切换模式
 *
 * @returns 计时器状态和方法
 */
export function useTimer(
  settings: {
    autoSwitch: boolean;
    autoStart: boolean;
    customFocusTime: number;
    customBreakTime: number;
    customLongBreakTime: number;
  },
  onComplete: (mode: TimerMode, completedDuration: number) => void
) {
  // 当前计时器模式
  const [mode, setMode] = useState<TimerMode>('focus');

  // 番茄钟周期计数（0-4）
  const [pomodoroCycle, setPomodoroCycle] = useState(0);

  // 计时器完成保护标志
  const [completionGuard, setCompletionGuard] = useState(false);

  // 每个模式的剩余时间记录
  const [timeLeftForMode, setTimeLeftForMode] = useState<Record<TimerMode, number>>({
    focus: settings.customFocusTime,
    break: settings.customBreakTime,
    longBreak: settings.customLongBreakTime,
  });

  // 每个模式的运行状态
  const [isRunningForMode, setIsRunningForMode] = useState<Record<TimerMode, boolean>>({
    focus: false,
    break: false,
    longBreak: false,
  });

  // 加载初始状态
  useEffect(() => {
    const loadState = async () => {
      try {
        const response = await sendMessage({ type: 'GET_STATE' }) as { success: boolean; state?: TimerState };
        if (response.success && response.state) {
          setMode(response.state.mode);
          setTimeLeftForMode(prev => ({
            ...prev,
            [response.state!.mode]: response.state!.timeLeft,
          }));
          setIsRunningForMode(prev => ({
            ...prev,
            [response.state!.mode]: response.state!.isRunning,
          }));
          setPomodoroCycle(response.state.pomodoroCycle);
        }
      } catch (e) {
        Logger.error('Failed to load timer state', e);
      }
    };
    loadState();
  }, []);

  // 监听来自 background 的消息
  useEffect(() => {
    const handleMessage = (message: unknown) => {
      const msg = message as { type: string; mode?: TimerMode };
      if (msg.type === 'TIMER_COMPLETE' && msg.mode) {
        Logger.debug('Timer complete from background', { mode: msg.mode });
        // 计算实际完成的时长
        const completedDuration = timeLeftForMode[msg.mode];
        onComplete(msg.mode, completedDuration);
        if (settings.autoSwitch) {
          handleTimerComplete(msg.mode);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [timeLeftForMode, settings.autoSwitch, onComplete]);

  // 获取各模式时长
  const getFocusTime = useCallback(() => settings.customFocusTime, [settings.customFocusTime]);
  const getBreakTime = useCallback(() => settings.customBreakTime, [settings.customBreakTime]);
  const getLongBreakTime = useCallback(() => settings.customLongBreakTime, [settings.customLongBreakTime]);

  /**
   * 获取指定模式的时长
   */
  const getTimeForMode = useCallback((targetMode: TimerMode): number => {
    if (targetMode === 'focus') return getFocusTime();
    if (targetMode === 'break') return getBreakTime();
    return getLongBreakTime();
  }, [getFocusTime, getBreakTime, getLongBreakTime]);

  /**
   * 处理开始/暂停按钮点击
   */
  const handleStartPause = useCallback(async () => {
    const isCurrentRunning = isRunningForMode[mode];

    if (!isCurrentRunning) {
      setCompletionGuard(false);

      // 开始专注模式计时时，周期 +1
      if (mode === 'focus') {
        setPomodoroCycle((prev) => prev + 1);
      }

      const response = await sendMessage({
        type: 'START',
        data: { timeLeft: timeLeftForMode[mode] },
      }) as { success: boolean; state?: TimerState };

      if (response.success && response.state) {
        setIsRunningForMode((prev) => ({ ...prev, [mode]: true }));
        setTimeLeftForMode((prev) => ({
          ...prev,
          [mode]: response.state!.timeLeft,
        }));
      }
    } else {
      const response = await sendMessage({ type: 'PAUSE' }) as { success: boolean; state?: TimerState };

      if (response.success && response.state) {
        setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
        setTimeLeftForMode((prev) => ({
          ...prev,
          [mode]: response.state!.timeLeft,
        }));
      }
    }
  }, [mode, isRunningForMode, timeLeftForMode]);

  /**
   * 处理重置按钮点击
   */
  const handleReset = useCallback(async () => {
    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    setCompletionGuard(false);

    const resetTime = getTimeForMode(mode);

    const response = await sendMessage({
      type: 'RESET',
      data: { mode },
    }) as { success: boolean; state?: TimerState };

    if (response.success && response.state) {
      setTimeLeftForMode((prev) => ({ ...prev, [mode]: resetTime }));
    }
  }, [mode, getTimeForMode]);

  /**
   * 处理跳过按钮点击
   */
  const handleSkip = useCallback(async () => {
    // 先暂停当前计时
    await sendMessage({ type: 'PAUSE' });

    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    setCompletionGuard(false);

    let nextMode: TimerMode;

    if (mode === 'focus') {
      nextMode = pomodoroCycle >= POMODORO_CYCLE_COUNT ? 'longBreak' : 'break';
    } else if (mode === 'break') {
      nextMode = 'focus';
    } else {
      nextMode = 'focus';
    }

    if (mode === 'longBreak') {
      setPomodoroCycle(0);
    }

    const initialTime = getTimeForMode(nextMode);

    const response = await sendMessage({
      type: 'SET_MODE',
      data: { mode: nextMode },
    }) as { success: boolean; state?: TimerState };

    if (response.success && response.state) {
      setTimeLeftForMode((prev) => ({ ...prev, [nextMode]: initialTime }));
      setMode(nextMode);
    }
  }, [mode, pomodoroCycle, getTimeForMode]);

  /**
   * 手动切换模式
   */
  const handleManualModeToggle = useCallback(async (newMode: TimerMode) => {
    // 先暂停当前计时
    await sendMessage({ type: 'PAUSE' });

    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    setCompletionGuard(false);

    const newModeTime = getTimeForMode(newMode);

    const response = await sendMessage({
      type: 'SET_MODE',
      data: { mode: newMode },
    }) as { success: boolean; state?: TimerState };

    if (response.success && response.state) {
      setTimeLeftForMode((prev) => ({ ...prev, [newMode]: newModeTime }));
      setMode(newMode);
    }
  }, [mode, getTimeForMode]);

  /**
   * 计时器完成后的处理
   */
  const handleTimerComplete = useCallback((completedMode: TimerMode) => {
    Logger.debug('handleTimerComplete called', {
      completedMode,
      currentMode: mode,
      autoSwitch: settings.autoSwitch
    });

    if (!settings.autoSwitch) {
      return;
    }

    if (completedMode !== mode) {
      return;
    }

    setCompletionGuard((prev) => {
      if (prev) return prev;

      let nextMode: TimerMode;

      if (completedMode === 'focus') {
        nextMode = pomodoroCycle >= POMODORO_CYCLE_COUNT ? 'longBreak' : 'break';
      } else if (completedMode === 'break') {
        nextMode = 'focus';
      } else {
        nextMode = 'focus';
      }

      if (completedMode === 'longBreak') {
        setPomodoroCycle(0);
      }

      const nextModeTime = getTimeForMode(nextMode);
      setTimeLeftForMode((prev) => ({ ...prev, [nextMode]: nextModeTime }));

      // 延迟切换模式
      setTimeout(() => {
        setCompletionGuard(false);
        setMode(nextMode);

        if (settings.autoStart) {
          if (nextMode === 'focus') {
            setPomodoroCycle((prev) => prev + 1);
          }

          sendMessage({
            type: 'START',
            data: { timeLeft: nextModeTime },
          });
          setIsRunningForMode((prev) => ({ ...prev, [nextMode]: true }));
        }
      }, MODE_SWITCH_DELAY);

      return true;
    });
  }, [settings.autoSwitch, settings.autoStart, getTimeForMode, mode, pomodoroCycle]);

  /**
   * 执行模式切换（当通知弹窗关闭时调用）
   */
  const executeModeSwitch = useCallback(async (lastCompletedMode: TimerMode) => {
    if (!settings.autoSwitch) {
      return;
    }

    Logger.debug('Executing mode switch after notification closed', { lastCompletedMode });

    let nextMode: TimerMode;

    if (lastCompletedMode === 'focus') {
      nextMode = pomodoroCycle >= POMODORO_CYCLE_COUNT ? 'longBreak' : 'break';
    } else if (lastCompletedMode === 'break') {
      nextMode = 'focus';
    } else {
      nextMode = 'focus';
    }

    if (lastCompletedMode === 'longBreak') {
      setPomodoroCycle(0);
    }

    const nextModeTime = getTimeForMode(nextMode);
    setTimeLeftForMode((prev) => ({ ...prev, [nextMode]: nextModeTime }));

    setMode(nextMode);

    if (settings.autoStart) {
      if (nextMode === 'focus') {
        setPomodoroCycle((prev) => prev + 1);
      }

      await sendMessage({
        type: 'START',
        data: { timeLeft: nextModeTime },
      });
      setIsRunningForMode((prev) => ({ ...prev, [nextMode]: true }));
    }

    setCompletionGuard(false);
  }, [settings.autoSwitch, settings.autoStart, getTimeForMode, pomodoroCycle]);

  /**
   * 设置时间（用于设置面板更新时间时）
   */
  const handleTimeChange = useCallback((timeType: TimerMode, newTime: number) => {
    setTimeLeftForMode((prev) => ({ ...prev, [timeType]: newTime }));
    setCompletionGuard(false);
  }, []);

  return {
    // 状态
    mode,
    timeLeftForMode,
    isRunningForMode,
    pomodoroCycle,
    completionGuard,
    setCompletionGuard,
    // 方法
    getFocusTime,
    getBreakTime,
    getLongBreakTime,
    getTimeForMode,
    handleStartPause,
    handleReset,
    handleSkip,
    handleManualModeToggle,
    handleTimerComplete,
    executeModeSwitch,
    handleTimeChange,
    setMode,
    setTimeLeftForMode,
    setIsRunningForMode,
    setPomodoroCycle,
  };
}