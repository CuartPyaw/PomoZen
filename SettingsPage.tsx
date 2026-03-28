/**
 * PomoZen 设置页面
 *
 * 包含设置和统计功能，不包含计时器
 * 使用 Tabs 直接在页面中切换两个视图
 *
 * @module SettingsPage
 * @version 2.0.0
 */

import { useState } from 'react';
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
  Tabs,
  Tab,
  ThemeProvider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CssBaseline from '@mui/material/CssBaseline';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';

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

// 模式颜色配置
const MODE_COLORS = {
  focus: {
    primary: '#7A918D',
    bright: '#8FA398',
  },
} as const;

/**
 * 设置内容组件
 */
interface SettingsContentProps {
  settings: ReturnType<typeof useSettings>;
  onTestNotification: () => void;
}

function SettingsContent({ settings, onTestNotification }: SettingsContentProps) {
  const themeColor = MODE_COLORS.focus;

  return (
    <Box sx={{ width: '100%' }}>
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

      {/* 高级功能 */}
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

      {/* 保存按钮 */}
      <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
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
      </Box>
    </Box>
  );
}

/**
 * 统计内容组件
 */
interface StatsContentProps {
  statistics: ReturnType<typeof useStatistics>;
  settings: ReturnType<typeof useSettings>;
  modeColors: Record<string, { primary: string; bright: string }>;
}

function StatsContent({ statistics, settings, modeColors }: StatsContentProps) {
  const filteredHistory = statistics.getFilteredHistory();

  return (
    <Box sx={{ width: '100%' }}>
      {/* 控制面板 */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        {/* 视图切换 */}
        <Tabs
          value={statistics.chartViewMode}
          onChange={(_, v) => statistics.setChartViewMode(v)}
          sx={{
            minHeight: 36,
            '& .MuiTabs-indicator': { bgcolor: modeColors.focus.primary },
          }}
        >
          <Tab
            label="日"
            value="daily"
            sx={{
              minHeight: 36,
              fontSize: '0.75rem',
              py: 0,
              color: 'text.secondary',
              '&.Mui-selected': { color: modeColors.focus.primary },
            }}
          />
          <Tab
            label="周"
            value="weekly"
            sx={{
              minHeight: 36,
              fontSize: '0.75rem',
              py: 0,
              color: 'text.secondary',
              '&.Mui-selected': { color: modeColors.focus.primary },
            }}
          />
          <Tab
            label="月"
            value="monthly"
            sx={{
              minHeight: 36,
              fontSize: '0.75rem',
              py: 0,
              color: 'text.secondary',
              '&.Mui-selected': { color: modeColors.focus.primary },
            }}
          />
        </Tabs>

        {/* 数据指标切换 */}
        <Tabs
          value={statistics.dataMetric}
          onChange={(_, v) => statistics.setDataMetric(v)}
          sx={{
            minHeight: 36,
            '& .MuiTabs-indicator': { bgcolor: modeColors.focus.primary },
          }}
        >
          <Tab
            label="时长"
            value="duration"
            sx={{
              minHeight: 36,
              fontSize: '0.75rem',
              py: 0,
              color: 'text.secondary',
              '&.Mui-selected': { color: modeColors.focus.primary },
            }}
          />
          <Tab
            label="次数"
            value="count"
            sx={{
              minHeight: 36,
              fontSize: '0.75rem',
              py: 0,
              color: 'text.secondary',
              '&.Mui-selected': { color: modeColors.focus.primary },
            }}
          />
          <Tab
            label="平均"
            value="average"
            sx={{
              minHeight: 36,
              fontSize: '0.75rem',
              py: 0,
              color: 'text.secondary',
              '&.Mui-selected': { color: modeColors.focus.primary },
            }}
          />
        </Tabs>

        {/* 时间范围选择 */}
        <Tabs
          value={statistics.chartTimeRange}
          onChange={(_, v) => statistics.setChartTimeRange(v)}
          sx={{
            minHeight: 36,
            '& .MuiTabs-indicator': { bgcolor: modeColors.focus.primary },
          }}
        >
          {(['7days', '30days', '90days', 'all'] as TimeRange[]).map((range) => (
            <Tab
              key={range}
              label={range === '7days' ? '7天' : range === '30days' ? '30天' : range === '90days' ? '90天' : '全部'}
              value={range}
              sx={{
                minHeight: 36,
                fontSize: '0.75rem',
                py: 0,
                color: 'text.secondary',
                '&.Mui-selected': { color: modeColors.focus.primary },
              }}
            />
          ))}
        </Tabs>
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
              总时长
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
              专注次数
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
          <Box sx={{ height: 250, width: '100%' }}>
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
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#7A8B8B' }}>
            🕐 时段分布
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
    </Box>
  );
}

/**
 * SettingsPage 主组件
 */
function SettingsPage() {
  // 主题管理
  const { theme, themePreference, setThemePreference } = useTheme();

  // 设置管理
  const settings = useSettings();

  // 统计数据管理
  const statistics = useStatistics();

  // Tab 切换状态
  const [activeTab, setActiveTab] = useState(0);

  // 通知管理（仅用于测试通知）
  const notifications = useNotifications(
    settings.soundEnabled,
    settings.autoSkipNotification
  );

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
              <Button
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
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ flex: 1, py: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {/* Tab 切换 */}
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  mb: 3,
                  '& .MuiTabs-indicator': {
                    bgcolor: MODE_COLORS.focus.primary,
                  },
                }}
              >
                <Tab
                  icon={<SettingsIcon />}
                  iconPosition="start"
                  label="设置"
                  sx={{
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: MODE_COLORS.focus.primary,
                    },
                  }}
                />
                <Tab
                  icon={<BarChartIcon />}
                  iconPosition="start"
                  label="统计"
                  sx={{
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: MODE_COLORS.focus.primary,
                    },
                  }}
                />
              </Tabs>

              {/* Tab 内容 */}
              {activeTab === 0 && (
                <SettingsContent
                  settings={settings}
                  onTestNotification={() => notifications.sendNotification('测试通知', '这是一个测试通知')}
                />
              )}

              {activeTab === 1 && (
                <StatsContent
                  statistics={statistics}
                  settings={settings}
                  modeColors={MODE_COLORS}
                />
              )}
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </Box>
  );
}

export default SettingsPage;