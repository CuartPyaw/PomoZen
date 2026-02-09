/**
 * 简化任务管理相关类型定义
 * @module types/task
 */

/**
 * 任务状态 - 简化版
 * - pending: 未完成
 * - completed: 已完成
 */
export type TaskStatus = 'pending' | 'completed';

/**
 * 视图模式 - 简化版三标签页
 */
export type TaskViewMode = 'all' | 'completed' | 'pending';

/**
 * 简化任务实体
 */
export interface Task {
  /** 唯一标识符（基于时间戳的 UUID） */
  id: string;
  /** 任务标题 */
  title: string;
  /** 可选的详细描述 */
  description?: string;
  /** 当前状态 */
  status: TaskStatus;
  /** 已完成番茄钟数量 */
  completedPomodoros: number;
  /** 总专注时长（秒） */
  totalFocusTime: number;
  /** 创建时间戳 */
  createdAt: number;
  /** 完成时间戳 */
  completedAt?: number;
}

/**
 * 任务会话 - 记录关联到任务的番茄钟会话
 */
export interface TaskSession {
  /** 唯一标识符 */
  id: string;
  /** 关联的任务 ID */
  taskId: string;
  /** 开始时间戳 */
  startTime: number;
  /** 时长（秒） */
  duration: number;
  /** 会话完成状态 */
  completed: boolean;
}

/**
 * 每日任务完成记录
 */
export interface DailyTaskCompletion {
  /** 日期字符串（YYYY-MM-DD） */
  date: string;
  /** 当日完成任务数 */
  tasksCompleted: number;
  /** 当日完成番茄钟数 */
  pomodorosCompleted: number;
  /** 当日总专注时长（秒） */
  totalFocusTime: number;
}

/**
 * 任务统计数据
 */
export interface TaskStatistics {
  /** 未完成任务数 */
  pendingTasks: number;
  /** 已完成任务数 */
  completedTasks: number;
  /** 每日任务完成历史 */
  dailyCompletionHistory: DailyTaskCompletion[];
}

/**
 * 任务数据存储格式
 */
export interface TaskStorage {
  tasks: Task[];
  sessions: TaskSession[];
  lastUpdated: number;
}
