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
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import CssBaseline from '@mui/material/CssBaseline';
import { createZenTheme, type ThemeMode } from './theme';
import type {
  DailyFocusRecord,
  ChartViewMode,
  TimeRange,
  DailyChartDataPoint,
  WeeklyChartDataPoint,
  MonthlyChartDataPoint,
  FocusHistoryStorage,
  DataMetric,
} from './types/statistics';
import {
  DailyLineChart,
  WeeklyBarChart,
  MonthlyLineChart,
  TimeDistributionHeatmap,
} from './components/Charts';
import { playNotificationSound } from './utils/audioPlayer';
import './styles/background.css';

// 类型定义

/**
 * 计时器模式类型
 * - focus: 专注模式
 * - break: 短休息模式
 * - longBreak: 长休息模式
 */
type TimerMode = 'focus' | 'break' | 'longBreak';

/**
 * 主题模式偏好类型
 * - light: 浅色模式
 * - dark: 暗色模式
 * - system: 跟随系统设置
 */
type ThemeModePreference = 'light' | 'dark' | 'system';

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
  CUSTOM_FOCUS_TIME: 'tomato-customFocusTime',         // 自定义专注时长
  CUSTOM_BREAK_TIME: 'tomato-customBreakTime',         // 自定义短休息时长
  CUSTOM_LONG_BREAK_TIME: 'tomato-customLongBreakTime', // 自定义长休息时长
  CURRENT_MODE: 'tomato-current-mode',          // 当前模式
  TIME_LEFT_FOCUS: 'tomato-timeLeft-focus',     // 专注模式剩余时间
  TIME_LEFT_BREAK: 'tomato-timeLeft-break',     // 短休息模式剩余时间
  TIME_LEFT_LONG_BREAK: 'tomato-timeLeft-longBreak', // 长休息模式剩余时间
  RUNNING_FOCUS: 'tomato-running-focus',         // 专注模式运行状态
  RUNNING_BREAK: 'tomato-running-break',         // 短休息模式运行状态
  RUNNING_LONG_BREAK: 'tomato-running-longBreak', // 长休息模式运行状态
  WAS_RUNNING_FOCUS: 'tomato-was-running-focus',     // 专注模式是否正在运行（用于恢复）
  WAS_RUNNING_BREAK: 'tomato-was-running-break',     // 短休息模式是否正在运行（用于恢复）
  WAS_RUNNING_LONG_BREAK: 'tomato-was-running-longBreak', // 长休息模式是否正在运行（用于恢复）
  FOCUS_HISTORY: 'tomato-focus-history',        // 专注历史记录
  CHART_VIEW_MODE: 'tomato-chart-view-mode',    // 图表视图模式
  CHART_TIME_RANGE: 'tomato-chart-time-range',  // 图表时间范围
  CHART_DATA_METRIC: 'tomato-chart-data-metric', // 图表数据指标
  SOUND_ENABLED: 'tomato-soundEnabled',         // 通知声音开关
  AUTO_SKIP_NOTIFICATION: 'tomato-autoSkipNotification', // 自动跳过通知开关
  THEME_MODE: 'tomato-theme-mode',              // 主题模式偏好
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
   * 获取系统主题偏好
   */
  const getSystemTheme = (): ThemeMode => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  /**
   * 主题模式偏好（用户选择）
   * @default 'system'
   */
  const [themePreference, setThemePreference] = useState<ThemeModePreference>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved as ThemeModePreference;
    return 'system'; // 默认跟随系统
  });

  /**
   * 实际应用的主题模式
   */
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (saved === 'light') return 'light';
    if (saved === 'dark') return 'dark';
    return getSystemTheme(); // system 或默认
  });

  /**
   * 设置面板显示状态
   * @default false
   */
  const [showSettings, setShowSettings] = useState(false);

  /**
   * 通知弹窗状态
   */
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    title: '',
    message: ''
  });

  /**
   * 通知弹窗定时器引用
   */
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 最近完成的模式（用于在通知关闭后触发模式切换）
   */
  const lastCompletedModeRef = useRef<TimerMode | null>(null);

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
   * 通知声音开关
   * 启用后，计时器完成时会播放提示音
   * @default true
   */
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return saved !== 'false'; // 默认开启
  });

  /**
   * 自动跳过通知开关
   * 启用后，计时器完成时不显示通知弹窗
   * @default false
   */
  const [autoSkipNotification, setAutoSkipNotification] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SKIP_NOTIFICATION);
    return saved === 'true'; // 默认关闭
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
  const [_completionGuard, setCompletionGuard] = useState(false);

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
   * 每个模式的剩余时间记录
   * 切换模式时保存和恢复
   */
  const [timeLeftForMode, setTimeLeftForMode] = useState<Record<TimerMode, number>>(() => {
    const loadTime = (timeKey: string, runningKey: string, defaultTime: number, customTimeKey: string) => {
      const saved = localStorage.getItem(timeKey);
      const wasRunning = localStorage.getItem(runningKey) === 'true';

      if (saved !== null && wasRunning) {
        const time = parseInt(saved, 10);
        if (!isNaN(time) && time >= 60 && time <= 7200) {
          console.log(`Restoring time from previous run: ${time}s`);
          return time;
        }
      }

      // 否则使用完整时间（从 localStorage 读取或使用默认值）
      const customSaved = localStorage.getItem(customTimeKey);
      if (customSaved !== null) {
        const customTime = parseInt(customSaved, 10);
        if (!isNaN(customTime) && customTime >= 60 && customTime <= 7200) {
          return customTime;
        }
      }

      console.log(`Using default time: ${defaultTime}s`);
      return defaultTime;
    };

    return {
      focus: loadTime(STORAGE_KEYS.TIME_LEFT_FOCUS, STORAGE_KEYS.WAS_RUNNING_FOCUS, DEFAULT_FOCUS_TIME, STORAGE_KEYS.CUSTOM_FOCUS_TIME),
      break: loadTime(STORAGE_KEYS.TIME_LEFT_BREAK, STORAGE_KEYS.WAS_RUNNING_BREAK, DEFAULT_BREAK_TIME, STORAGE_KEYS.CUSTOM_BREAK_TIME),
      longBreak: loadTime(STORAGE_KEYS.TIME_LEFT_LONG_BREAK, STORAGE_KEYS.WAS_RUNNING_LONG_BREAK, DEFAULT_LONG_BREAK_TIME, STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME),
    };
  });

  /**
   * 每个模式的运行状态
   */
  const [isRunningForMode, setIsRunningForMode] = useState<Record<TimerMode, boolean>>(() => {
    const loadRunning = (key: string): boolean => {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return saved === 'true';
      }
      return false;
    };

    return {
      focus: loadRunning(STORAGE_KEYS.RUNNING_FOCUS),
      break: loadRunning(STORAGE_KEYS.RUNNING_BREAK),
      longBreak: loadRunning(STORAGE_KEYS.RUNNING_LONG_BREAK),
    };
  });

  /**
   * 专注历史记录
   * 按日期索引的 Map 结构，便于快速查找和更新
   */
  const [focusHistory, setFocusHistory] = useState<Map<string, DailyFocusRecord>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOCUS_HISTORY);
    if (saved) {
      try {
        const data: FocusHistoryStorage = JSON.parse(saved);
        const records = data.records || [];
        const historyMap = new Map<string, DailyFocusRecord>();
        records.forEach((record: DailyFocusRecord) => {
          historyMap.set(record.date, record);
        });
        return historyMap;
      } catch (error) {
        console.error('Failed to parse focus history:', error);
      }
    }
    return new Map();
  });

  /**
   * 统计对话框显示状态
   */
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  /**
   * 图表视图模式（每日/每周/每月）
   */
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHART_VIEW_MODE);
    if (saved === 'weekly' || saved === 'daily' || saved === 'monthly') {
      return saved;
    }
    return 'daily';
  });

  /**
   * 图表时间范围
   */
  const [chartTimeRange, setChartTimeRange] = useState<TimeRange>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHART_TIME_RANGE);
    if (saved && ['7days', '30days', '90days', 'all'].includes(saved)) {
      return saved as TimeRange;
    }
    return '30days';
  });

  /**
   * 图表数据指标（时长/次数/平均）
   */
  const [dataMetric, setDataMetric] = useState<DataMetric>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHART_DATA_METRIC);
    if (saved === 'duration' || saved === 'count' || saved === 'average') {
      return saved;
    }
    return 'duration';
  });

// 工具函数和 Ref

  /**
   * 计时器 Worker 实例引用
   * 在独立线程中运行计时逻辑
   */
  const timerWorkerRef = useRef<Worker | null>(null);

  /**
   * 当前模式引用
   * 用于 Worker 消息过滤
   */
  const currentModeRef = useRef<TimerMode>('focus');

  /**
   * 周期计数引用
   * 用于在闭包中获取最新的周期值
   */
  const pomodoroCycleRef = useRef(pomodoroCycle);

  /**
   * 通知相关状态引用
   * 用于在闭包中获取最新的状态值
   */
  const autoSkipNotificationRef = useRef(autoSkipNotification);
  const soundEnabledRef = useRef(soundEnabled);

  /**
   * 同步更新 currentModeRef 和 pomodoroCycleRef
   */
  useEffect(() => {
    currentModeRef.current = mode;
    pomodoroCycleRef.current = pomodoroCycle;
  }, [mode, pomodoroCycle]);

  /**
   * 同步更新通知相关状态到 ref
   * 确保 worker 回调中始终使用最新的状态值
   */
  useEffect(() => {
    autoSkipNotificationRef.current = autoSkipNotification;
    soundEnabledRef.current = soundEnabled;
  }, [autoSkipNotification, soundEnabled]);

  /**
   * 同步主题模式到根元素和 localStorage
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, themePreference);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, [themeMode, themePreference]);

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
   * 初始化计时器 Worker
   * 设置消息监听器
   */
  useEffect(() => {
    const worker = new Worker(new URL('./workers/timerWorker.ts', import.meta.url), {
      type: 'module',
    });
    timerWorkerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data;
      const { type, mode } = data;

      if (type === 'UPDATE') {
        setIsRunningForMode((prev) => ({ ...prev, [mode]: true }));
        setTimeLeftForMode((prev) => ({ ...prev, [mode]: data.timeLeft }));

        try {
          const key = mode === 'focus'
            ? STORAGE_KEYS.TIME_LEFT_FOCUS
            : mode === 'break'
            ? STORAGE_KEYS.TIME_LEFT_BREAK
            : STORAGE_KEYS.TIME_LEFT_LONG_BREAK;
          localStorage.setItem(key, String(data.timeLeft));
        } catch (error) {
          console.error('Failed to save time left:', error);
        }
      } else if (type === 'COMPLETE') {
        console.log('=== Worker COMPLETE message received ===', { mode, currentMode: currentModeRef.current, autoSwitch });
        setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
        handleTimerComplete(mode);
      }
    };

    return () => {
      worker.terminate();
    };
  }, [autoSwitch]);

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
  const switchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
   * 保存运行状态到 localStorage
   * 每次运行状态变化时触发
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RUNNING_FOCUS, String(isRunningForMode.focus));
      localStorage.setItem(STORAGE_KEYS.RUNNING_BREAK, String(isRunningForMode.break));
      localStorage.setItem(STORAGE_KEYS.RUNNING_LONG_BREAK, String(isRunningForMode.longBreak));
      // 保存 wasRunning 状态，用于恢复时判断
      localStorage.setItem(STORAGE_KEYS.WAS_RUNNING_FOCUS, String(isRunningForMode.focus));
      localStorage.setItem(STORAGE_KEYS.WAS_RUNNING_BREAK, String(isRunningForMode.break));
      localStorage.setItem(STORAGE_KEYS.WAS_RUNNING_LONG_BREAK, String(isRunningForMode.longBreak));
    } catch (error) {
      console.error('Failed to save running states:', error);
    }
  }, [isRunningForMode]);

  /**
   * 保存专注历史到 localStorage
   */
  useEffect(() => {
    try {
      const records = Array.from(focusHistory.values())
        .sort((a, b) => a.date.localeCompare(b.date));

      const data = {
        records,
        lastUpdated: Date.now()
      };

      localStorage.setItem(STORAGE_KEYS.FOCUS_HISTORY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save focus history:', error);
    }
  }, [focusHistory]);

  /**
   * 保存图表视图模式到 localStorage
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHART_VIEW_MODE, chartViewMode);
    } catch (error) {
      console.error('Failed to save chart view mode:', error);
    }
  }, [chartViewMode]);

  /**
   * 保存图表时间范围到 localStorage
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHART_TIME_RANGE, chartTimeRange);
    } catch (error) {
      console.error('Failed to save chart time range:', error);
    }
  }, [chartTimeRange]);

  /**
   * 保存图表数据指标到 localStorage
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHART_DATA_METRIC, dataMetric);
    } catch (error) {
      console.error('Failed to save chart data metric:', error);
    }
  }, [dataMetric]);

  /**
   * 组件卸载时清理定时器
   * 防止内存泄漏
   */
  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

// 计时器核心逻辑

// 键盘快捷键

  /**
   * 键盘快捷键监听
   * - Space/Enter: 开始/暂停
   * - Esc: 关闭设置窗口/统计对话框
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果统计对话框打开且按了 Esc，关闭统计对话框
      if (showStatsDialog && e.key === 'Escape') {
        setShowStatsDialog(false);
        return;
      }

      // 如果设置窗口打开且按了 Esc，关闭设置窗口
      if (showSettings && e.key === 'Escape') {
        setShowSettings(false);
        return;
      }

      // 如果设置窗口或统计对话框打开，阻止其他快捷键
      if (showSettings || showStatsDialog) {
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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showSettings, showStatsDialog]);

  /**
   * 显示通知弹窗
   * @param title - 通知标题
   * @param body - 通知内容
   * @param playSound - 是否播放声音（默认根据 soundEnabled 设置）
   */
  const sendNotification = (title: string, body: string, playSound?: boolean) => {
    // 如果启用自动跳过通知，不显示弹窗
    if (autoSkipNotificationRef.current) {
      // 播放声音（如果启用且未明确禁用）
      const shouldPlaySound = playSound !== undefined ? playSound : soundEnabledRef.current;
      if (shouldPlaySound) {
        playNotificationSound();
      }
      return;
    }

    // 清除之前的定时器，防止内存泄漏
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setNotificationDialog({ open: true, title, message: body });

    // 播放声音（如果启用且未明确禁用）
    const shouldPlaySound = playSound !== undefined ? playSound : soundEnabledRef.current;
    if (shouldPlaySound) {
      playNotificationSound();
    }

    // 不再自动超时关闭，需要用户手动点击"知道了"按钮
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
   * @param completedMode - 完成的模式
   */
  const handleTimerComplete = (completedMode: TimerMode) => {
    console.log('=== handleTimerComplete called ===', { completedMode, currentMode: currentModeRef.current, autoSwitch, pomodoroCycle });

    // 记录最近完成的模式，用于通知关闭后的模式切换
    lastCompletedModeRef.current = completedMode;

    // 发送通知
    if (completedMode === 'focus') {
      sendNotification('专注结束', '时间到了！该休息一下了');
      // 记录统计数据
      const completedTime = getFocusTime();
      updateTodayFocusRecord(completedTime);
    } else if (completedMode === 'break') {
      sendNotification('休息结束', '休息完成！开始专注吧');
    } else if (completedMode === 'longBreak') {
      sendNotification('长休息结束', '休息完成！开始新的番茄钟周期');
    }

    // 如果启用自动切换，只在当前显示的模式完成时才执行切换
    if (!autoSwitch) {
      console.log('⚠ Auto switch disabled, skipping mode switch');
      return;
    }

    // 如果显示通知弹窗（即未启用自动跳过），则不自动切换
    // 等待用户关闭弹窗后再切换，给用户确认的机会
    if (!autoSkipNotificationRef.current) {
      console.log('⚠ Notification dialog is shown, skipping auto-switch until user closes it');
      return;
    }

    if (completedMode !== currentModeRef.current) {
      // 非当前模式完成，只发送通知和更新状态，不切换
      console.log('⚠ Non-current mode completed, skipping auto-switch');
      return;
    }

    // 设置保护标志，防止重复触发
    setCompletionGuard((prev) => {
      if (prev) {
        console.log('⚠ Completion guard already active, skipping');
        return prev;
      }

      let nextMode: TimerMode;

      if (completedMode === 'focus') {
        nextMode = 'break';
      } else if (completedMode === 'break') {
        console.log('🔢 Current cycle before decision:', pomodoroCycleRef.current);
        if (pomodoroCycleRef.current >= POMODORO_CYCLE_COUNT) {
          console.log('✓ Cycle count reached, going to long break');
          nextMode = 'longBreak';
        } else {
          console.log(`→ Cycle ${pomodoroCycleRef.current}/${POMODORO_CYCLE_COUNT}, continuing to focus`);
          nextMode = 'focus';
        }
      } else {
        nextMode = 'focus';
      }

      if (completedMode === 'longBreak') {
        console.log('🔄 Long break completed, resetting cycle to 1');
        setPomodoroCycle(1);
      } else if (completedMode === 'break') {
        console.log(`📈 Incrementing cycle: current = ${pomodoroCycleRef.current} → new = ${pomodoroCycleRef.current + 1}`);
        // 使用函数式更新确保获取最新的周期值
        setPomodoroCycle((prev) => {
          console.log(`✅ Cycle updated: ${prev} → ${prev + 1}`);
          return prev + 1;
        });
      }

      // 先设置新模式的完整时间，再切换
      const nextModeTime =
        nextMode === 'focus'
          ? getFocusTime()
          : nextMode === 'break'
          ? getBreakTime()
          : getLongBreakTime();

      setTimeLeftForMode((prev) => ({ ...prev, [nextMode]: nextModeTime }));

      // 清理旧的 timeout
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }

      // 使用闭包捕获时间值，避免在 setTimeout 中读取状态
      const capturedTime = nextModeTime;

      switchTimeoutRef.current = setTimeout(() => {
        console.log('=== Executing mode switch ===', { from: completedMode, to: nextMode });
        // 重置 completionGuard，允许下一个完成事件被处理
        setCompletionGuard(false);
        setMode(nextMode);

        if (autoStart) {
          timerWorkerRef.current?.postMessage({
            type: 'START',
            mode: nextMode,
            initialTime: capturedTime,
          });
          setIsRunningForMode((prev) => ({ ...prev, [nextMode]: true }));
        }

        switchTimeoutRef.current = null;
      }, MODE_SWITCH_DELAY);

      return true;
    });
  };

  /**
   * 执行模式切换（当通知弹窗关闭时调用）
   */
  const executeModeSwitch = () => {
    const completedMode = lastCompletedModeRef.current;
    if (!completedMode) {
      console.log('⚠ No completed mode to switch from');
      return;
    }

    // 清除记录，防止重复触发
    lastCompletedModeRef.current = null;

    if (!autoSwitch) {
      console.log('⚠ Auto switch disabled, skipping mode switch');
      return;
    }

    console.log('=== Executing mode switch after notification closed ===', { completedMode });

    let nextMode: TimerMode;

    if (completedMode === 'focus') {
      nextMode = 'break';
    } else if (completedMode === 'break') {
      if (pomodoroCycleRef.current >= POMODORO_CYCLE_COUNT) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'focus';
      }
    } else {
      nextMode = 'focus';
    }

    // 更新番茄钟周期
    if (completedMode === 'longBreak') {
      setPomodoroCycle(1);
    } else if (completedMode === 'break') {
      setPomodoroCycle((prev) => prev + 1);
    }

    // 获取新模式的时间
    const nextModeTime =
      nextMode === 'focus'
        ? getFocusTime()
        : nextMode === 'break'
        ? getBreakTime()
        : getLongBreakTime();

    setTimeLeftForMode((prev) => ({ ...prev, [nextMode]: nextModeTime }));

    // 清理旧的 timeout
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
    }

    // 使用闭包捕获时间值
    const capturedTime = nextModeTime;

    // 立即切换模式（不延迟，因为用户已经确认了通知）
    setMode(nextMode);

    if (autoStart) {
      timerWorkerRef.current?.postMessage({
        type: 'START',
        mode: nextMode,
        initialTime: capturedTime,
      });
      setIsRunningForMode((prev) => ({ ...prev, [nextMode]: true }));
    }

    // 重置 completionGuard
    setCompletionGuard(false);
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

    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newMode);
    } catch (error) {
      console.error('Failed to save current mode:', error);
    }

    if (shouldAutoStart) {
      timerWorkerRef.current?.postMessage({
        type: 'START',
        mode: newMode,
        initialTime: timeLeftForMode[newMode],
      });
      setIsRunningForMode((prev) => ({ ...prev, [newMode]: true }));
    }
  };

  void switchToMode;

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
    const progress = displayTime / getTotalTime();
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

// 统计数据管理函数

  /**
   * 获取今日日期字符串（YYYY-MM-DD）
   * @returns 今日日期字符串
   */
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * 更新今日专注记录
   * 在专注完成时调用
   * @param duration - 完成的专注时长（秒）
   */
  const updateTodayFocusRecord = (duration: number) => {
    const today = getTodayDateString();
    const hour = new Date().getHours();

    setFocusHistory((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(today);

      if (existing) {
        // 更新现有记录
        const hourlyDist = existing.hourlyDistribution || new Array(24).fill(0);
        hourlyDist[hour] += duration;

        newMap.set(today, {
          ...existing,
          totalDuration: existing.totalDuration + duration,
          sessionCount: existing.sessionCount + 1,
          hourlyDistribution: hourlyDist,
          sessions: [
            ...(existing.sessions || []),
            {
              startTime: Date.now(),
              duration
            }
          ]
        });
      } else {
        // 创建新记录
        const hourlyDist = new Array(24).fill(0);
        hourlyDist[hour] = duration;

        newMap.set(today, {
          date: today,
          totalDuration: duration,
          sessionCount: 1,
          hourlyDistribution: hourlyDist,
          sessions: [{
            startTime: Date.now(),
            duration
          }]
        });
      }

      return newMap;
    });
  };

  /**
   * 根据时间范围获取过滤后的历史记录
   * @returns 过滤后的历史记录数组
   */
  const getFilteredHistory = (): DailyFocusRecord[] => {
    const today = new Date();
    const todayString = today.toISOString().substring(0, 10);  // YYYY-MM-DD (UTC)

    let cutoffDate = new Date();

    switch (chartTimeRange) {
      case '7days':
        cutoffDate.setDate(today.getDate() - 6);
        break;
      case '30days':
        cutoffDate.setDate(today.getDate() - 29);
        break;
      case '90days':
        cutoffDate.setDate(today.getDate() - 89);
        break;
      case 'all':
      default:
        cutoffDate = new Date(0);
        break;
    }

    const cutoffString = cutoffDate.toISOString().substring(0, 10);  // YYYY-MM-DD (UTC)

    return Array.from(focusHistory.values())
      .filter(record => {
        // 使用字符串比较，避免时区问题
        return record.date >= cutoffString && record.date <= todayString;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  /**
   * 为每日视图准备图表数据
   * @returns 每日图表数据数组
   */
  const getDailyChartData = (): DailyChartDataPoint[] => {
    const filtered = getFilteredHistory();

    const daysMap = new Map<string, { duration: number; sessions: number }>();

    filtered.forEach(record => {
      const dateKey = record.date.substring(5); // MM-DD
      daysMap.set(dateKey, {
        duration: Math.round(record.totalDuration / 60),
        sessions: record.sessionCount
      });
    });

    return Array.from(daysMap.entries())
      .map(([date, data]) => ({
        date,
        duration: data.duration,
        sessions: data.sessions
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  /**
   * 为每周视图准备图表数据
   * @returns 每周图表数据数组
   */
  const getWeeklyChartData = (): WeeklyChartDataPoint[] => {
    const filtered = getFilteredHistory();

    const weeksMap = new Map<string, {
      weekStart: string;
      weekEnd: string;
      totalDuration: number;
      totalSessions: number;
    }>();

    filtered.forEach(record => {
      const date = new Date(record.date);
      const dayOfWeek = date.getDay();
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekStartStr = weekStart.toISOString().substring(5, 10);
      const weekEndStr = weekEnd.toISOString().substring(5, 10);
      const weekKey = `${weekStartStr}-${weekEndStr}`;

      if (weeksMap.has(weekKey)) {
        const existing = weeksMap.get(weekKey)!;
        weeksMap.set(weekKey, {
          ...existing,
          totalDuration: existing.totalDuration + record.totalDuration,
          totalSessions: existing.totalSessions + record.sessionCount
        });
      } else {
        weeksMap.set(weekKey, {
          weekStart: weekStartStr,
          weekEnd: weekEndStr,
          totalDuration: record.totalDuration,
          totalSessions: record.sessionCount
        });
      }
    });

    return Array.from(weeksMap.values())
      .map(week => ({
        week: `${week.weekStart}至${week.weekEnd}`,
        duration: Math.round(week.totalDuration / 60),
        sessions: week.totalSessions
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  };

  /**
   * 为每月视图准备图表数据
   * @returns 每月图表数据数组
   */
  const getMonthlyChartData = (): MonthlyChartDataPoint[] => {
    const filtered = getFilteredHistory();

    const monthsMap = new Map<string, {
      totalDuration: number;
      totalSessions: number;
    }>();

    filtered.forEach(record => {
      const monthKey = record.date.substring(0, 7); // YYYY-MM

      if (monthsMap.has(monthKey)) {
        const existing = monthsMap.get(monthKey)!;
        monthsMap.set(monthKey, {
          totalDuration: existing.totalDuration + record.totalDuration,
          totalSessions: existing.totalSessions + record.sessionCount
        });
      } else {
        monthsMap.set(monthKey, {
          totalDuration: record.totalDuration,
          totalSessions: record.sessionCount
        });
      }
    });

    return Array.from(monthsMap.entries())
      .map(([month, data]) => {
        const average = data.totalSessions > 0
          ? Math.round((data.totalDuration / 60) / data.totalSessions)
          : 0;
        return {
          month,
          duration: Math.round(data.totalDuration / 60),
          sessions: data.totalSessions,
          average
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  };

// 事件处理函数

  /**
   * 处理开始/暂停按钮点击
   * 切换计时器运行状态
   */
  const handleStartPause = () => {
    const isCurrentRunning = isRunningForMode[mode];

    if (!isCurrentRunning) {
      setCompletionGuard(false);
      timerWorkerRef.current?.postMessage({
        type: 'START',
        mode,
        initialTime: timeLeftForMode[mode],
      });
      setIsRunningForMode((prev) => ({ ...prev, [mode]: true }));
    } else {
      timerWorkerRef.current?.postMessage({
        type: 'PAUSE',
        mode,
      });
      setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    }
  };

  /**
   * 处理重置按钮点击
   * 重置计时器和周期计数
   */
  const handleReset = () => {
    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    setCompletionGuard(false);

    const resetTime =
      mode === 'focus'
        ? getFocusTime()
        : mode === 'break'
        ? getBreakTime()
        : getLongBreakTime();

    setTimeLeftForMode((prev) => ({ ...prev, [mode]: resetTime }));

    timerWorkerRef.current?.postMessage({
      type: 'RESET',
      mode,
      initialTime: resetTime,
    });

    setTimeLeftForMode((prev) => {
      try {
        localStorage.setItem(STORAGE_KEYS.TIME_LEFT_FOCUS, String(prev.focus));
        localStorage.setItem(STORAGE_KEYS.TIME_LEFT_BREAK, String(prev.break));
        localStorage.setItem(STORAGE_KEYS.TIME_LEFT_LONG_BREAK, String(prev.longBreak));
        localStorage.setItem(STORAGE_KEYS.RUNNING_FOCUS, String(isRunningForMode.focus));
        localStorage.setItem(STORAGE_KEYS.RUNNING_BREAK, String(isRunningForMode.break));
        localStorage.setItem(STORAGE_KEYS.RUNNING_LONG_BREAK, String(isRunningForMode.longBreak));
      } catch (error) {
        console.error('Failed to save time left and running states:', error);
      }
      return prev;
    });

    setPomodoroCycle(1);
  };

  /**
   * 处理跳过按钮点击
   * 停止当前模式计时，切换到下一个模式，重置时间
   */
  const handleSkip = () => {
    timerWorkerRef.current?.postMessage({
      type: 'PAUSE',
      mode,
    });
    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));
    setCompletionGuard(false);

    // 清理 timeout
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }

    let nextMode: TimerMode;

    if (mode === 'focus') {
      nextMode = 'break';
    } else if (mode === 'break') {
      if (pomodoroCycle >= POMODORO_CYCLE_COUNT) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'focus';
      }
    } else {
      nextMode = 'focus';
    }

    if (mode === 'longBreak') {
      setPomodoroCycle(1);
    } else if (mode === 'break') {
      // 使用函数式更新确保获取最新的周期值
      setPomodoroCycle((prev) => prev + 1);
    }

    const initialTime =
      nextMode === 'focus'
        ? getFocusTime()
        : nextMode === 'break'
        ? getBreakTime()
        : getLongBreakTime();

    // 先更新状态，再保存到 localStorage
    setTimeLeftForMode((prev) => {
      const newState = { ...prev, [nextMode]: initialTime };

      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, nextMode);
        localStorage.setItem(STORAGE_KEYS.TIME_LEFT_FOCUS, String(newState.focus));
        localStorage.setItem(STORAGE_KEYS.TIME_LEFT_BREAK, String(newState.break));
        localStorage.setItem(STORAGE_KEYS.TIME_LEFT_LONG_BREAK, String(newState.longBreak));
      } catch (error) {
        console.error('Failed to save time left and current mode:', error);
      }

      return newState;
    });

    timerWorkerRef.current?.postMessage({
      type: 'SET_TIME',
      mode: nextMode,
      time: initialTime,
    });

    setMode(nextMode);
  };

  /**
   * 手动切换模式
   * 用户点击模式按钮时调用
   * @param newMode - 目标模式
   */
  const handleManualModeToggle = (newMode: TimerMode) => {
    // 停止当前模式计时器
    timerWorkerRef.current?.postMessage({
      type: 'PAUSE',
      mode: mode,
    });
    setIsRunningForMode((prev) => ({ ...prev, [mode]: false }));

    // 清理 timeout
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }

    // 重置保护标志（不重置周期计数，让用户可以继续累积周期）
    setCompletionGuard(false);

    // 获取新模式完整时间
    const newModeTime = newMode === 'focus' ? getFocusTime()
      : newMode === 'break' ? getBreakTime()
      : getLongBreakTime();

    // 更新时间
    setTimeLeftForMode((prev) => ({ ...prev, [newMode]: newModeTime }));

    // 通知 Worker
    timerWorkerRef.current?.postMessage({
      type: 'SET_TIME',
      mode: newMode,
      time: newModeTime,
    });

    // 切换模式
    setMode(newMode);

    // 保存到 localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newMode);
      const timeKey = newMode === 'focus' ? STORAGE_KEYS.TIME_LEFT_FOCUS
        : newMode === 'break' ? STORAGE_KEYS.TIME_LEFT_BREAK
        : STORAGE_KEYS.TIME_LEFT_LONG_BREAK;
      localStorage.setItem(timeKey, String(newModeTime));
    } catch (error) {
      console.error('Failed to save mode and time:', error);
    }
  };

  /**
   * 处理时间设置变化
   * 用户在设置面板修改时间时调用
   * @param timeType - 时间类型（focus/break/longBreak）
   * @param minutes - 新的时间（分钟）
   */
  const handleTimeChange = (timeType: TimerMode, minutes: number) => {
    const newTime = Math.max(1, Math.min(120, minutes)) * 60;

    if (timeType === 'focus') {
      setCustomFocusTime(newTime);
      setTimeLeftForMode((prev) => ({ ...prev, [timeType]: newTime }));

      timerWorkerRef.current?.postMessage({
        type: 'SET_TIME',
        mode: timeType,
        time: newTime,
      });

      setCompletionGuard(false);
    } else if (timeType === 'break') {
      setCustomBreakTime(newTime);
      setTimeLeftForMode((prev) => ({ ...prev, [timeType]: newTime }));

      timerWorkerRef.current?.postMessage({
        type: 'SET_TIME',
        mode: timeType,
        time: newTime,
      });

      setCompletionGuard(false);
    } else if (timeType === 'longBreak') {
      setCustomLongBreakTime(newTime);
      setTimeLeftForMode((prev) => ({ ...prev, [timeType]: newTime }));

      timerWorkerRef.current?.postMessage({
        type: 'SET_TIME',
        mode: timeType,
        time: newTime,
      });

      setCompletionGuard(false);
    }
  };

  /**
   * 清除所有缓存
   * 清除所有 localStorage 中的番茄钟数据，并重置为默认状态
   */
  const handleClearCache = () => {
    if (window.confirm('确定要清除所有缓存吗？这将删除所有设置和数据，此操作不可撤销。')) {
      try {
        // 清除所有 tomato- 开头的 localStorage 项
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('tomato-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // 重置所有状态为默认值
        setCustomFocusTime(DEFAULT_FOCUS_TIME);
        setCustomBreakTime(DEFAULT_BREAK_TIME);
        setCustomLongBreakTime(DEFAULT_LONG_BREAK_TIME);
        setAutoSwitch(true);
        setAutoStart(true);
        setPomodoroCycle(1);
        setMode('focus');

        // 重置时间状态
        setTimeLeftForMode({
          focus: DEFAULT_FOCUS_TIME,
          break: DEFAULT_BREAK_TIME,
          longBreak: DEFAULT_LONG_BREAK_TIME
        });
        setIsRunningForMode({
          focus: false,
          break: false,
          longBreak: false
        });

        sendNotification('缓存已清除', '所有数据已重置为默认状态');
        console.log('✓ All cache cleared successfully');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  };

// JSX 渲染

const displayTime = timeLeftForMode[mode];
const displayIsRunning = isRunningForMode[mode];

  const { radius, circumference, offset } = getProgressParams();

  const modeColors = {
    focus: { primary: '#7A918D', bright: '#8FA398', glow: 'rgba(122,145,141,0.3)' },
    break: { primary: '#C4A77D', bright: '#D4B896', glow: 'rgba(196,167,125,0.3)' },
    longBreak: { primary: '#6A6A6A', bright: '#7A7A7A', glow: 'rgba(106,106,106,0.3)' },
  };

  const themeColor = modeColors[mode];

  return (
    <ThemeProvider theme={createZenTheme(themeMode)}>
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
            PomoZen
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        {/* 模式切换按钮组 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ButtonGroup variant="outlined" sx={{ bgcolor: 'rgba(44,44,44,0.03)', borderRadius: 2, '& .MuiButtonGroup-grouped': { borderColor: 'rgba(44,44,44,0.08)' } }}>
            <Button
              onClick={() => mode !== 'focus' && handleManualModeToggle('focus')}
              sx={{
                minWidth: 100,
                borderRadius: 2,
                bgcolor: mode === 'focus' ? themeColor.primary : 'transparent',
                color: '#3d3d3d',
                borderColor: mode === 'focus' ? 'transparent' : 'rgba(44,44,44,0.08)',
                '&:hover': {
                  bgcolor: mode === 'focus' ? themeColor.primary : 'rgba(44,44,44,0.05)',
                },
              }}
            >
              专注
            </Button>
            <Button
              onClick={() => mode !== 'break' && handleManualModeToggle('break')}
              sx={{
                minWidth: 100,
                borderRadius: 2,
                bgcolor: mode === 'break' ? modeColors.break.primary : 'transparent',
                color: '#3d3d3d',
                borderColor: mode === 'break' ? 'transparent' : 'rgba(44,44,44,0.08)',
                '&:hover': {
                  bgcolor: mode === 'break' ? modeColors.break.primary : 'rgba(44,44,44,0.05)',
                },
              }}
            >
              短休息
            </Button>
            <Button
              onClick={() => mode !== 'longBreak' && handleManualModeToggle('longBreak')}
              sx={{
                minWidth: 100,
                borderRadius: 2,
                bgcolor: mode === 'longBreak' ? modeColors.longBreak.primary : 'transparent',
                color: '#3d3d3d',
                borderColor: mode === 'longBreak' ? 'transparent' : 'rgba(44,44,44,0.08)',
                '&:hover': {
                  bgcolor: mode === 'longBreak' ? modeColors.longBreak.primary : 'rgba(44,44,44,0.05)',
                },
              }}
            >
              长休息
            </Button>
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
            border: '1px solid rgba(44,44,44,0.08)',
            overflow: 'visible',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(to bottom, rgba(44,44,44,0.12), transparent)',
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
                  stroke="rgba(44,44,44,0.08)"
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
                   {formatTime(displayTime)}
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
            <Tooltip title={displayIsRunning ? '暂停 (空格)' : '开始 (空格)'} arrow TransitionComponent={Zoom}>
              <Button
                variant="contained"
                size="large"
                onClick={handleStartPause}
                startIcon={displayIsRunning ? <PauseIcon /> : <PlayArrowIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: themeColor.primary,
                  '&:hover': { bgcolor: themeColor.bright },
                }}
              >
                {displayIsRunning ? '暂停' : '开始'}
              </Button>
            </Tooltip>
            <Tooltip title="跳过" arrow TransitionComponent={Zoom}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleSkip}
                startIcon={<SkipNextIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: themeColor.primary,
                  color: themeColor.primary,
                  '&:hover': { borderColor: themeColor.bright, bgcolor: `${themeColor.primary}15` },
                }}
              >
                跳过
              </Button>
            </Tooltip>
            <Tooltip title="重置" arrow TransitionComponent={Zoom}>
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

        {/* 快捷键、专注统计、运行状态横向排布 */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* 键盘快捷键提示 */}
          <Card elevation={0} sx={{ borderRadius: 4, bgcolor: 'rgba(44,44,44,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(44,44,44,0.08)', flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <KeyboardIcon sx={{ color: '#2C2C2C', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#2C2C2C', fontWeight: 500 }}>
                  快捷键
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Chip label="空格 开始/暂停" size="small" sx={{ bgcolor: 'rgba(44,44,44,0.1)', color: '#2C2C2C', fontSize: '0.75rem', border: '1px solid rgba(44,44,44,0.08)' }} />
                <Chip label="Esc 关闭设置" size="small" sx={{ bgcolor: 'rgba(44,44,44,0.1)', color: '#2C2C2C', fontSize: '0.75rem', border: '1px solid rgba(44,44,44,0.08)' }} />
              </Box>
            </CardContent>
          </Card>

          {/* 统计信息卡片 */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              bgcolor: 'rgba(44,44,44,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(44,44,44,0.08)',
              flex: 1,
              minWidth: { xs: '100%', sm: '200px' },
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.12)',
                transform: 'translateY(-2px)',
              }
            }}
            onClick={() => setShowStatsDialog(true)}
          >
            <CardContent sx={{ py: 2 }}>
              {/* 第一行：标题居中 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#2C2C2C', fontWeight: 500 }}>
                  📊 专注统计
                </Typography>
              </Box>
              {/* 第二行：总专注次数 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Chip
                  label={`总记录: ${focusHistory.size} 天`}
                  size="small"
                  sx={{
                    bgcolor: modeColors.focus.primary,
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(44,44,44,0.08)',
                    fontWeight: 500,
                  }}
                />
              </Box>
              {/* 第三行：详细信息控件居中 */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Chip
                  label="查看统计"
                  sx={{
                    height: 28,
                    fontSize: '0.8rem',
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* 运行状态面板 */}
          <Card elevation={0} sx={{ borderRadius: 4, bgcolor: 'rgba(44,44,44,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(44,44,44,0.08)', flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ color: '#2C2C2C', fontWeight: 500 }}>
                  运行状态
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip
                  label={isRunningForMode.focus ? '专注运行中' : '专注停止'}
                  size="small"
                  sx={{
                    bgcolor: isRunningForMode.focus ? modeColors.focus.primary : 'rgba(44,44,44,0.1)',
                    color: isRunningForMode.focus ? '#ffffff' : '#2C2C2C',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(44,44,44,0.08)',
                  }}
                />
                <Chip
                  label={isRunningForMode.break ? '短休息运行中' : '短休息停止'}
                  size="small"
                  sx={{
                    bgcolor: isRunningForMode.break ? modeColors.break.primary : 'rgba(44,44,44,0.1)',
                    color: isRunningForMode.break ? '#ffffff' : '#2C2C2C',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(44,44,44,0.08)',
                  }}
                />
                <Chip
                  label={isRunningForMode.longBreak ? '长休息运行中' : '长休息停止'}
                  size="small"
                  sx={{
                    bgcolor: isRunningForMode.longBreak ? modeColors.longBreak.primary : 'rgba(44,44,44,0.1)',
                    color: isRunningForMode.longBreak ? '#ffffff' : '#2C2C2C',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(44,44,44,0.08)',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* 设置按钮 */}
      <Fab
        onClick={() => setShowSettings(!showSettings)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'rgba(44,44,44,0.1)',
          color: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(44,44,44,0.08)',
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
            <Typography variant="h6" component="div" sx={{ color: '#7A918D', flex: 1, textAlign: 'center' }}>
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

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {soundEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
                  <Typography variant="body2">启用通知声音</Typography>
                </Box>
                <Switch
                  checked={soundEnabled}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setSoundEnabled(newValue);
                    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(newValue));
                  }}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">自动跳过通知</Typography>
                <Switch
                  checked={autoSkipNotification}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setAutoSkipNotification(newValue);
                    localStorage.setItem(STORAGE_KEYS.AUTO_SKIP_NOTIFICATION, String(newValue));
                  }}
                  size="small"
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VolumeUpIcon />}
                onClick={() => sendNotification('测试通知', '这是一个测试通知')}
                sx={{ borderRadius: 3 }}
              >
                测试通知
              </Button>
            </Stack>

            {/* 外观设置部分 */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: themeColor.primary, fontWeight: 600 }}>
              🎨 外观设置
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {themePreference === 'dark' ? <Brightness4Icon fontSize="small" /> :
                   themePreference === 'light' ? <Brightness7Icon fontSize="small" /> : <BrightnessAutoIcon fontSize="small" />}
                  <Typography variant="body2">
                    {themePreference === 'dark' ? '暗色模式' :
                     themePreference === 'light' ? '浅色模式' : '跟随系统'}
                  </Typography>
                </Box>
                <ButtonGroup size="small" sx={{ bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.03)', borderRadius: 2 }}>
                  <Button
                    onClick={() => setThemePreference('light')}
                    sx={{
                      borderRadius: 2,
                      bgcolor: themePreference === 'light' ? themeColor.primary : 'transparent',
                      color: themePreference === 'light' ? '#ffffff' : (themeMode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(44,44,44,0.6)'),
                      minWidth: 60,
                    }}
                  >
                    浅色
                  </Button>
                  <Button
                    onClick={() => setThemePreference('system')}
                    sx={{
                      borderRadius: 2,
                      bgcolor: themePreference === 'system' ? themeColor.primary : 'transparent',
                      color: themePreference === 'system' ? '#ffffff' : (themeMode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(44,44,44,0.6)'),
                      minWidth: 60,
                    }}
                  >
                    跟随
                  </Button>
                  <Button
                    onClick={() => setThemePreference('dark')}
                    sx={{
                      borderRadius: 2,
                      bgcolor: themePreference === 'dark' ? themeColor.primary : 'transparent',
                      color: themePreference === 'dark' ? '#ffffff' : (themeMode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(44,44,44,0.6)'),
                      minWidth: 60,
                    }}
                  >
                    暗色
                  </Button>
                </ButtonGroup>
              </Box>
            </Stack>

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

            {/* 清除缓存部分 */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: themeColor.primary, fontWeight: 600 }}>
              🗑️ 数据管理
            </Typography>

            <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'action.hover' }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  清除所有本地缓存数据，包括设置、统计记录和历史数据
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  onClick={handleClearCache}
                  sx={{ borderRadius: 3, borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#ffffff' } }}
                >
                  清除所有缓存
                </Button>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}

      {showStatsDialog && (
        <Dialog
          open={showStatsDialog}
          onClose={() => setShowStatsDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: 'background.paper',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              📈 专注趋势分析
            </Typography>
            <IconButton
              onClick={() => setShowStatsDialog(false)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ pt: 2 }}>
            {/* 控制面板 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
              {/* 视图切换 */}
              <ButtonGroup size="small" sx={{ bgcolor: 'rgba(44,44,44,0.03)', borderRadius: 2 }}>
                <Button
                  onClick={() => setChartViewMode('daily')}
                  sx={{
                    borderRadius: 2,
                    bgcolor: chartViewMode === 'daily' ? modeColors.focus.primary : 'transparent',
                    color: chartViewMode === 'daily' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                    '&:hover': {
                      bgcolor: chartViewMode === 'daily' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                    },
                  }}
                >
                  每日视图
                </Button>
                <Button
                  onClick={() => setChartViewMode('weekly')}
                  sx={{
                    borderRadius: 2,
                    bgcolor: chartViewMode === 'weekly' ? modeColors.focus.primary : 'transparent',
                    color: chartViewMode === 'weekly' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                    '&:hover': {
                      bgcolor: chartViewMode === 'weekly' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                    },
                  }}
                >
                  每周视图
                </Button>
                <Button
                  onClick={() => setChartViewMode('monthly')}
                  sx={{
                    borderRadius: 2,
                    bgcolor: chartViewMode === 'monthly' ? modeColors.focus.primary : 'transparent',
                    color: chartViewMode === 'monthly' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                    '&:hover': {
                      bgcolor: chartViewMode === 'monthly' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                    },
                  }}
                >
                  每月视图
                </Button>
              </ButtonGroup>

              {/* 数据指标切换 */}
              <ButtonGroup size="small" sx={{ bgcolor: 'rgba(44,44,44,0.03)', borderRadius: 2 }}>
                <Button
                  onClick={() => setDataMetric('duration')}
                  sx={{
                    borderRadius: 2,
                    bgcolor: dataMetric === 'duration' ? modeColors.focus.primary : 'transparent',
                    color: dataMetric === 'duration' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                    fontSize: '0.8rem',
                    '&:hover': {
                      bgcolor: dataMetric === 'duration' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                    },
                  }}
                >
                  时长
                </Button>
                <Button
                  onClick={() => setDataMetric('count')}
                  sx={{
                    borderRadius: 2,
                    bgcolor: dataMetric === 'count' ? modeColors.focus.primary : 'transparent',
                    color: dataMetric === 'count' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                    fontSize: '0.8rem',
                    '&:hover': {
                      bgcolor: dataMetric === 'count' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                    },
                  }}
                >
                  次数
                </Button>
                <Button
                  onClick={() => setDataMetric('average')}
                  sx={{
                    borderRadius: 2,
                    bgcolor: dataMetric === 'average' ? modeColors.focus.primary : 'transparent',
                    color: dataMetric === 'average' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                    fontSize: '0.8rem',
                    '&:hover': {
                      bgcolor: dataMetric === 'average' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                    },
                  }}
                >
                  平均
                </Button>
              </ButtonGroup>

              {/* 时间范围选择 */}
              <ButtonGroup size="small" sx={{ bgcolor: 'rgba(44,44,44,0.03)', borderRadius: 2 }}>
                {(['7days', '30days', '90days', 'all'] as TimeRange[]).map((range) => (
                  <Button
                    key={range}
                    onClick={() => setChartTimeRange(range)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: chartTimeRange === range ? modeColors.focus.primary : 'transparent',
                      color: chartTimeRange === range ? '#ffffff' : 'rgba(44,44,44,0.6)',
                      fontSize: '0.8rem',
                      '&:hover': {
                        bgcolor: chartTimeRange === range ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                      },
                    }}
                  >
                    {range === '7days' ? '7天' : range === '30days' ? '30天' : range === '90days' ? '90天' : '全部'}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>

            {/* 统计摘要卡片 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  bgcolor: 'rgba(122,145,141,0.08)',
                  borderColor: 'rgba(122,145,141,0.25)'
                }}
              >
                <CardContent sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    选定范围内总时长
                  </Typography>
                  <Typography variant="h5" color={modeColors.focus.primary} fontWeight={600}>
                    {(() => {
                      const totalSeconds = getFilteredHistory().reduce((sum, r) => sum + r.totalDuration, 0);
                      const minutes = Math.floor(totalSeconds / 60);
                      return `${minutes}分钟`;
                    })()}
                  </Typography>
                </CardContent>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  bgcolor: 'rgba(44,44,44,0.03)',
                  borderColor: 'rgba(44,44,44,0.08)'
                }}
              >
                <CardContent sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    选定范围内专注次数
                  </Typography>
                  <Typography variant="h5" fontWeight={600} sx={{ color: '#7A8B8B' }}>
                    {getFilteredHistory().reduce((sum, r) => sum + r.sessionCount, 0)}次
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* 图表区域 */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(44,44,44,0.08)',
                mb: 3
              }}
            >
              <CardContent>
                <Box sx={{ height: 300, width: '100%' }}>
                  {chartViewMode === 'daily' ? (
                    <DailyLineChart data={getDailyChartData()} metric={dataMetric} />
                  ) : chartViewMode === 'weekly' ? (
                    <WeeklyBarChart data={getWeeklyChartData()} metric={dataMetric} />
                  ) : (
                    <MonthlyLineChart data={getMonthlyChartData()} metric={dataMetric} />
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* 时段分布热力图 */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(44,44,44,0.08)',
                mb: 3
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#7A8B8B' }}>
                  🕐 时段分布（24小时）
                </Typography>
                <TimeDistributionHeatmap
                  data={(() => {
                    const hourlyData: { hour: number; duration: number; count: number }[] = [];
                    const hourlyDist = new Array(24).fill(0);

                    getFilteredHistory().forEach(record => {
                      if (record.hourlyDistribution) {
                        record.hourlyDistribution.forEach((duration, hour) => {
                          hourlyDist[hour] += duration;
                        });
                      }
                    });

                    for (let i = 0; i < 24; i++) {
                      hourlyData.push({
                        hour: i,
                        duration: Math.round(hourlyDist[i] / 60), // 转换为分钟
                        count: Math.round(hourlyDist[i] / (customFocusTime / 60)) // 粗略估算次数
                      });
                    }

                    return hourlyData;
                  })()}
                />
              </CardContent>
            </Card>

            {/* 数据为空提示 */}
            {getFilteredHistory().length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  暂无数据，开始你的第一次专注吧！
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* 通知弹窗 */}
      <Dialog
        open={notificationDialog.open}
        onClose={() => {
          setNotificationDialog(prev => ({ ...prev, open: false }));
          executeModeSwitch();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 3, minWidth: 300 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: modeColors[mode].primary }}>
            {notificationDialog.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {notificationDialog.message}
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => {
                setNotificationDialog(prev => ({ ...prev, open: false }));
                executeModeSwitch();
              }}
              sx={{
                borderRadius: 2,
                bgcolor: modeColors[mode].primary,
                '&:hover': { bgcolor: modeColors[mode].bright },
                minWidth: 80,
              }}
            >
              知道了
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
