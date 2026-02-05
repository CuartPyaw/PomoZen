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
  /** 24小时分布，每个下标代表一小时，值为该小时的专注总时长（秒） */
  hourlyDistribution?: number[];
}

/**
 * 图表视图模式
 */
export type ChartViewMode = 'daily' | 'weekly' | 'monthly';

/**
 * 数据指标类型
 */
export type DataMetric = 'duration' | 'count' | 'average';

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
 * 每月图表数据点
 */
export interface MonthlyChartDataPoint {
  /** 月份（YYYY-MM 格式） */
  month: string;
  /** 专注时长（分钟） */
  duration: number;
  /** 专注次数 */
  sessions: number;
  /** 平均时长（分钟） */
  average: number;
}

/**
 * 时段分布数据点
 */
export interface TimeDistributionDataPoint {
  /** 小时（0-23） */
  hour: number;
  /** 专注总时长（分钟） */
  duration: number;
  /** 专注次数 */
  count: number;
}

/**
 * 历史记录存储格式
 */
export interface FocusHistoryStorage {
  records: DailyFocusRecord[];
  lastUpdated: number;
}
