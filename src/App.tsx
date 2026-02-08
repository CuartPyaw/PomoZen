/**
 * PomoZen - 番茄钟应用
 *
 * 一个基于番茄工作法（Pomodoro Technique）的计时器应用
 * 支持专注、短休息、长休息三种模式，可自定义时间长度
 * 具备自动切换、桌面通知、本地存储等功能
 *
 * @module App
 * @version 2.0.0
 */

import { useEffect, useRef, memo, useMemo, useCallback } from 'react';
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
  DialogActions,
  IconButton,
  Tooltip,
  Zoom,
  ThemeProvider,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CssBaseline from '@mui/material/CssBaseline';

import type { TimerMode } from './types/worker';
import type { TimeRange } from './types/statistics';
import {
  DailyLineChart,
  WeeklyBarChart,
  MonthlyLineChart,
  TimeDistributionHeatmap,
} from './components/Charts';

// Custom hooks
import { useTheme } from './hooks/useTheme';
import { useSettings } from './hooks/useSettings';
import { useStatistics } from './hooks/useStatistics';
import { useNotifications } from './hooks/useNotifications';
import { useTimer } from './hooks/useTimer';

import { Logger } from './utils/logger';

import './styles/background.css';

// 常量配置
const POMODORO_CYCLE_COUNT = 5;

// 计时器圆形进度条配置
const TIMER_CIRCLE_CONFIG = {
  RADIUS: 123,              // 圆环半径
  STROKE_WIDTH: 12,         // 线条宽度
  SVG_WIDTH: 270,           // SVG 宽度
  SVG_HEIGHT: 260,          // SVG 高度
  CIRCLE_CENTER_X: 130,     // 圆心 X 坐标
  CIRCLE_CENTER_Y: 130,     // 圆心 Y 坐标
} as const;

// 模式颜色配置
const MODE_COLORS = {
  focus: {
    primary: '#7A918D',
    bright: '#8FA398',
    glow: 'rgba(122,145,141,0.3)',
  },
  break: {
    primary: '#C4A77D',
    bright: '#D4B896',
    glow: 'rgba(196,167,125,0.3)',
  },
  longBreak: {
    primary: '#6A6A6A',
    bright: '#7A7A7A',
    glow: 'rgba(106,106,106,0.3)',
  },
} as const;

/**
 * PomoZen 主组件
 *
 * 使用自定义 Hooks 组织代码，提供清晰的职责分离
 *
 * @returns JSX 元素
 */
function App() {
  // ==================== Custom Hooks ====================

  // 主题管理
  const { theme, themeMode, themePreference, setThemePreference } = useTheme();

  // 设置管理
  const settings = useSettings();

  // 统计数据管理
  const statistics = useStatistics();

  // 通知管理
  const notifications = useNotifications(
    settings.soundEnabled,
    settings.autoSkipNotification
  );

  // 计时器核心逻辑 - 需要在通知之前定义，因为通知需要引用计时器的完成回调
  const timer = useTimer(
    {
      autoSwitch: settings.autoSwitch,
      autoStart: settings.autoStart,
      customFocusTime: settings.customFocusTime,
      customBreakTime: settings.customBreakTime,
      customLongBreakTime: settings.customLongBreakTime,
    },
    handleTimerComplete
  );

  // ==================== 计时器完成处理 ====================

  /**
   * 最近完成的模式（用于在通知关闭后触发模式切换）
   */
  const lastCompletedModeRef = useRef<TimerMode | null>(null);

  /**
   * 计时器完成时的处理逻辑
   */
  function handleTimerComplete(completedMode: TimerMode, completedDuration: number) {
    lastCompletedModeRef.current = completedMode;

    // 发送通知
    if (completedMode === 'focus') {
      notifications.sendNotification('专注结束', '时间到了！该休息一下了');
      // 使用实际完成的时长（秒）
      statistics.updateTodayFocusRecord(completedDuration);
    } else if (completedMode === 'break') {
      notifications.sendNotification('休息结束', '休息完成！开始专注吧');
    } else if (completedMode === 'longBreak') {
      notifications.sendNotification('长休息结束', '休息完成！开始新的番茄钟周期');
    }

    // 如果启用自动跳过通知，立即执行模式切换
    if (settings.autoSkipNotification) {
      timer.handleTimerComplete(completedMode);
    }
  }

  /**
   * 执行模式切换（当通知弹窗关闭时调用）
   */
  function executeModeSwitch() {
    const completedMode = lastCompletedModeRef.current;
    if (!completedMode) return;

    lastCompletedModeRef.current = null;
    timer.executeModeSwitch(completedMode);
  }

  // ==================== 键盘快捷键 ====================

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果统计对话框打开且按了 Esc，关闭统计对话框
      if (statistics.showStatsDialog && e.key === 'Escape') {
        statistics.setShowStatsDialog(false);
        return;
      }

      // 如果设置窗口打开且按了 Esc，关闭设置窗口
      if (settings.showSettings && e.key === 'Escape') {
        settings.setShowSettings(false);
        return;
      }

      // 如果设置窗口或统计对话框打开，阻止其他快捷键
      if (settings.showSettings || statistics.showStatsDialog) {
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
          timer.handleStartPause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [settings.showSettings, statistics.showStatsDialog, timer, statistics, settings]);

  // ==================== UI 辅助函数 ====================

  /**
   * 格式化剩余时间为 MM:SS 格式
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 获取当前模式的中文标签
   */

  /**
   * 获取当前模式的中文标签
   */
  const getModeLabel = () => {
    switch (timer.mode) {
      case 'focus': return '专注时间';
      case 'break': return '短休息';
      case 'longBreak': return '长休息';
    }
  };

  /**
   * 获取番茄钟周期信息
   */
  const getCycleInfo = () => {
    if (timer.mode === 'longBreak') {
      return '长休息';
    }
    return `番茄钟周期: ${timer.pomodoroCycle}/${POMODORO_CYCLE_COUNT}`;
  };

  // ==================== 渲染数据 ====================

  const displayTime = timer.timeLeftForMode[timer.mode];
  const displayIsRunning = timer.isRunningForMode[timer.mode];
  const themeColor = MODE_COLORS[timer.mode];

  // 使用 useMemo 确保环形进度在时间变化时重新计算
  const { circumference, offset } = useMemo(() => {
    const totalTime = timer.mode === 'focus' ? timer.getFocusTime()
      : timer.mode === 'break' ? timer.getBreakTime()
      : timer.getLongBreakTime();
    const timeLeft = timer.timeLeftForMode[timer.mode];

    // 边界检查
    if (totalTime <= 0) {
      Logger.error('Total time is invalid', { totalTime, mode: timer.mode });
      return { circumference: 2 * Math.PI * TIMER_CIRCLE_CONFIG.RADIUS, offset: 2 * Math.PI * TIMER_CIRCLE_CONFIG.RADIUS };
    }

    const circumference = 2 * Math.PI * TIMER_CIRCLE_CONFIG.RADIUS;
    const progress = Math.max(0, Math.min(1, timeLeft / totalTime));
    const offset = circumference * (1 - progress);

    // 调试日志
    Logger.debug('Ring progress calculated', {
      mode: timer.mode,
      timeLeft,
      totalTime,
      progress: progress.toFixed(3),
      offset: offset.toFixed(2)
    });

    return { circumference, offset };
  }, [timer.mode, timer.timeLeftForMode[timer.mode], timer.getFocusTime, timer.getBreakTime, timer.getLongBreakTime]);

  // ==================== JSX 渲染 ====================

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
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
            <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
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

              {/* 主题切换按钮 - 右上角 */}
              <Tooltip title={themePreference === 'light' ? '浅色模式' : themePreference === 'dark' ? '暗色模式' : '跟随系统'} arrow TransitionComponent={Zoom}>
                <IconButton
                  onClick={() => {
                    const cycle = ['light', 'dark', 'system'];
                    const currentIndex = cycle.indexOf(themePreference);
                    const nextMode = cycle[(currentIndex + 1) % cycle.length];
                    setThemePreference(nextMode as 'light' | 'dark' | 'system');
                  }}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 48,
                    height: 48,
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      color: themeColor.primary,
                    },
                  }}
                  aria-label="切换主题"
                >
                  {themePreference === 'light' && <Brightness7Icon />}
                  {themePreference === 'dark' && <Brightness4Icon />}
                  {themePreference === 'system' && <BrightnessAutoIcon />}
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
            {/* 模式切换按钮组 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ButtonGroup variant="outlined" sx={{ bgcolor: 'rgba(44,44,44,0.03)', borderRadius: 2, '& .MuiButtonGroup-grouped': { borderColor: 'rgba(44,44,44,0.08)' } }}>
                <Button
                  onClick={() => timer.mode !== 'focus' && timer.handleManualModeToggle('focus')}
                  sx={{
                    minWidth: 100,
                    borderRadius: 2,
                    bgcolor: timer.mode === 'focus' ? themeColor.primary : 'transparent',
                    color: '#3d3d3d',
                    borderColor: timer.mode === 'focus' ? 'transparent' : 'rgba(44,44,44,0.08)',
                    '&:hover': {
                      bgcolor: timer.mode === 'focus' ? themeColor.primary : 'rgba(44,44,44,0.05)',
                    },
                  }}
                >
                  专注
                </Button>
                <Button
                  onClick={() => timer.mode !== 'break' && timer.handleManualModeToggle('break')}
                  sx={{
                    minWidth: 100,
                    borderRadius: 2,
                    bgcolor: timer.mode === 'break' ? MODE_COLORS.break.primary : 'transparent',
                    color: '#3d3d3d',
                    borderColor: timer.mode === 'break' ? 'transparent' : 'rgba(44,44,44,0.08)',
                    '&:hover': {
                      bgcolor: timer.mode === 'break' ? MODE_COLORS.break.primary : 'rgba(44,44,44,0.05)',
                    },
                  }}
                >
                  短休息
                </Button>
                <Button
                  onClick={() => timer.mode !== 'longBreak' && timer.handleManualModeToggle('longBreak')}
                  sx={{
                    minWidth: 100,
                    borderRadius: 2,
                    bgcolor: timer.mode === 'longBreak' ? MODE_COLORS.longBreak.primary : 'transparent',
                    color: '#3d3d3d',
                    borderColor: timer.mode === 'longBreak' ? 'transparent' : 'rgba(44,44,44,0.08)',
                    '&:hover': {
                      bgcolor: timer.mode === 'longBreak' ? MODE_COLORS.longBreak.primary : 'rgba(44,44,44,0.05)',
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
                  <svg width={TIMER_CIRCLE_CONFIG.SVG_WIDTH} height={TIMER_CIRCLE_CONFIG.SVG_HEIGHT} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx={TIMER_CIRCLE_CONFIG.CIRCLE_CENTER_X}
                      cy={TIMER_CIRCLE_CONFIG.CIRCLE_CENTER_Y}
                      r={TIMER_CIRCLE_CONFIG.RADIUS}
                      fill="none"
                      stroke="rgba(44,44,44,0.08)"
                      strokeWidth={TIMER_CIRCLE_CONFIG.STROKE_WIDTH}
                    />
                    <circle
                      cx={TIMER_CIRCLE_CONFIG.CIRCLE_CENTER_X}
                      cy={TIMER_CIRCLE_CONFIG.CIRCLE_CENTER_Y}
                      r={TIMER_CIRCLE_CONFIG.RADIUS}
                      fill="none"
                      stroke={themeColor.primary}
                      strokeWidth={TIMER_CIRCLE_CONFIG.STROKE_WIDTH}
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
                    {settings.autoSwitch && (
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
                    onClick={timer.handleStartPause}
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
                    onClick={timer.handleSkip}
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
                    onClick={timer.handleReset}
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
              <Card elevation={0} sx={{ borderRadius: 4, bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.03)', backdropFilter: 'blur(10px)', border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)', flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <KeyboardIcon sx={{ color: themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C', fontWeight: 500 }}>
                      快捷键
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Chip label="空格 开始/暂停" size="small" sx={{ bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,44,44,0.1)', color: themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C', fontSize: '0.75rem', border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)' }} />
                    <Chip label="Esc 关闭设置" size="small" sx={{ bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,44,44,0.1)', color: themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C', fontSize: '0.75rem', border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)' }} />
                  </Box>
                </CardContent>
              </Card>

              {/* 统计信息卡片 */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)',
                  flex: 1,
                  minWidth: { xs: '100%', sm: '200px' },
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)',
                    transform: 'translateY(-2px)',
                  }
                }}
                onClick={() => statistics.setShowStatsDialog(true)}
              >
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C', fontWeight: 500 }}>
                      📊 专注统计
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Chip
                      label={`总记录: ${statistics.focusHistory.size} 天`}
                      size="small"
                      sx={{
                        bgcolor: MODE_COLORS.focus.primary,
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
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
              <Card elevation={0} sx={{ borderRadius: 4, bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.03)', backdropFilter: 'blur(10px)', border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)', flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C', fontWeight: 500 }}>
                      运行状态
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={timer.isRunningForMode.focus ? '专注运行中' : '专注停止'}
                      size="small"
                      sx={{
                        bgcolor: timer.isRunningForMode.focus ? MODE_COLORS.focus.primary : (themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,44,44,0.1)'),
                        color: timer.isRunningForMode.focus ? '#ffffff' : (themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C'),
                        fontSize: '0.75rem',
                        border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)',
                      }}
                    />
                    <Chip
                      label={timer.isRunningForMode.break ? '短休息运行中' : '短休息停止'}
                      size="small"
                      sx={{
                        bgcolor: timer.isRunningForMode.break ? MODE_COLORS.break.primary : (themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,44,44,0.1)'),
                        color: timer.isRunningForMode.break ? '#ffffff' : (themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C'),
                        fontSize: '0.75rem',
                        border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)',
                      }}
                    />
                    <Chip
                      label={timer.isRunningForMode.longBreak ? '长休息运行中' : '长休息停止'}
                      size="small"
                      sx={{
                        bgcolor: timer.isRunningForMode.longBreak ? MODE_COLORS.longBreak.primary : (themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,44,44,0.1)'),
                        color: timer.isRunningForMode.longBreak ? '#ffffff' : (themeMode === 'dark' ? '#F0ECE5' : '#2C2C2C'),
                        fontSize: '0.75rem',
                        border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Container>

          {/* 设置按钮 */}
          <Fab
            onClick={() => settings.setShowSettings(!settings.showSettings)}
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

          {/* 设置对话框 */}
          {settings.showSettings && (
            <MemoizedSettingsDialog
              open={settings.showSettings}
              onClose={() => settings.setShowSettings(false)}
              settings={settings}
              timer={timer}
              onTestNotification={() => notifications.sendNotification('测试通知', '这是一个测试通知')}
            />
          )}

          {/* 统计对话框 */}
          {statistics.showStatsDialog && (
            <MemoizedStatsDialog
              open={statistics.showStatsDialog}
              onClose={() => statistics.setShowStatsDialog(false)}
              statistics={statistics}
              settings={settings}
              modeColors={MODE_COLORS}
            />
          )}

          {/* 通知弹窗 */}
          <MemoizedNotificationDialog
            open={notifications.notificationDialog.open}
            title={notifications.notificationDialog.title}
            message={notifications.notificationDialog.message}
            onClose={() => {
              notifications.handleNotificationClose();
              executeModeSwitch();
            }}
            mode={timer.mode}
            modeColors={MODE_COLORS}
          />
        </Box>
      </ThemeProvider>
    </Box>
  );
}

// ==================== 子组件 ====================

/**
 * 设置对话框组件
 */
interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: ReturnType<typeof useSettings>;
  timer: ReturnType<typeof useTimer>;
  onTestNotification: () => void;
}

function SettingsDialog({
  open,
  onClose,
  settings,
  timer,
  onTestNotification,
}: SettingsDialogProps) {
  const themeColor = MODE_COLORS[timer.mode];

  // 关闭前检查是否有未保存的更改
  const handleClose = useCallback(() => {
    if (settings.hasUnsavedChanges) {
      if (window.confirm('您有未保存的设置更改，确定要关闭吗？')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [settings.hasUnsavedChanges, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ color: '#7A918D', flex: 1, textAlign: 'center' }}>
          设置
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {/* 时间设置 */}
        <Typography variant="subtitle2" sx={{ mb: 2, color: themeColor.primary, fontWeight: 600 }}>
          ⏱ 时间设置
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="专注时长"
            type="number"
            fullWidth
            size="small"
            InputProps={{ endAdornment: <Typography variant="body2" color="text.secondary">分钟</Typography> }}
            inputProps={{ min: 1, max: 120 }}
            value={settings.tempSettings.customFocusTime / 60}
            onChange={(e) => settings.handleTimeChange('focus', parseInt(e.target.value) || 25)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <TextField
            label="短休息时长"
            type="number"
            fullWidth
            size="small"
            InputProps={{ endAdornment: <Typography variant="body2" color="text.secondary">分钟</Typography> }}
            inputProps={{ min: 1, max: 120 }}
            value={settings.tempSettings.customBreakTime / 60}
            onChange={(e) => settings.handleTimeChange('break', parseInt(e.target.value) || 5)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <TextField
            label="长休息时长"
            type="number"
            fullWidth
            size="small"
            InputProps={{ endAdornment: <Typography variant="body2" color="text.secondary">分钟</Typography> }}
            inputProps={{ min: 1, max: 120 }}
            value={settings.tempSettings.customLongBreakTime / 60}
            onChange={(e) => settings.handleTimeChange('longBreak', parseInt(e.target.value) || 30)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Stack>

        {/* 自动切换设置 */}
        <Typography variant="subtitle2" sx={{ mb: 2, color: themeColor.primary, fontWeight: 600 }}>
          🔄 自动切换设置
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">启用自动切换模式</Typography>
            <Switch checked={settings.tempSettings.autoSwitch} onChange={(e) => settings.updateTempSwitch('autoSwitch', e.target.checked)} size="small" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">自动切换时自动开始计时</Typography>
            <Switch checked={settings.tempSettings.autoStart} onChange={(e) => settings.updateTempSwitch('autoStart', e.target.checked)} size="small" />
          </Box>
        </Stack>

        {/* 通知设置 */}
        <Typography variant="subtitle2" sx={{ mb: 2, color: themeColor.primary, fontWeight: 600 }}>
          🔔 通知设置
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {settings.tempSettings.soundEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
              <Typography variant="body2">启用通知声音</Typography>
            </Box>
            <Switch checked={settings.tempSettings.soundEnabled} onChange={(e) => settings.updateTempSwitch('soundEnabled', e.target.checked)} size="small" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">自动跳过通知</Typography>
            <Switch checked={settings.tempSettings.autoSkipNotification} onChange={(e) => settings.updateTempSwitch('autoSkipNotification', e.target.checked)} size="small" />
          </Box>
          <Button variant="outlined" size="small" startIcon={<VolumeUpIcon />} onClick={onTestNotification} sx={{ borderRadius: 3 }}>
            测试通知
          </Button>
        </Stack>

        {/* 循环模式说明 */}
        {settings.tempSettings.autoSwitch && (
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

        {/* 高级功能 - 调试 */}
        {settings.tempSettings.autoSwitch && (
          <Accordion
            defaultExpanded={false}
            sx={{
              boxShadow: 'none',
              '&:before': { display: 'none' },
              mt: 3,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  margin: 0,
                  py: 1,
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ color: themeColor.primary, fontWeight: 600 }}>
                高级功能
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'action.hover' }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      快速设置当前番茄周期
                    </Typography>
                    <Switch
                      checked={settings.debugModeEnabled || false}
                      onChange={(e) => settings.toggleDebugMode?.(e.target.checked)}
                      size="small"
                    />
                  </Box>
                  {settings.debugModeEnabled && (
                    <>
                      <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 1.5, fontWeight: 500 }}>
                        ⚠️ 警告：此功能仅用于测试，手动修改周期可能导致计时逻辑异常
                      </Typography>
                      <ButtonGroup variant="outlined" size="small" fullWidth>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <Button
                            key={num}
                            onClick={() => timer.setPomodoroCycle(num)}
                            sx={{
                              borderColor: timer.pomodoroCycle === num ? themeColor.primary : 'divider',
                              bgcolor: timer.pomodoroCycle === num ? alpha(themeColor.primary, 0.1) : 'transparent',
                              color: timer.pomodoroCycle === num ? themeColor.primary : 'text.primary',
                            }}
                          >
                            {num}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </>
                  )}
                </CardContent>
              </Card>
            </AccordionDetails>
          </Accordion>
        )}

        {/* 清除数据 */}
        <Typography variant="subtitle2" sx={{ mb: 2, mt: 3, color: themeColor.primary, fontWeight: 600 }}>
          🗑️ 数据管理
        </Typography>
        <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'action.hover' }}>
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              清除统计记录和历史数据（设置不受影响）
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={settings.handleClearData}
              sx={{ borderRadius: 3, borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#ffffff' } }}
            >
              清除数据
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={settings.handleResetSettings}
          color="error"
          variant="outlined"
          sx={{ borderRadius: 3 }}
        >
          重置设置
        </Button>
        <Button
          onClick={settings.handleSaveSettings}
          variant="contained"
          disabled={!settings.hasUnsavedChanges}
          sx={{
            borderRadius: 3,
            bgcolor: settings.hasUnsavedChanges ? themeColor.primary : 'action.disabled',
            color: '#ffffff',
          }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// 使用 React.memo 优化渲染
const MemoizedSettingsDialog = memo(SettingsDialog);

/**
 * 统计对话框组件
 */
interface StatsDialogProps {
  open: boolean;
  onClose: () => void;
  statistics: ReturnType<typeof useStatistics>;
  settings: ReturnType<typeof useSettings>;
  modeColors: Record<string, { primary: string; bright: string }>;
}

function StatsDialog({ open, onClose, statistics, settings, modeColors }: StatsDialogProps) {
  const filteredHistory = statistics.getFilteredHistory();

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
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
              onClick={() => statistics.setChartViewMode('daily')}
              sx={{
                borderRadius: 2,
                bgcolor: statistics.chartViewMode === 'daily' ? modeColors.focus.primary : 'transparent',
                color: statistics.chartViewMode === 'daily' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                '&:hover': {
                  bgcolor: statistics.chartViewMode === 'daily' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                },
              }}
            >
              每日视图
            </Button>
            <Button
              onClick={() => statistics.setChartViewMode('weekly')}
              sx={{
                borderRadius: 2,
                bgcolor: statistics.chartViewMode === 'weekly' ? modeColors.focus.primary : 'transparent',
                color: statistics.chartViewMode === 'weekly' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                '&:hover': {
                  bgcolor: statistics.chartViewMode === 'weekly' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                },
              }}
            >
              每周视图
            </Button>
            <Button
              onClick={() => statistics.setChartViewMode('monthly')}
              sx={{
                borderRadius: 2,
                bgcolor: statistics.chartViewMode === 'monthly' ? modeColors.focus.primary : 'transparent',
                color: statistics.chartViewMode === 'monthly' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                '&:hover': {
                  bgcolor: statistics.chartViewMode === 'monthly' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                },
              }}
            >
              每月视图
            </Button>
          </ButtonGroup>

          {/* 数据指标切换 */}
          <ButtonGroup size="small" sx={{ bgcolor: 'rgba(44,44,44,0.03)', borderRadius: 2 }}>
            <Button
              onClick={() => statistics.setDataMetric('duration')}
              sx={{
                borderRadius: 2,
                bgcolor: statistics.dataMetric === 'duration' ? modeColors.focus.primary : 'transparent',
                color: statistics.dataMetric === 'duration' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                fontSize: '0.8rem',
                '&:hover': {
                  bgcolor: statistics.dataMetric === 'duration' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                },
              }}
            >
              时长
            </Button>
            <Button
              onClick={() => statistics.setDataMetric('count')}
              sx={{
                borderRadius: 2,
                bgcolor: statistics.dataMetric === 'count' ? modeColors.focus.primary : 'transparent',
                color: statistics.dataMetric === 'count' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                fontSize: '0.8rem',
                '&:hover': {
                  bgcolor: statistics.dataMetric === 'count' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
                },
              }}
            >
              次数
            </Button>
            <Button
              onClick={() => statistics.setDataMetric('average')}
              sx={{
                borderRadius: 2,
                bgcolor: statistics.dataMetric === 'average' ? modeColors.focus.primary : 'transparent',
                color: statistics.dataMetric === 'average' ? '#ffffff' : 'rgba(44,44,44,0.6)',
                fontSize: '0.8rem',
                '&:hover': {
                  bgcolor: statistics.dataMetric === 'average' ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
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
                onClick={() => statistics.setChartTimeRange(range)}
                sx={{
                  borderRadius: 2,
                  bgcolor: statistics.chartTimeRange === range ? modeColors.focus.primary : 'transparent',
                  color: statistics.chartTimeRange === range ? '#ffffff' : 'rgba(44,44,44,0.6)',
                  fontSize: '0.8rem',
                  '&:hover': {
                    bgcolor: statistics.chartTimeRange === range ? modeColors.focus.bright : 'rgba(44,44,44,0.05)',
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
                  const totalSeconds = filteredHistory.reduce((sum, r) => sum + r.totalDuration, 0);
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
                {filteredHistory.reduce((sum, r) => sum + r.sessionCount, 0)}次
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
              {statistics.chartViewMode === 'daily' ? (
                <DailyLineChart data={statistics.getDailyChartData()} metric={statistics.dataMetric} />
              ) : statistics.chartViewMode === 'weekly' ? (
                <WeeklyBarChart data={statistics.getWeeklyChartData()} metric={statistics.dataMetric} />
              ) : (
                <MonthlyLineChart data={statistics.getMonthlyChartData()} metric={statistics.dataMetric} />
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

                filteredHistory.forEach(record => {
                  if (record.hourlyDistribution) {
                    record.hourlyDistribution.forEach((duration, hour) => {
                      hourlyDist[hour] += duration;
                    });
                  }
                });

                for (let i = 0; i < 24; i++) {
                  hourlyData.push({
                    hour: i,
                    duration: Math.round(hourlyDist[i] / 60),
                    count: Math.round(hourlyDist[i] / (settings.customFocusTime / 60))
                  });
                }

                return hourlyData;
              })()}
            />
          </CardContent>
        </Card>

        {/* 数据为空提示 */}
        {filteredHistory.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              暂无数据，开始你的第一次专注吧！
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 使用 React.memo 优化渲染
const MemoizedStatsDialog = memo(StatsDialog);

/**
 * 通知对话框组件
 */
interface NotificationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  mode: TimerMode;
  modeColors: Record<string, { primary: string; bright: string }>;
}

function NotificationDialog({ open, title, message, onClose, mode, modeColors }: NotificationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onClose}
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
  );
}

// 使用 React.memo 优化渲染
const MemoizedNotificationDialog = memo(NotificationDialog);

export default App;
