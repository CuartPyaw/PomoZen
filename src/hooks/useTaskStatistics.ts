/**
 * 任务统计管理 Hook
 *
 * 管理任务相关的统计数据（简化版）
 * @module hooks/useTaskStatistics
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  TaskStatistics,
  Task,
} from '../types/task';
import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';

// 存储键配置
const STORAGE_KEYS = {
  TASK_STATISTICS: 'tomato-task-statistics',
} as const;

/**
 * 任务统计管理 Hook 返回值
 */
export interface UseTaskStatisticsReturn {
  statistics: TaskStatistics;
  updateDailyCompletion: (duration: number) => void;
  getTaskEfficiency: (task: Task) => number;
  refreshStatistics: (tasks: Task[]) => void;
}

/**
 * 初始化空统计数据
 */
function createEmptyStatistics(): TaskStatistics {
  return {
    pendingTasks: 0,
    completedTasks: 0,
    dailyCompletionHistory: [],
  };
}

/**
 * 获取今日日期字符串（YYYY-MM-DD）
 */
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 任务统计管理 Hook（简化版）
 *
 * 提供任务相关的统计功能，包括：
 * - 按状态的任务计数
 * - 每日完成历史记录
 * - 任务效率计算
 *
 * @returns 任务统计数据和方法
 */
export function useTaskStatistics(): UseTaskStatisticsReturn {
  // 统计数据
  const [statistics, setStatistics] = useState<TaskStatistics>(() => {
    const saved = StorageManager.get<string>(STORAGE_KEYS.TASK_STATISTICS);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return {
          pendingTasks: data.pendingTasks || 0,
          completedTasks: data.completedTasks || 0,
          dailyCompletionHistory: data.dailyCompletionHistory || [],
        };
      } catch (error) {
        Logger.error('Failed to parse task statistics', error);
      }
    }
    return createEmptyStatistics();
  });

  // 持久化统计数据
  useEffect(() => {
    try {
      StorageManager.set(STORAGE_KEYS.TASK_STATISTICS, statistics);
    } catch (error) {
      Logger.error('Failed to save task statistics', error);
    }
  }, [statistics]);

  /**
   * 从任务列表重新计算统计数据
   */
  const refreshStatistics = useCallback((tasks: Task[]) => {
    const pendingCount = tasks.filter(task => task.status === 'pending').length;
    const completedCount = tasks.filter(task => task.status === 'completed').length;

    setStatistics(prev => ({
      ...prev,
      pendingTasks: pendingCount,
      completedTasks: completedCount,
    }));
  }, []);

  /**
   * 更新每日完成记录
   * 在番茄钟完成时调用
   */
  const updateDailyCompletion = useCallback((duration: number) => {
    const today = getTodayDateString();

    setStatistics(prev => {
      const newHistory = [...prev.dailyCompletionHistory];
      const todayEntry = newHistory.find(entry => entry.date === today);

      if (todayEntry) {
        // 更新今日记录
        todayEntry.pomodorosCompleted += 1;
        todayEntry.totalFocusTime += duration;
      } else {
        // 创建今日记录
        newHistory.push({
          date: today,
          tasksCompleted: 0,
          pomodorosCompleted: 1,
          totalFocusTime: duration,
        });
      }

      // 只保留最近 90 天的记录
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      const cutoffString = cutoffDate.toISOString().substring(0, 10);

      return {
        ...prev,
        dailyCompletionHistory: newHistory
          .filter(entry => entry.date >= cutoffString)
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    });
  }, []);

  /**
   * 计算任务效率
   * 简化版：返回完成的番茄钟数
   */
  const getTaskEfficiency = useCallback((task: Task): number => {
    return task.completedPomodoros;
  }, []);

  return {
    statistics,
    updateDailyCompletion,
    getTaskEfficiency,
    refreshStatistics,
  };
}
