/**
 * 统计数据管理 Hook
 *
 * 管理专注历史记录和统计数据
 * @module hooks/useStatistics
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  DailyFocusRecord,
  ChartViewMode,
  TimeRange,
  DailyChartDataPoint,
  WeeklyChartDataPoint,
  MonthlyChartDataPoint,
  FocusHistoryStorage,
  DataMetric,
} from '../types/statistics';
import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';

// 存储键配置
const STORAGE_KEYS = {
  FOCUS_HISTORY: 'tomato-focus-history',
  CHART_VIEW_MODE: 'tomato-chart-view-mode',
  CHART_TIME_RANGE: 'tomato-chart-time-range',
  CHART_DATA_METRIC: 'tomato-chart-data-metric',
} as const;

/**
 * 统计数据管理 Hook
 *
 * 提供专注历史记录的管理功能，包括：
 * - 历史记录加载和保存
 * - 图表数据准备
 * - 时间范围过滤
 *
 * @returns 统计数据状态和方法
 */
export function useStatistics() {
  // 统计对话框显示状态
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // 图表视图模式
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>(() => {
    const saved = StorageManager.get<ChartViewMode>(STORAGE_KEYS.CHART_VIEW_MODE);
    if (saved === 'weekly' || saved === 'daily' || saved === 'monthly') {
      return saved;
    }
    return 'daily';
  });

  // 图表时间范围
  const [chartTimeRange, setChartTimeRange] = useState<TimeRange>(() => {
    const saved = StorageManager.get<TimeRange>(STORAGE_KEYS.CHART_TIME_RANGE);
    if (saved && ['7days', '30days', '90days', 'all'].includes(saved)) {
      return saved;
    }
    return '30days';
  });

  // 图表数据指标
  const [dataMetric, setDataMetric] = useState<DataMetric>(() => {
    const saved = StorageManager.get<DataMetric>(STORAGE_KEYS.CHART_DATA_METRIC);
    if (saved === 'duration' || saved === 'count' || saved === 'average') {
      return saved;
    }
    return 'duration';
  });

  // 专注历史记录
  const [focusHistory, setFocusHistory] = useState<Map<string, DailyFocusRecord>>(() => {
    const saved = StorageManager.get<string>(STORAGE_KEYS.FOCUS_HISTORY);
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
        Logger.error('Failed to parse focus history', error);
      }
    }
    return new Map();
  });

  /**
   * 持久化专注历史到 localStorage
   */
  useEffect(() => {
    try {
      const records = Array.from(focusHistory.values())
        .sort((a, b) => a.date.localeCompare(b.date));

      const data: FocusHistoryStorage = {
        records,
        lastUpdated: Date.now()
      };

      StorageManager.set(STORAGE_KEYS.FOCUS_HISTORY, data);
    } catch (error) {
      Logger.error('Failed to save focus history', error);
    }
  }, [focusHistory]);

  /**
   * 持久化图表视图模式
   */
  useEffect(() => {
    try {
      StorageManager.set(STORAGE_KEYS.CHART_VIEW_MODE, chartViewMode);
    } catch (error) {
      Logger.error('Failed to save chart view mode', error);
    }
  }, [chartViewMode]);

  /**
   * 持久化图表时间范围
   */
  useEffect(() => {
    try {
      StorageManager.set(STORAGE_KEYS.CHART_TIME_RANGE, chartTimeRange);
    } catch (error) {
      Logger.error('Failed to save chart time range', error);
    }
  }, [chartTimeRange]);

  /**
   * 持久化图表数据指标
   */
  useEffect(() => {
    try {
      StorageManager.set(STORAGE_KEYS.CHART_DATA_METRIC, dataMetric);
    } catch (error) {
      Logger.error('Failed to save chart data metric', error);
    }
  }, [dataMetric]);

  /**
   * 获取今日日期字符串（YYYY-MM-DD）
   */
  const getTodayDateString = useCallback((): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  /**
   * 更新今日专注记录
   * 在专注完成时调用
   */
  const updateTodayFocusRecord = useCallback((duration: number) => {
    const today = getTodayDateString();
    const hour = new Date().getHours();

    setFocusHistory((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(today);

      if (existing) {
        const hourlyDist = existing.hourlyDistribution || new Array(24).fill(0);
        hourlyDist[hour] += duration;

        newMap.set(today, {
          ...existing,
          totalDuration: existing.totalDuration + duration,
          sessionCount: existing.sessionCount + 1,
          hourlyDistribution: hourlyDist,
          sessions: [
            ...(existing.sessions || []),
            { startTime: Date.now(), duration }
          ]
        });
      } else {
        const hourlyDist = new Array(24).fill(0);
        hourlyDist[hour] = duration;

        newMap.set(today, {
          date: today,
          totalDuration: duration,
          sessionCount: 1,
          hourlyDistribution: hourlyDist,
          sessions: [{ startTime: Date.now(), duration }]
        });
      }

      return newMap;
    });
  }, [getTodayDateString]);

  /**
   * 根据时间范围获取过滤后的历史记录
   */
  const getFilteredHistory = useCallback((): DailyFocusRecord[] => {
    const todayString = new Date().toISOString().substring(0, 10);

    let cutoffDate = new Date();

    switch (chartTimeRange) {
      case '7days':
        cutoffDate.setDate(todayString ? new Date(todayString).getDate() - 6 : new Date().getDate() - 6);
        break;
      case '30days':
        cutoffDate.setDate(todayString ? new Date(todayString).getDate() - 29 : new Date().getDate() - 29);
        break;
      case '90days':
        cutoffDate.setDate(todayString ? new Date(todayString).getDate() - 89 : new Date().getDate() - 89);
        break;
      case 'all':
      default:
        cutoffDate = new Date(0);
        break;
    }

    const cutoffString = cutoffDate.toISOString().substring(0, 10);

    return Array.from(focusHistory.values())
      .filter(record => {
        return record.date >= cutoffString && record.date <= todayString;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [focusHistory, chartTimeRange]);

  /**
   * 为每日视图准备图表数据
   */
  const getDailyChartData = useCallback((): DailyChartDataPoint[] => {
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
  }, [getFilteredHistory]);

  /**
   * 为每周视图准备图表数据
   */
  const getWeeklyChartData = useCallback((): WeeklyChartDataPoint[] => {
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
  }, [getFilteredHistory]);

  /**
   * 为每月视图准备图表数据
   */
  const getMonthlyChartData = useCallback((): MonthlyChartDataPoint[] => {
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
  }, [getFilteredHistory]);

  return {
    // 状态
    showStatsDialog,
    setShowStatsDialog,
    focusHistory,
    chartViewMode,
    chartTimeRange,
    dataMetric,
    // 状态设置
    setChartViewMode,
    setChartTimeRange,
    setDataMetric,
    // 方法
    updateTodayFocusRecord,
    getFilteredHistory,
    getDailyChartData,
    getWeeklyChartData,
    getMonthlyChartData,
  };
}
