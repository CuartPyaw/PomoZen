/**
 * 任务面板组件
 *
 * 简化版任务管理的主容器，包含三标签页视图和任务列表
 * @module components/TaskPanel/TaskPanel
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { TaskList } from './TaskList';
import { TaskDialog } from './TaskDialog';
import type { Task, TaskViewMode } from '../../types/task';

interface TaskPanelProps {
  tasks: Task[];
  currentTaskId: string | null;
  viewMode: TaskViewMode;
  searchQuery: string;
  onViewModeChange: (mode: TaskViewMode) => void;
  onSearchChange: (query: string) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskDelete: (id: string) => void;
  onLinkToTimer: (taskId: string | null) => void;
  onToggleTaskStatus: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedPomodoros' | 'totalFocusTime'>) => void;
}

// 视图配置
const VIEW_CONFIG: Record<
  TaskViewMode,
  { label: string; emptyMessage: string }
> = {
  all: {
    label: '所有',
    emptyMessage: '暂无任务，点击下方按钮添加',
  },
  pending: {
    label: '未完成',
    emptyMessage: '暂无未完成任务',
  },
  completed: {
    label: '已完成',
    emptyMessage: '暂无已完成任务',
  },
};

/**
 * 任务面板组件
 */
export const TaskPanel: React.FC<TaskPanelProps> = ({
  tasks,
  currentTaskId,
  viewMode,
  searchQuery,
  onViewModeChange,
  onSearchChange,
  onTaskUpdate,
  onTaskDelete,
  onLinkToTimer,
  onToggleTaskStatus,
  onAddTask,
}) => {
  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // 处理编辑任务
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  // 处理添加任务
  const handleAddTask = useCallback(() => {
    setEditingTask(undefined);
    setDialogOpen(true);
  }, []);

  // 处理保存任务
  const handleSaveTask = useCallback(
    (
      taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedPomodoros' | 'totalFocusTime'>
    ) => {
      if (editingTask) {
        // 更新现有任务（保留原有状态）
        onTaskUpdate(editingTask.id, taskData);
      } else {
        // 添加新任务
        onAddTask(taskData);
      }
    },
    [editingTask, onTaskUpdate, onAddTask]
  );

  // 处理对话框关闭
  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingTask(undefined);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 标题 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          pt: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          任务
        </Typography>
      </Box>

      <Tabs
        value={viewMode}
        onChange={(_, newValue) => onViewModeChange(newValue)}
        variant="fullWidth"
        sx={{
          px: 1,
          '& .MuiTab-root': {
            minHeight: 48,
            fontSize: '0.875rem',
            textTransform: 'none',
          },
        }}
      >
        <Tab label={VIEW_CONFIG.all.label} value="all" />
        <Tab label={VIEW_CONFIG.pending.label} value="pending" />
        <Tab label={VIEW_CONFIG.completed.label} value="completed" />
      </Tabs>

      {/* 任务列表 */}
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <TaskList
          tasks={tasks}
          currentTaskId={currentTaskId}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onTaskToggleStatus={onToggleTaskStatus}
          onTaskEdit={handleEditTask}
          onTaskDelete={onTaskDelete}
          onLinkToTimer={onLinkToTimer}
          onAddTask={handleAddTask}
          emptyMessage={VIEW_CONFIG[viewMode].emptyMessage}
        />
      </CardContent>

      {/* 任务对话框 */}
      <TaskDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveTask}
        task={editingTask}
        mode={editingTask ? 'edit' : 'create'}
      />
    </Card>
  );
};
