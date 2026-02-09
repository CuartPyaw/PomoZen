/**
 * 简化任务管理 Hook
 *
 * 管理任务和会话状态
 * @module hooks/useTasks
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  Task,
  TaskSession,
  TaskViewMode,
  TaskStorage,
} from '../types/task';
import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';

// 存储键配置
const STORAGE_KEYS = {
  TASKS: 'tomato-tasks',
  SESSIONS: 'tomato-task-sessions',
  CURRENT_TASK: 'tomato-current-task',
  VIEW_MODE: 'tomato-task-view-mode',
  SEARCH_QUERY: 'tomato-task-search',
} as const;

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 任务管理 Hook 返回值
 */
export interface UseTasksReturn {
  // 状态
  tasks: Task[];
  sessions: TaskSession[];
  currentTaskId: string | null;
  viewMode: TaskViewMode;
  searchQuery: string;

  // Task CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedPomodoros' | 'totalFocusTime'>) => string;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;

  // 任务状态转换
  toggleTaskStatus: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;

  // 计时器集成
  linkTaskToTimer: (taskId: string | null) => void;
  recordPomodoro: (taskId: string, duration: number) => void;

  // 视图和搜索
  setViewMode: (mode: TaskViewMode) => void;
  setSearchQuery: (query: string) => void;
  getFilteredTasks: () => Task[];

  // 工具方法
  getTaskById: (id: string) => Task | undefined;
  getCurrentTask: () => Task | undefined;
}

/**
 * 任务管理 Hook
 *
 * 提供简化的任务管理功能，包括：
 * - 任务 CRUD 操作
 * - 任务状态切换（完成/未完成）
 * - 与计时器的集成
 * - 三标签页视图管理（所有、已完成、未完成）
 *
 * @returns 任务管理状态和方法
 */
export function useTasks(): UseTasksReturn {
  // ========== 状态初始化 ==========

  // 任务列表
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = StorageManager.get<string>(STORAGE_KEYS.TASKS);
    if (saved) {
      try {
        const data: TaskStorage = JSON.parse(saved);
        // 数据迁移：将旧的 GTD 状态转换为新的简化状态
        return (data.tasks || []).map(task => {
          // 旧数据迁移逻辑
          if ('status' in task && typeof task.status === 'string') {
            const oldStatus = task.status as string;
            // 将 done 转换为 completed，其他转换为 pending
            if (oldStatus === 'done') {
              return { ...task, status: 'completed' as const };
            }
            return { ...task, status: 'pending' as const };
          }
          return { ...task, status: 'pending' as const };
        });
      } catch (error) {
        Logger.error('Failed to parse tasks', error);
      }
    }
    return [];
  });

  // 会话记录
  const [sessions, setSessions] = useState<TaskSession[]>(() => {
    const saved = StorageManager.get<string>(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (error) {
        Logger.error('Failed to parse sessions', error);
      }
    }
    return [];
  });

  // 当前关联到计时器的任务 ID
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(() => {
    return StorageManager.get<string>(STORAGE_KEYS.CURRENT_TASK) ?? null;
  });

  // 视图模式
  const [viewMode, setViewModeState] = useState<TaskViewMode>(() => {
    const saved = StorageManager.get<string>(STORAGE_KEYS.VIEW_MODE);
    if (saved && ['all', 'completed', 'pending'].includes(saved)) {
      return saved as TaskViewMode;
    }
    return 'all';
  });

  // 搜索关键词
  const [searchQuery, setSearchQueryState] = useState<string>(() => {
    return StorageManager.get<string>(STORAGE_KEYS.SEARCH_QUERY) ?? '';
  });

  // 使用 ref 避免闭包陷阱
  const tasksRef = useRef(tasks);
  const sessionsRef = useRef(sessions);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // ========== 持久化 ==========

  // 持久化任务
  useEffect(() => {
    try {
      const data: TaskStorage = {
        tasks,
        sessions: [],
        lastUpdated: Date.now(),
      };
      StorageManager.set(STORAGE_KEYS.TASKS, data);
    } catch (error) {
      Logger.error('Failed to save tasks', error);
    }
  }, [tasks]);

  // 持久化会话
  useEffect(() => {
    try {
      StorageManager.set(STORAGE_KEYS.SESSIONS, sessions);
    } catch (error) {
      Logger.error('Failed to save sessions', error);
    }
  }, [sessions]);

  // 持久化当前任务
  useEffect(() => {
    try {
      if (currentTaskId) {
        StorageManager.set(STORAGE_KEYS.CURRENT_TASK, currentTaskId);
      } else {
        StorageManager.remove(STORAGE_KEYS.CURRENT_TASK);
      }
    } catch (error) {
      Logger.error('Failed to save current task', error);
    }
  }, [currentTaskId]);

  // 持久化视图模式
  useEffect(() => {
    try {
      StorageManager.set(STORAGE_KEYS.VIEW_MODE, viewMode);
    } catch (error) {
      Logger.error('Failed to save view mode', error);
    }
  }, [viewMode]);

  // 持久化搜索关键词
  useEffect(() => {
    try {
      StorageManager.set(STORAGE_KEYS.SEARCH_QUERY, searchQuery);
    } catch (error) {
      Logger.error('Failed to save search query', error);
    }
  }, [searchQuery]);

  // ========== Task CRUD ==========

  /**
   * 添加新任务
   */
  const addTask = useCallback((
    task: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedPomodoros' | 'totalFocusTime'>
  ): string => {
    const id = generateId();
    const newTask: Task = {
      ...task,
      id,
      status: 'pending',
      createdAt: Date.now(),
      completedPomodoros: 0,
      totalFocusTime: 0,
    };

    setTasks(prev => [...prev, newTask]);
    return id;
  }, []);

  /**
   * 更新任务
   */
  const updateTask = useCallback((
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  /**
   * 删除任务
   */
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    // 如果删除的是当前任务，解除关联
    setCurrentTaskId(prev => prev === id ? null : prev);
  }, []);

  // ========== 任务状态转换 ==========

  /**
   * 切换任务状态（完成/未完成）
   */
  const toggleTaskStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        if (task.status === 'pending') {
          return {
            ...task,
            status: 'completed' as const,
            completedAt: Date.now(),
          };
        } else {
          return {
            ...task,
            status: 'pending' as const,
            completedAt: undefined,
          };
        }
      }
      return task;
    }));
  }, []);

  /**
   * 完成任务
   */
  const completeTask = useCallback((id: string) => {
    updateTask(id, {
      status: 'completed',
      completedAt: Date.now(),
    });
  }, [updateTask]);

  /**
   * 取消完成任务
   */
  const uncompleteTask = useCallback((id: string) => {
    updateTask(id, {
      status: 'pending',
      completedAt: undefined,
    });
  }, [updateTask]);

  // ========== 计时器集成 ==========

  /**
   * 关联任务到计时器
   */
  const linkTaskToTimer = useCallback((taskId: string | null) => {
    setCurrentTaskId(taskId);
  }, []);

  /**
   * 记录番茄钟完成
   */
  const recordPomodoro = useCallback((taskId: string, duration: number) => {
    // 更新任务的番茄钟数和总时长
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completedPomodoros: task.completedPomodoros + 1,
          totalFocusTime: task.totalFocusTime + duration,
        };
      }
      return task;
    }));

    // 创建会话记录
    const session: TaskSession = {
      id: generateId(),
      taskId,
      startTime: Date.now() - duration * 1000,
      duration,
      completed: true,
    };
    setSessions(prev => [...prev, session]);
  }, []);

  // ========== 视图和搜索 ==========

  /**
   * 设置视图模式
   */
  const setViewMode = useCallback((mode: TaskViewMode) => {
    setViewModeState(mode);
  }, []);

  /**
   * 设置搜索关键词
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  /**
   * 获取过滤后的任务列表
   */
  const getFilteredTasks = useCallback((): Task[] => {
    let filtered = [...tasks];

    // 视图模式过滤
    if (viewMode === 'completed') {
      filtered = filtered.filter(task => task.status === 'completed');
    } else if (viewMode === 'pending') {
      filtered = filtered.filter(task => task.status === 'pending');
    }
    // 'all' 模式显示所有任务

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // 排序
    return filtered.sort((a, b) => {
      if (viewMode === 'all') {
        // 所有视图：未完成在前，已完成在后
        if (a.status === 'pending' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status === 'pending') return 1;
      }

      if (viewMode === 'completed') {
        // 已完成视图：最旧完成的在前
        const aTime = a.completedAt ?? a.createdAt;
        const bTime = b.completedAt ?? b.createdAt;
        return aTime - bTime;
      }

      // 默认：最新创建的在前
      return b.createdAt - a.createdAt;
    });
  }, [tasks, viewMode, searchQuery]);

  // ========== 工具方法 ==========

  /**
   * 根据 ID 获取任务
   */
  const getTaskById = useCallback((id: string): Task | undefined => {
    return tasksRef.current.find(task => task.id === id);
  }, []);

  /**
   * 获取当前关联的任务
   */
  const getCurrentTask = useCallback((): Task | undefined => {
    if (!currentTaskId) return undefined;
    return tasksRef.current.find(task => task.id === currentTaskId);
  }, []);

  return {
    // 状态
    tasks,
    sessions,
    currentTaskId,
    viewMode,
    searchQuery,

    // Task CRUD
    addTask,
    updateTask,
    deleteTask,

    // 任务状态转换
    toggleTaskStatus,
    completeTask,
    uncompleteTask,

    // 计时器集成
    linkTaskToTimer,
    recordPomodoro,

    // 视图和搜索
    setViewMode,
    setSearchQuery,
    getFilteredTasks,

    // 工具方法
    getTaskById,
    getCurrentTask,
  };
}
