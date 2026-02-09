/**
 * 计时器核心逻辑 Hook
 *
 * 管理番茄钟计时器的核心逻辑
 * @module hooks/useTimer
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { TimerMode } from '../types/worker';
import type { WorkerCommand, WorkerMessage } from '../types/worker';
import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';

// 存储键配置
const STORAGE_KEYS = {
  CURRENT_MODE: 'tomato-current-mode',
  TIME_LEFT_FOCUS: 'tomato-timeLeft-focus',
  TIME_LEFT_BREAK: 'tomato-timeLeft-break',
  TIME_LEFT_LONG_BREAK: 'tomato-timeLeft-longBreak',
  RUNNING_FOCUS: 'tomato-running-focus',
  RUNNING_BREAK: 'tomato-running-break',
  RUNNING_LONG_BREAK: 'tomato-running-longBreak',
  WAS_RUNNING_FOCUS: 'tomato-was-running-focus',
  WAS_RUNNING_BREAK: 'tomato-was-running-break',
  WAS_RUNNING_LONG_BREAK: 'tomato-was-running-longBreak',
} as const;

// 常量配置
const POMODORO_CYCLE_COUNT = 4;
const MODE_SWITCH_DELAY = 2000;

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
  const [mode, setMode] = useState<TimerMode>(() => {
    const saved = StorageManager.get<TimerMode>(STORAGE_KEYS.CURRENT_MODE);
    return saved && ['focus', 'break', 'longBreak'].includes(saved) ? saved : 'focus';
  });

  // 番茄钟周期计数（0-4）
  const [pomodoroCycle, setPomodoroCycle] = useState(0);

  // 计时器完成保护标志
  const [completionGuard, setCompletionGuard] = useState(false);

  // 每个模式的剩余时间记录
  const [timeLeftForMode, setTimeLeftForMode] = useState<Record<TimerMode, number>>(() => {
    const loadTime = (
      timeKey: string,
      runningKey: string,
      customTime: number
    ) => {
      const saved = StorageManager.get<string>(timeKey);
      const wasRunning = StorageManager.get<string>(runningKey) === 'true';

      if (saved !== undefined && saved !== null && wasRunning) {
        const time = parseInt(saved, 10);
        if (!isNaN(time) && time >= 60 && time <= 7200) {
          Logger.debug(`Restoring time from previous run: ${time}s`);
          return time;
        }
      }

      return customTime;
    };

    return {
      focus: loadTime(
        STORAGE_KEYS.TIME_LEFT_FOCUS,
        STORAGE_KEYS.WAS_RUNNING_FOCUS,
        settings.customFocusTime
      ),
      break: loadTime(
        STORAGE_KEYS.TIME_LEFT_BREAK,
        STORAGE_KEYS.WAS_RUNNING_BREAK,
        settings.customBreakTime
      ),
      longBreak: loadTime(
        STORAGE_KEYS.TIME_LEFT_LONG_BREAK,
        STORAGE_KEYS.WAS_RUNNING_LONG_BREAK,
        settings.customLongBreakTime
      ),
    };
  });

  // 每个模式的运行状态
  const [isRunningForMode, setIsRunningForMode] = useState<Record<TimerMode, boolean>>(() => {
    const loadRunning = (key: string): boolean => {
      const saved = StorageManager.get<string>(key);
      return saved === 'true';
    };

    return {
      focus: loadRunning(STORAGE_KEYS.RUNNING_FOCUS),
      break: loadRunning(STORAGE_KEYS.RUNNING_BREAK),
      longBreak: loadRunning(STORAGE_KEYS.RUNNING_LONG_BREAK),
    };
  });

  // 计时器 Worker 实例引用
  const timerWorkerRef = useRef<Worker | null>(null);

  // 当前模式引用
  const currentModeRef = useRef<TimerMode>('focus');

  // 周期计数引用
  const pomodoroCycleRef = useRef(pomodoroCycle);

  // 模式切换定时器引用
  const switchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 运行状态引用（用于避免闭包陷阱）
  const isRunningForModeRef = useRef(isRunningForMode);

  // onComplete 回调引用（用于避免 Worker 重新创建）
  const onCompleteRef = useRef(onComplete);

  /**
   * 同步更新 ref
   */
  useEffect(() => {
    currentModeRef.current = mode;
    pomodoroCycleRef.current = pomodoroCycle;
    isRunningForModeRef.current = isRunningForMode;
    onCompleteRef.current = onComplete;
  }, [mode, pomodoroCycle, isRunningForMode, onComplete]);

  /**
   * 监听设置变化，更新当前模式的剩余时间
   */
  useEffect(() => {
    setTimeLeftForMode(prev => {
      const newTimes = {
        focus: settings.customFocusTime,
        break: settings.customBreakTime,
        longBreak: settings.customLongBreakTime,
      };

      // 如果当前模式的时间设置变了，更新剩余时间
      if (prev[mode] !== newTimes[mode]) {
        // 只有在计时器未运行时才更新，避免干扰正在进行的计时
        // 使用 ref 避免将 isRunningForMode 加入依赖项
        if (!isRunningForModeRef.current[mode]) {
          // 同时更新 localStorage 中的时间
          try {
            const key = mode === 'focus'
              ? STORAGE_KEYS.TIME_LEFT_FOCUS
              : mode === 'break'
              ? STORAGE_KEYS.TIME_LEFT_BREAK
              : STORAGE_KEYS.TIME_LEFT_LONG_BREAK;
            StorageManager.set(key, newTimes[mode]);
          } catch (error) {
            Logger.error('Failed to save time left', error);
          }
          return { ...prev, [mode]: newTimes[mode] };
        }
      }

      return prev;
    });
  }, [settings.customFocusTime, settings.customBreakTime, settings.customLongBreakTime, mode]);

  /**
   * 保存运行状态到 localStorage
   */
  useEffect(() => {
    try {
      StorageManager.set(STORAGE_KEYS.RUNNING_FOCUS, isRunningForMode.focus);
      StorageManager.set(STORAGE_KEYS.RUNNING_BREAK, isRunningForMode.break);
      StorageManager.set(STORAGE_KEYS.RUNNING_LONG_BREAK, isRunningForMode.longBreak);
      StorageManager.set(STORAGE_KEYS.WAS_RUNNING_FOCUS, isRunningForMode.focus);
      StorageManager.set(STORAGE_KEYS.WAS_RUNNING_BREAK, isRunningForMode.break);
      StorageManager.set(STORAGE_KEYS.WAS_RUNNING_LONG_BREAK, isRunningForMode.longBreak);
    } catch (error) {
      Logger.error('Failed to save running states', error);
    }
  }, [isRunningForMode]);

  /**
   * 初始化计时器 Worker
   */
  useEffect(() => {
    const worker = new Worker(new URL('../workers/timerWorker.ts', import.meta.url), {
      type: 'module',
    });
    timerWorkerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data as WorkerMessage;
      const { type, mode: msgMode } = data;

      if (type === 'UPDATE') {
        setIsRunningForMode((prev) => ({ ...prev, [msgMode]: true }));
        setTimeLeftForMode((prev) => ({ ...prev, [msgMode]: data.timeLeft }));

        try {
          const key = msgMode === 'focus'
            ? STORAGE_KEYS.TIME_LEFT_FOCUS
            : msgMode === 'break'
            ? STORAGE_KEYS.TIME_LEFT_BREAK
            : STORAGE_KEYS.TIME_LEFT_LONG_BREAK;
          StorageManager.set(key, data.timeLeft);
        } catch (error) {
          Logger.error('Failed to save time left', error);
        }
      } else if (type === 'COMPLETE') {
        Logger.debug('Worker COMPLETE message received', { mode: msgMode, currentMode: currentModeRef.current, completedDuration: data.completedDuration });
        setIsRunningForMode((prev) => ({ ...prev, [msgMode]: false }));
        onCompleteRef.current(msgMode, data.completedDuration);
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

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
  const handleStartPause = useCallback(() => {
    const isCurrentRunning = isRunningForMode[mode];

    if (!isCurrentRunning) {
      setCompletionGuard(false);

      // 开始专注模式计时时，周期 +1
      if (mode === 'focus') {
        setPomodoroCycle((prev) => prev + 1);
      }

      timerWorkerRef.current?.postMessage({
        type: 'START',
        mode,
        initialTime: timeLeftForMode[mode],
      } as WorkerCommand);
      setIsRunningForMode((prev) => ({ ...prev, [mode]: true }));
    } else {
      timerWorkerRef.current?.postMessage({
        type: 'PAUSE',
        mode,
      } as WorkerCommand);
      setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    }
  }, [mode, isRunningForMode, timeLeftForMode]);

  /**
   * 处理重置按钮点击
   */
  const handleReset = useCallback(() => {
    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    setCompletionGuard(false);

    const resetTime = getTimeForMode(mode);
    setTimeLeftForMode((prev) => ({ ...prev, [mode]: resetTime }));

    timerWorkerRef.current?.postMessage({
      type: 'RESET',
      mode,
      initialTime: resetTime,
    } as WorkerCommand);
  }, [mode, getTimeForMode]);

  /**
   * 处理跳过按钮点击
   */
  const handleSkip = useCallback(() => {
    timerWorkerRef.current?.postMessage({
      type: 'PAUSE',
      mode,
    } as WorkerCommand);
    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    setCompletionGuard(false);

    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }

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
    // 周期已在开始专注时 +1，此处不再修改

    const initialTime = getTimeForMode(nextMode);
    setTimeLeftForMode((prev) => {
      const newState = { ...prev, [nextMode]: initialTime };
      try {
        StorageManager.set(STORAGE_KEYS.CURRENT_MODE, nextMode);
        StorageManager.set(STORAGE_KEYS.TIME_LEFT_FOCUS, newState.focus);
        StorageManager.set(STORAGE_KEYS.TIME_LEFT_BREAK, newState.break);
        StorageManager.set(STORAGE_KEYS.TIME_LEFT_LONG_BREAK, newState.longBreak);
      } catch (error) {
        Logger.error('Failed to save time left and current mode', error);
      }
      return newState;
    });

    timerWorkerRef.current?.postMessage({
      type: 'SET_TIME',
      mode: nextMode,
      time: initialTime,
    } as WorkerCommand);

    setMode(nextMode);
  }, [mode, pomodoroCycle, getTimeForMode]);

  /**
   * 手动切换模式
   */
  const handleManualModeToggle = useCallback((newMode: TimerMode) => {
    timerWorkerRef.current?.postMessage({
      type: 'PAUSE',
      mode: mode,
    } as WorkerCommand);
    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));

    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }

    setCompletionGuard(false);

    const newModeTime = getTimeForMode(newMode);
    setTimeLeftForMode((prev) => ({ ...prev, [newMode]: newModeTime }));

    timerWorkerRef.current?.postMessage({
      type: 'SET_TIME',
      mode: newMode,
      time: newModeTime,
    } as WorkerCommand);

    setMode(newMode);

    try {
      StorageManager.set(STORAGE_KEYS.CURRENT_MODE, newMode);
      const timeKey = newMode === 'focus' ? STORAGE_KEYS.TIME_LEFT_FOCUS
        : newMode === 'break' ? STORAGE_KEYS.TIME_LEFT_BREAK
        : STORAGE_KEYS.TIME_LEFT_LONG_BREAK;
      StorageManager.set(timeKey, newModeTime);
    } catch (error) {
      Logger.error('Failed to save mode and time', error);
    }
  }, [mode, getTimeForMode]);

  /**
   * 计时器完成后的处理
   */
  const handleTimerComplete = useCallback((completedMode: TimerMode) => {
    Logger.debug('handleTimerComplete called', {
      completedMode,
      currentMode: currentModeRef.current,
      autoSwitch: settings.autoSwitch
    });

    if (!settings.autoSwitch) {
      return;
    }

    if (completedMode !== currentModeRef.current) {
      return;
    }

    setCompletionGuard((prev) => {
      if (prev) return prev;

      let nextMode: TimerMode;

      if (completedMode === 'focus') {
        nextMode = pomodoroCycleRef.current >= POMODORO_CYCLE_COUNT ? 'longBreak' : 'break';
      } else if (completedMode === 'break') {
        nextMode = 'focus';
      } else {
        nextMode = 'focus';
      }

      if (completedMode === 'longBreak') {
        setPomodoroCycle(0);
      }
      // 周期已在开始专注时 +1，此处不再修改

      const nextModeTime = getTimeForMode(nextMode);
      setTimeLeftForMode((prev) => ({ ...prev, [nextMode]: nextModeTime }));

      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }

      const capturedTime = nextModeTime;

      switchTimeoutRef.current = setTimeout(() => {
        Logger.debug('Executing mode switch', { from: completedMode, to: nextMode });
        setCompletionGuard(false);
        setMode(nextMode);

        if (settings.autoStart) {
          // 自动开始专注模式时，周期 +1
          if (nextMode === 'focus') {
            setPomodoroCycle((prev) => prev + 1);
          }

          timerWorkerRef.current?.postMessage({
            type: 'START',
            mode: nextMode,
            initialTime: capturedTime,
          } as WorkerCommand);
          setIsRunningForMode((prev) => ({ ...prev, [nextMode]: true }));
        }

        switchTimeoutRef.current = null;
      }, MODE_SWITCH_DELAY);

      return true;
    });
  }, [settings.autoSwitch, settings.autoStart, getTimeForMode]);

  /**
   * 执行模式切换（当通知弹窗关闭时调用）
   */
  const executeModeSwitch = useCallback((lastCompletedMode: TimerMode) => {
    if (!settings.autoSwitch) {
      return;
    }

    Logger.debug('Executing mode switch after notification closed', { lastCompletedMode });

    let nextMode: TimerMode;

    if (lastCompletedMode === 'focus') {
      nextMode = pomodoroCycleRef.current >= POMODORO_CYCLE_COUNT ? 'longBreak' : 'break';
    } else if (lastCompletedMode === 'break') {
      nextMode = 'focus';
    } else {
      nextMode = 'focus';
    }

    if (lastCompletedMode === 'longBreak') {
      setPomodoroCycle(0);
    }
    // 周期已在开始专注时 +1，此处不再修改

    const nextModeTime = getTimeForMode(nextMode);
    setTimeLeftForMode((prev) => ({ ...prev, [nextMode]: nextModeTime }));

    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
    }

    setMode(nextMode);

    if (settings.autoStart) {
      // 自动开始专注模式时，周期 +1
      if (nextMode === 'focus') {
        setPomodoroCycle((prev) => prev + 1);
      }

      timerWorkerRef.current?.postMessage({
        type: 'START',
        mode: nextMode,
        initialTime: nextModeTime,
      } as WorkerCommand);
      setIsRunningForMode((prev) => ({ ...prev, [nextMode]: true }));
    }

    setCompletionGuard(false);
  }, [settings.autoSwitch, settings.autoStart, getTimeForMode]);

  /**
   * 设置时间（用于设置面板更新时间时）
   */
  const handleTimeChange = useCallback((timeType: TimerMode, newTime: number) => {
    const setterMap = {
      focus: () => setTimeLeftForMode((prev) => ({ ...prev, focus: newTime })),
      break: () => setTimeLeftForMode((prev) => ({ ...prev, break: newTime })),
      longBreak: () => setTimeLeftForMode((prev) => ({ ...prev, longBreak: newTime })),
    };

    setterMap[timeType]();

    timerWorkerRef.current?.postMessage({
      type: 'SET_TIME',
      mode: timeType,
      time: newTime,
    } as WorkerCommand);

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
