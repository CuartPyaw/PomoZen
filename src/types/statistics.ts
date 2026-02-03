/**
 * 统计图表相关类型定义
 * @module types/statistics
 */

/**
 * 单日专注记录
 */
export interface DailyFocusRecord {
  /** 日期字符串，格式：YYYY-MM-DD */
  date: string;
  /** 当日专注总时长（秒） */
  totalDuration: number;
  /** 当日专注会话次数 */
  sessionCount: number;
  /** 当日完成的会话详情（用于未来扩展） */
  sessions?: Array<{
    startTime: number;  // 时间戳
    duration: number;   // 时长（秒）
  }>;
}

/**
 * 图表视图模式
 */
export type ChartViewMode = 'daily' | 'weekly';

/**
 * 时间范围选项
 */
export type TimeRange = '7days' | '30days' | '90days' | 'all';

/**
 * 每日图表数据点
 */
export interface DailyChartDataPoint {
  /** 日期（MM-DD 格式） */
  date: string;
  /** 专注时长（分钟） */
  duration: number;
  /** 专注次数 */
  sessions: number;
}

/**
 * 每周图表数据点
 */
export interface WeeklyChartDataPoint {
  /** 周范围（MM-DD至MM-DD 格式） */
  week: string;
  /** 专注时长（分钟） */
  duration: number;
  /** 专注次数 */
  sessions: number;
}

/**
 * 历史记录存储格式
 */
export interface FocusHistoryStorage {
  records: DailyFocusRecord[];
  lastUpdated: number;
}
