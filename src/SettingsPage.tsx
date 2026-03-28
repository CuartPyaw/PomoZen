/**
 * PomoZen 设置页面
 *
 * 包含设置和统计功能，不包含计时器
 *
 * @module SettingsPage
 * @version 2.0.0
 */

import { useEffect, useRef, memo, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Switch,
  Stack,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CssBaseline from '@mui/material/CssBaseline';

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

import './styles/background.css';

// 常量配置
const POMODORO_CYCLE_COUNT = 4;

// 模式颜色配置（使用固定的专注色）
const MODE_COLORS = {
  focus: {
    primary: '#7A918D',
    bright: '#8FA398',
    glow: 'rgba(122,145,141,0.3)',
  },
} as const;

/**
 * SettingsPage 组件
 *
 * 仅包含设置和统计功能，无计时器
 *
 * @returns JSX 元素
 */
function SettingsPage() {
  // ==================== Custom Hooks ====================

  // 主题管理
  const { theme, themeMode, themePreference, setThemePreference } = useTheme();

  // 设置管理
  const settings = useSettings();

  // 统计数据管理
  const statistics = useStatistics();

  // 通知管理（仅用于测试通知）
  const notifications = useNotifications(
    settings.soundEnabled,
    settings.autoSkipNotification
  );

  // ==================== 键盘快捷键 ====================

  const handleKeyPressRef = useRef<(e: KeyboardEvent) => void>();

  useEffect(() => {
    handleKeyPressRef.current = (e: KeyboardEvent) => {
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
    };
  }, [settings.showSettings, settings.setShowSettings, statistics.showStatsDialog, statistics.setShowStatsDialog]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => handleKeyPressRef.current?.(e);
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
                      color: MODE_COLORS.focus.primary,
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

          <Container maxWidth="sm" sx={{ flex: 1, py: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 功能入口卡片 */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: '100%', mb: 4 }}>
                {/* 统计卡片 */}
                <Card
                  elevation={0}
                  onClick={() => statistics.setShowStatsDialog(true)}
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    borderRadius: 4,
                    bgcolor: 'transparent',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(44,44,44,0.08)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: MODE_COLORS.focus.primary }}>
                      📊 专注统计
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      查看专注时长、次数和趋势分析
                    </Typography>
                  </CardContent>
                </Card>

                {/* 设置卡片 */}
                <Card
                  elevation={0}
                  onClick={() => settings.setShowSettings(true)}
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    borderRadius: 4,
                    bgcolor: 'transparent',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(44,44,44,0.08)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: MODE_COLORS.focus.primary }}>
                      ⚙️ 设置
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      配置计时器、通知和自动切换
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Container>

          {/* 设置对话框 */}
          {settings.showSettings && (
            <MemoizedSettingsDialog
              open={settings.showSettings}
              onClose={() => settings.setShowSettings(false)}
              settings={settings}
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
  onTestNotification: () => void;
}

function SettingsDialog({
  open,
  onClose,
  settings,
  onTestNotification,
}: SettingsDialogProps) {
  const themeColor = MODE_COLORS.focus;

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
                专注 → 短休息 (第 {POMODORO_CYCLE_COUNT} 次后长休息)
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
                  <Typography variant="body2" color="text.secondary">
                    调试模式
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      启用调试功能
                    </Typography>
                    <Switch
                      checked={settings.debugModeEnabled || false}
                      onChange={(e) => settings.toggleDebugMode?.(e.target.checked)}
                      size="small"
                    />
                  </Box>
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

export default SettingsPage;
