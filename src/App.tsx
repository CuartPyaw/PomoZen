/**
 * 番茄钟应用
 *
 * 一个基于番茄工作法（Pomodoro Technique）的计时器应用
 * 支持专注、短休息、长休息三种模式，可自定义时间长度
 * 具备自动切换、桌面通知、本地存储等功能
 *
 * @module App
 * @author Tomato Clock Team
 * @version 1.0.0
 */

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Switch,
  Stack,
  Fab,
  Chip,
  AppBar,
  Toolbar,
  Divider,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Zoom,
  ThemeProvider
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CssBaseline from '@mui/material/CssBaseline';
import { createDarkTheme } from './theme';
import './styles/background.css';
import './App.css';

// 类型定义

/**
 * 计时器模式类型
 * - focus: 专注模式
 * - break: 短休息模式
 * - longBreak: 长休息模式
 */
type TimerMode = 'focus' | 'break' | 'longBreak';

// 常量配置

/** 默认专注时长：25分钟（单位：秒） */
const DEFAULT_FOCUS_TIME = 25 * 60;

/** 默认短休息时长：5分钟（单位：秒） */
const DEFAULT_BREAK_TIME = 5 * 60;

/** 默认长休息时长：30分钟（单位：秒） */
const DEFAULT_LONG_BREAK_TIME = 30 * 60;

/** 完成一次番茄钟循环需要的专注次数 */
const POMODORO_CYCLE_COUNT = 5;

/** 模式切换延迟时间：2秒（单位：毫秒） */
const MODE_SWITCH_DELAY = 2000;

/** 本地存储键名配置 */
const STORAGE_KEYS = {
  AUTO_SWITCH: 'tomato-autoSwitch',           // 自动切换模式开关
  AUTO_START: 'tomato-autoStart',               // 自动开始计时开关
  ENABLE_NOTIFICATIONS: 'tomato-enableNotifications',  // 桌面通知开关
  CUSTOM_FOCUS_TIME: 'tomato-customFocusTime',         // 自定义专注时长
  CUSTOM_BREAK_TIME: 'tomato-customBreakTime',         // 自定义短休息时长
  CUSTOM_LONG_BREAK_TIME: 'tomato-customLongBreakTime', // 自定义长休息时长
  CURRENT_MODE: 'tomato-current-mode',          // 当前模式
} as const;

// 组件定义

/**
 * 番茄钟主组件
 *
 * 管理计时器的核心逻辑，包括：
 * - 三种模式的切换（专注/短休息/长休息）
 * - 自动计时和手动控制
 * - 本地存储持久化
 * - 桌面通知功能
 * - 自动切换模式（番茄工作法循环）
 *
 * @returns JSX 元素
 */
function App() {
// 状态管理

  /**
   * 当前计时器模式
   * @default 'focus'
   */
  const [mode, setMode] = useState<TimerMode>('focus');

  /**
   * 计时器运行状态
   * @default false
   */
  const [isRunning, setIsRunning] = useState(false);

  /**
   * 设置面板显示状态
   * @default false
   */
  const [showSettings, setShowSettings] = useState(false);

  /**
   * 自动切换模式开关
   * 启用后，计时器完成会自动切换到下一个模式
   * @default true
   */
  const [autoSwitch, setAutoSwitch] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SWITCH);
    return saved ? saved === 'true' : true;
  });

  /**
   * 自动开始计时开关
   * 启用后，模式切换时自动开始计时
   * @default true
   */
  const [autoStart, setAutoStart] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_START);
    return saved ? saved === 'true' : true;
  });

  /**
   * 桌面通知开关
   * 计时器完成时发送桌面通知
   * @default false（需用户授权）
   */
  const [enableNotifications, setEnableNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS);
    if (saved !== null) {
      return saved === 'true';
    }
    // 如果浏览器已授权通知，则默认启用
    if ('Notification' in window && Notification.permission === 'granted') {
      return true;
    }
    return false;
  });

  /**
   * 当前番茄钟周期计数（1-5）
   * 完成一次长休息后重置为1
   * @default 1
   */
  const [pomodoroCycle, setPomodoroCycle] = useState(1);

  /**
   * 计时器完成保护标志
   * 防止计时器完成时重复触发
   * @default false
   */
  const [completionGuard, setCompletionGuard] = useState(false);

  /**
   * 自定义专注时长（单位：秒）
   * 范围：60-7200秒（1-120分钟）
   * @default DEFAULT_FOCUS_TIME
   */
  const [customFocusTime, setCustomFocusTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOCUS_TIME);
    if (saved !== null) {
      const time = parseInt(saved, 10);
      if (!isNaN(time) && time >= 60 && time <= 7200) {
        return time;
      }
    }
    return DEFAULT_FOCUS_TIME;
  });

  /**
   * 自定义短休息时长（单位：秒）
   * 范围：60-7200秒（1-120分钟）
   * @default DEFAULT_BREAK_TIME
   */
  const [customBreakTime, setCustomBreakTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_BREAK_TIME);
    if (saved !== null) {
      const time = parseInt(saved, 10);
      if (!isNaN(time) && time >= 60 && time <= 7200) {
        return time;
      }
    }
    return DEFAULT_BREAK_TIME;
  });

  /**
   * 自定义长休息时长（单位：秒）
   * 范围：60-7200秒（1-120分钟）
   * @default DEFAULT_LONG_BREAK_TIME
   */
  const [customLongBreakTime, setCustomLongBreakTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME);
    if (saved !== null) {
      const time = parseInt(saved, 10);
      if (!isNaN(time) && time >= 60 && time <= 7200) {
        return time;
      }
    }
    return DEFAULT_LONG_BREAK_TIME;
  });

  /**
   * 剩余时间（单位：秒）
   * 根据当前模式和自定义时长初始化
   */
  const [timeLeft, setTimeLeft] = useState(() => {
    // 从 localStorage 恢复上次使用的模式
    const currentMode = localStorage.getItem(STORAGE_KEYS.CURRENT_MODE) as TimerMode || 'focus';
    if (currentMode === 'focus') {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOCUS_TIME);
      if (saved !== null) {
        const time = parseInt(saved, 10);
        if (!isNaN(time) && time >= 60 && time <= 7200) {
          return time;
        }
      }
      return DEFAULT_FOCUS_TIME;
    } else if (currentMode === 'break') {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_BREAK_TIME);
      if (saved !== null) {
        const time = parseInt(saved, 10);
        if (!isNaN(time) && time >= 60 && time <= 7200) {
          return time;
        }
      }
      return DEFAULT_BREAK_TIME;
    } else {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME);
      if (saved !== null) {
        const time = parseInt(saved, 10);
        if (!isNaN(time) && time >= 60 && time <= 7200) {
          return time;
        }
      }
      return DEFAULT_LONG_BREAK_TIME;
    }
  });

// 工具函数和 Ref

  /**
   * 获取当前模式对应的专注时长
   * @returns 专注时长（秒）
   */
  const getFocusTime = () => customFocusTime;

  /**
   * 获取当前模式对应的短休息时长
   * @returns 短休息时长（秒）
   */
  const getBreakTime = () => customBreakTime;

  /**
   * 获取当前模式对应的长休息时长
   * @returns 长休息时长（秒）
   */
  const getLongBreakTime = () => customLongBreakTime;

  /**
   * 模式切换定时器引用
   * 用于在计时器完成后延迟切换模式
   */
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// 副作用：加载和保存设置

  /**
   * 组件挂载时加载所有设置
   * 从 localStorage 恢复用户之前的配置
   */
  useEffect(() => {
    const loadSettings = () => {
      try {
        console.log('=== Loading settings from localStorage ===');

        const allKeys = Object.keys(localStorage);
        console.log('All localStorage keys:', allKeys);

        // 加载自动切换设置
        const savedAutoSwitch = localStorage.getItem(STORAGE_KEYS.AUTO_SWITCH);
        console.log('Raw autoSwitch value:', savedAutoSwitch);
        if (savedAutoSwitch !== null) {
          setAutoSwitch(savedAutoSwitch === 'true');
          console.log('✓ Loaded autoSwitch:', savedAutoSwitch === 'true');
        } else {
          console.log('⚠ autoSwitch not found, using default');
        }

        // 加载自动开始设置
        const savedAutoStart = localStorage.getItem(STORAGE_KEYS.AUTO_START);
        console.log('Raw autoStart value:', savedAutoStart);
        if (savedAutoStart !== null) {
          setAutoStart(savedAutoStart === 'true');
          console.log('✓ Loaded autoStart:', savedAutoStart === 'true');
        } else {
          console.log('⚠ autoStart not found, using default');
        }

        // 加载通知设置
        const savedEnableNotifications = localStorage.getItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS);
        console.log('Raw enableNotifications value:', savedEnableNotifications);
        if (savedEnableNotifications !== null) {
          setEnableNotifications(savedEnableNotifications === 'true');
          console.log('✓ Loaded enableNotifications:', savedEnableNotifications === 'true');
        } else {
          console.log('⚠ enableNotifications not found, using default');
        }

        // 加载自定义专注时长
        const savedFocusTime = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOCUS_TIME);
        console.log('Raw focusTime value:', savedFocusTime);
        if (savedFocusTime !== null) {
          const time = parseInt(savedFocusTime, 10);
          if (!isNaN(time) && time >= 60 && time <= 7200) {
            setCustomFocusTime(time);
            console.log('✓ Loaded focusTime:', time, 'seconds (', time / 60, 'minutes)');
          } else {
            console.log('⚠ Invalid focusTime, using default');
          }
        } else {
          console.log('⚠ focusTime not found, using default');
        }

        // 加载自定义短休息时长
        const savedBreakTime = localStorage.getItem(STORAGE_KEYS.CUSTOM_BREAK_TIME);
        console.log('Raw breakTime value:', savedBreakTime);
        if (savedBreakTime !== null) {
          const time = parseInt(savedBreakTime, 10);
          if (!isNaN(time) && time >= 60 && time <= 7200) {
            setCustomBreakTime(time);
            console.log('✓ Loaded breakTime:', time, 'seconds (', time / 60, 'minutes)');
          } else {
            console.log('⚠ Invalid breakTime, using default');
          }
        } else {
          console.log('⚠ breakTime not found, using default');
        }

        // 加载自定义长休息时长
        const savedLongBreakTime = localStorage.getItem(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME);
        console.log('Raw longBreakTime value:', savedLongBreakTime);
        if (savedLongBreakTime !== null) {
          const time = parseInt(savedLongBreakTime, 10);
          if (!isNaN(time) && time >= 60 && time <= 7200) {
            setCustomLongBreakTime(time);
            console.log('✓ Loaded longBreakTime:', time, 'seconds (', time / 60, 'minutes)');
          } else {
            console.log('⚠ Invalid longBreakTime, using default');
          }
        } else {
          console.log('⚠ longBreakTime not found, using default');
        }

        console.log('=== Settings loading complete ===');
      } catch (error) {
        console.error('❌ Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  /**
   * 保存自动切换设置到 localStorage
   * 每次自动切换设置变化时触发
   */
  useEffect(() => {
    try {
      console.log('Saving autoSwitch:', autoSwitch);
      localStorage.setItem(STORAGE_KEYS.AUTO_SWITCH, String(autoSwitch));
    } catch (error) {
      console.error('Failed to save autoSwitch:', error);
    }
  }, [autoSwitch]);

  /**
   * 保存自动开始设置到 localStorage
   * 每次自动开始设置变化时触发
   */
  useEffect(() => {
    try {
      console.log('Saving autoStart:', autoStart);
      localStorage.setItem(STORAGE_KEYS.AUTO_START, String(autoStart));
    } catch (error) {
      console.error('Failed to save autoStart:', error);
    }
  }, [autoStart]);

  /**
   * 保存通知设置到 localStorage
   * 每次通知设置变化时触发
   */
  useEffect(() => {
    try {
      console.log('Saving enableNotifications:', enableNotifications);
      localStorage.setItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS, String(enableNotifications));
    } catch (error) {
      console.error('Failed to save enableNotifications:', error);
    }
  }, [enableNotifications]);

  /**
   * 保存自定义专注时长到 localStorage
   * 每次专注时长变化时触发
   */
  useEffect(() => {
    try {
      console.log('Saving customFocusTime:', customFocusTime);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FOCUS_TIME, String(customFocusTime));
    } catch (error) {
      console.error('Failed to save customFocusTime:', error);
    }
  }, [customFocusTime]);

  /**
   * 保存自定义短休息时长到 localStorage
   * 每次短休息时长变化时触发
   */
  useEffect(() => {
    try {
      console.log('Saving customBreakTime:', customBreakTime);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BREAK_TIME, String(customBreakTime));
    } catch (error) {
      console.error('Failed to save customBreakTime:', error);
    }
  }, [customBreakTime]);

  /**
   * 保存自定义长休息时长到 localStorage
   * 每次长休息时长变化时触发
   */
  useEffect(() => {
    try {
      console.log('Saving customLongBreakTime:', customLongBreakTime);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME, String(customLongBreakTime));
    } catch (error) {
      console.error('Failed to save customLongBreakTime:', error);
    }
  }, [customLongBreakTime]);

  /**
   * 模式切换时重置剩余时间
   * 每次模式变化时触发
   */
  useEffect(() => {
    const currentTime =
      mode === 'focus'
        ? getFocusTime()
        : mode === 'break'
        ? getBreakTime()
        : getLongBreakTime();
    setTimeLeft(currentTime);
  }, [mode]);

  /**
   * 组件卸载时清理定时器
   * 防止内存泄漏
   */
  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

// 计时器核心逻辑

  /**
   * 计时器运行逻辑
   * 每秒递减剩余时间，到0时触发完成处理
   * 依赖项包括所有可能影响计时的状态
   */
  useEffect(() => {
    if (!isRunning) {
      setCompletionGuard(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, autoSwitch, autoStart, pomodoroCycle, customFocusTime, customBreakTime, customLongBreakTime]);

// 键盘快捷键

  /**
   * 键盘快捷键监听
   * - Space/Enter: 开始/暂停
   * - R: 重置
   * - 1: 专注模式
   * - 2: 短休息模式
   * - 3: 长休息模式
   * - Esc: 关闭设置窗口
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果设置窗口打开且按了 Esc，关闭设置窗口
      if (showSettings && e.key === 'Escape') {
        setShowSettings(false);
        return;
      }

      // 如果设置窗口打开，阻止其他快捷键
      if (showSettings) {
        return;
      }

      // 如果在输入框中，不触发快捷键
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleStartPause();
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
        case '1':
          handleManualModeToggle('focus');
          break;
        case '2':
          handleManualModeToggle('break');
          break;
        case '3':
          handleManualModeToggle('longBreak');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSettings, isRunning]);

// 通知功能

  /**
   * 请求浏览器通知权限
   * 用户点击授权按钮时调用
   */
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setEnableNotifications(true);
          try {
            localStorage.setItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS, 'true');
            console.log('✓ Notification permission granted and saved');
          } catch (error) {
            console.error('Failed to save notification permission:', error);
          }
        } else if (permission === 'denied') {
          console.log('⚠ Notification permission denied by user');
          setEnableNotifications(false);
          try {
            localStorage.setItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS, 'false');
          } catch (error) {
            console.error('Failed to save notification permission:', error);
          }
        } else {
          console.log('ℹ Notification permission:', permission);
        }
      });
    }
  };

  /**
   * 发送桌面通知
   * @param title - 通知标题
   * @param body - 通知内容
   */
  const sendNotification = (title: string, body: string) => {
    if (enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

// 计时器完成处理

  /**
   * 计时器完成时的处理逻辑
   *
   * 执行以下操作：
   * 1. 停止计时器
   * 2. 发送通知
   * 3. 确定下一个模式
   * 4. 如果启用自动切换，延迟后切换模式
   *
   * 使用 completionGuard 防止重复触发
   */
  const handleTimerComplete = () => {
    // 防止重复触发
    if (completionGuard) {
      return;
    }
    setCompletionGuard(true);

    // 停止计时器
    setIsRunning(false);

    // 确定下一个模式
    let nextMode: TimerMode | null = null;

    if (mode === 'focus') {
      // 专注完成 → 短休息
      nextMode = 'break';
    } else if (mode === 'break') {
      // 短休息完成 → 根据周期决定下一个模式
      if (pomodoroCycle >= POMODORO_CYCLE_COUNT) {
        // 完成5个周期 → 长休息
        nextMode = 'longBreak';
      } else {
        // 周期未完成 → 继续专注
        nextMode = 'focus';
      }
    } else if (mode === 'longBreak') {
      // 长休息完成 → 重置周期，开始新的循环
      nextMode = 'focus';
    }

    // 发送完成通知
    if (nextMode) {
      if (mode === 'focus') {
        sendNotification('专注结束', '时间到了！该休息一下了');
      } else if (mode === 'break') {
        sendNotification('休息结束', '休息完成！开始专注吧');
      } else if (mode === 'longBreak') {
        sendNotification('长休息结束', '休息完成！开始新的番茄钟周期');
      }
    }

    // 如果未启用自动切换，直接返回
    if (!autoSwitch) {
      return;
    }

    // 清除旧的切换定时器
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
    }

    // 延迟切换模式（给用户2秒时间看到完成状态）
    switchTimeoutRef.current = setTimeout(() => {
      if (mode === 'focus') {
        switchToMode('break', autoStart);
      } else if (mode === 'break') {
        if (pomodoroCycle >= POMODORO_CYCLE_COUNT) {
          switchToMode('longBreak', autoStart);
        } else {
          setPomodoroCycle(pomodoroCycle + 1);
          switchToMode('focus', autoStart);
        }
      } else if (mode === 'longBreak') {
        setPomodoroCycle(1);
        switchToMode('focus', autoStart);
      }
    }, MODE_SWITCH_DELAY);
  };

// 模式切换

  /**
   * 切换到指定模式
   * @param newMode - 目标模式
   * @param shouldAutoStart - 是否自动开始计时
   */
  const switchToMode = (newMode: TimerMode, shouldAutoStart: boolean = false) => {
    setCompletionGuard(false);
    setMode(newMode);
    const time =
      newMode === 'focus'
        ? getFocusTime()
        : newMode === 'break'
        ? getBreakTime()
        : getLongBreakTime();
    setTimeLeft(time);

    // 保存当前模式到 localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newMode);
    } catch (error) {
      console.error('Failed to save current mode:', error);
    }

    setIsRunning(shouldAutoStart);
  };

// UI 辅助函数

  /**
   * 格式化剩余时间为 MM:SS 格式
   * @param seconds - 剩余秒数
   * @returns 格式化后的时间字符串（如 "25:00"）
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 获取当前模式对应的总时长
   * @returns 总时长（秒）
   */
  const getTotalTime = (): number => {
    return mode === 'focus'
      ? getFocusTime()
      : mode === 'break'
      ? getBreakTime()
      : getLongBreakTime();
  };

  /**
   * 计算 SVG 环形进度条的参数
   * @returns 环形进度条的圆周和偏移量
   */
  const getProgressParams = () => {
    const radius = 123;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / getTotalTime();
    const offset = circumference * (1 - progress);
    return { radius, circumference, offset };
  };

  /**
   * 获取当前模式的中文标签
   * @returns 模式标签（如 "专注时间"、"短休息"、"长休息"）
   */
  const getModeLabel = () => {
    switch (mode) {
      case 'focus':
        return '专注时间';
      case 'break':
        return '短休息';
      case 'longBreak':
        return '长休息';
    }
  };

  /**
   * 获取番茄钟周期信息
   * @returns 周期信息字符串（如 "番茄钟周期: 3/5" 或 "长休息"）
   */
  const getCycleInfo = () => {
    if (mode === 'longBreak') {
      return `长休息`;
    }
    return `番茄钟周期: ${pomodoroCycle}/${POMODORO_CYCLE_COUNT}`;
  };

// 事件处理函数

  /**
   * 处理开始/暂停按钮点击
   * 切换计时器运行状态
   */
  const handleStartPause = () => {
    if (!isRunning) {
      setCompletionGuard(false);
    }
    setIsRunning(!isRunning);
  };

  /**
   * 处理重置按钮点击
   * 重置计时器和周期计数
   */
  const handleReset = () => {
    setIsRunning(false);
    setCompletionGuard(false);
    setTimeLeft(
      mode === 'focus'
        ? getFocusTime()
        : mode === 'break'
        ? getBreakTime()
        : getLongBreakTime(),
    );
    setPomodoroCycle(1);
  };

  /**
   * 手动切换模式
   * 用户点击模式按钮时调用
   * @param newMode - 目标模式
   */
  const handleManualModeToggle = (newMode: TimerMode) => {
    setPomodoroCycle(1);
    setCompletionGuard(false);
    switchToMode(newMode, false);
  };

  /**
   * 处理通知开关切换
   * 启用通知时请求浏览器权限
   * @param enabled - 是否启用通知
   */
  const handleNotificationToggle = (enabled: boolean) => {
    setEnableNotifications(enabled);
    // 如果启用通知且未授权，请求权限
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }
  };

  /**
   * 处理时间设置变化
   * 用户在设置面板修改时间时调用
   * @param timeType - 时间类型（focus/break/longBreak）
   * @param minutes - 新的时间（分钟）
   */
  const handleTimeChange = (timeType: TimerMode, minutes: number) => {
    // 限制时间范围：1-120分钟
    const newTime = Math.max(1, Math.min(120, minutes)) * 60;
    if (timeType === 'focus') {
      setCustomFocusTime(newTime);
      // 如果当前是专注模式，立即更新剩余时间
      if (mode === 'focus') {
        setTimeLeft(newTime);
        setCompletionGuard(false);
      }
    } else if (timeType === 'break') {
      setCustomBreakTime(newTime);
      // 如果当前是短休息模式，立即更新剩余时间
      if (mode === 'break') {
        setTimeLeft(newTime);
        setCompletionGuard(false);
      }
    } else if (timeType === 'longBreak') {
      setCustomLongBreakTime(newTime);
      // 如果当前是长休息模式，立即更新剩余时间
      if (mode === 'longBreak') {
        setTimeLeft(newTime);
        setCompletionGuard(false);
      }
    }
  };

// JSX 渲染

  const { radius, circumference, offset } = getProgressParams();

  const modeColors = {
    focus: { primary: '#5E6AD2', bright: '#6872D9', glow: 'rgba(94,106,210,0.3)' },
    break: { primary: '#10B981', bright: '#34D399', glow: 'rgba(16,185,129,0.3)' },
    longBreak: { primary: '#6366F1', bright: '#818CF8', glow: 'rgba(99,102,241,0.3)' },
  };

  const themeColor = modeColors[mode];

  return (
    <ThemeProvider theme={createDarkTheme()}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 背景系统 */}
        <div className="app-background" />
        <div className="ambient-blobs">
          <div className="blob-primary" />
          <div className="blob-secondary" />
          <div className="blob-tertiary" />
          <div className="blob-accent" />
        </div>
        <div className="grid-overlay" />

      {/* 顶部 AppBar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            className="gradient-title"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '-0.02em',
            }}
          >
            番茄钟
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        {/* 模式切换按钮组 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ButtonGroup variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, '& .MuiButtonGroup-grouped': { borderColor: 'rgba(255,255,255,0.06)' } }}>
            <Tooltip title="快捷键: 1" arrow TransitionComponent={Zoom}>
              <Button
                onClick={() => mode !== 'focus' && handleManualModeToggle('focus')}
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                  bgcolor: mode === 'focus' ? themeColor.primary : 'transparent',
                  color: mode === 'focus' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  borderColor: mode === 'focus' ? 'transparent' : 'rgba(255,255,255,0.06)',
                  '&:hover': {
                    bgcolor: mode === 'focus' ? themeColor.bright : 'rgba(255,255,255,0.05)',
                    color: mode === 'focus' ? '#ffffff' : 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                专注
              </Button>
            </Tooltip>
            <Tooltip title="快捷键: 2" arrow TransitionComponent={Zoom}>
              <Button
                onClick={() => mode !== 'break' && handleManualModeToggle('break')}
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                  bgcolor: mode === 'break' ? modeColors.break.primary : 'transparent',
                  color: mode === 'break' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  borderColor: mode === 'break' ? 'transparent' : 'rgba(255,255,255,0.06)',
                  '&:hover': {
                    bgcolor: mode === 'break' ? modeColors.break.bright : 'rgba(255,255,255,0.05)',
                    color: mode === 'break' ? '#ffffff' : 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                短休息
              </Button>
            </Tooltip>
            <Tooltip title="快捷键: 3" arrow TransitionComponent={Zoom}>
              <Button
                onClick={() => mode !== 'longBreak' && handleManualModeToggle('longBreak')}
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                  bgcolor: mode === 'longBreak' ? modeColors.longBreak.primary : 'transparent',
                  color: mode === 'longBreak' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  borderColor: mode === 'longBreak' ? 'transparent' : 'rgba(255,255,255,0.06)',
                  '&:hover': {
                    bgcolor: mode === 'longBreak' ? modeColors.longBreak.bright : 'rgba(255,255,255,0.05)',
                    color: mode === 'longBreak' ? '#ffffff' : 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                长休息
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>

        {/* 计时器卡片 */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            mb: 3,
            bgcolor: 'transparent',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'visible',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
              borderRadius: '16px 16px 0 0',
            },
          }}
        >
          <CardContent sx={{ pb: 3, pt: 4, px: 2 }}>
            {/* SVG 环形进度条 */}
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, minHeight: 280 }}>
              <svg width={270} height={260} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx={130}
                  cy={130}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={12}
                />
                <circle
                  cx={130}
                  cy={130}
                  r={radius}
                  fill="none"
                  stroke={themeColor.primary}
                  strokeWidth={12}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s ease', filter: `drop-shadow(0 0 8px ${themeColor.glow})` }}
                />
              </svg>
              <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography variant="h2" component="div" sx={{ fontSize: { xs: '2.5rem', md: '3rem' }, fontWeight: 'bold', color: 'text.primary' }}>
                  {formatTime(timeLeft)}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                  {getModeLabel()}
                </Typography>
                {autoSwitch && (
                  <Chip
                    label={getCycleInfo()}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: themeColor.primary,
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 500,
                      boxShadow: `0 0 0 1px ${themeColor.glow}, 0 4px 12px ${themeColor.glow}`,
                    }}
                  />
                )}
              </Box>
            </Box>
          </CardContent>

          <Divider sx={{ mx: 3 }} />

          <CardActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
            <Tooltip title={isRunning ? '暂停 (空格)' : '开始 (空格)'} arrow TransitionComponent={Zoom}>
              <Button
                variant="contained"
                size="large"
                onClick={handleStartPause}
                startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: themeColor.primary,
                  '&:hover': { bgcolor: themeColor.bright },
                }}
              >
                {isRunning ? '暂停' : '开始'}
              </Button>
            </Tooltip>
            <Tooltip title="重置 (R)" arrow TransitionComponent={Zoom}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleReset}
                startIcon={<RefreshIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: themeColor.primary,
                  color: themeColor.primary,
                  '&:hover': { borderColor: themeColor.bright, bgcolor: `${themeColor.primary}15` },
                }}
              >
                重置
              </Button>
            </Tooltip>
          </CardActions>
        </Card>

        {/* 键盘快捷键提示 */}
        <Card elevation={0} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <KeyboardIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                快捷键
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              <Chip label="空格 开始/暂停" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }} />
              <Chip label="R 重置" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }} />
              <Chip label="1 专注" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }} />
              <Chip label="2 短休息" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }} />
              <Chip label="3 长休息" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }} />
              <Chip label="Esc 关闭设置" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }} />
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* 设置按钮 */}
      <Fab
        onClick={() => setShowSettings(!showSettings)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,1)',
          },
        }}
        aria-label="设置"
      >
        <SettingsIcon />
      </Fab>

      {showSettings && (
        <Dialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4 }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Typography variant="h6" component="div">
              设置
            </Typography>
            <IconButton
              onClick={() => setShowSettings(false)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            {/* 时间设置部分 */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: themeColor.primary, fontWeight: 600 }}>
              ⏱ 时间设置
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <TextField
                label="专注时长"
                type="number"
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary">分钟</Typography>
                }}
                inputProps={{ min: 1, max: 120 }}
                value={customFocusTime / 60}
                onChange={(e) => handleTimeChange('focus', parseInt(e.target.value) || 25)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                label="短休息时长"
                type="number"
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary">分钟</Typography>
                }}
                inputProps={{ min: 1, max: 120 }}
                value={customBreakTime / 60}
                onChange={(e) => handleTimeChange('break', parseInt(e.target.value) || 5)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                label="长休息时长"
                type="number"
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary">分钟</Typography>
                }}
                inputProps={{ min: 1, max: 120 }}
                value={customLongBreakTime / 60}
                onChange={(e) => handleTimeChange('longBreak', parseInt(e.target.value) || 30)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Stack>

            {/* 自动切换设置部分 */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: themeColor.primary, fontWeight: 600 }}>
              🔄 自动切换设置
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">启用自动切换模式</Typography>
                <Switch
                  checked={autoSwitch}
                  onChange={(e) => setAutoSwitch(e.target.checked)}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">自动切换时自动开始计时</Typography>
                <Switch
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  size="small"
                />
              </Box>
            </Stack>

            {/* 通知设置部分 */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: themeColor.primary, fontWeight: 600 }}>
              🔔 通知设置
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">启用桌面通知</Typography>
              <Switch
                checked={enableNotifications}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
                size="small"
              />
            </Box>

            {enableNotifications && 'Notification' in window && Notification.permission !== 'granted' && (
              <Button
                variant="contained"
                fullWidth
                onClick={requestNotificationPermission}
                startIcon={<SettingsIcon />}
                sx={{ mb: 2, borderRadius: 3 }}
              >
                授权通知权限
              </Button>
            )}

            {enableNotifications && 'Notification' in window && Notification.permission === 'granted' && (
              <Chip
                label="✓ 通知已启用"
                color="success"
                size="small"
                sx={{ mb: 2 }}
              />
            )}

            {enableNotifications && !('Notification' in window) && (
              <Chip
                label="⚠️ 当前浏览器不支持通知"
                color="warning"
                size="small"
                sx={{ mb: 2 }}
              />
            )}

            {/* 循环模式说明 */}
            {autoSwitch && (
              <Card variant="outlined" sx={{ mt: 2, borderRadius: 3, bgcolor: 'action.hover' }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    循环模式说明
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    专注 → 短休息 (重复 {POMODORO_CYCLE_COUNT} 次) → 长休息
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    💡 自动切换时才会自动开始，手动切换需点击"开始"
                  </Typography>
                </CardContent>
              </Card>
            )}
          </DialogContent>
        </Dialog>
      )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
