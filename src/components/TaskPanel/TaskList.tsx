/**
 * 任务列表组件
 *
 * 显示过滤后的任务列表
 * @module components/TaskPanel/TaskList
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { TaskItem } from './TaskItem';
import type { Task } from '../../types/task';

interface TaskListProps {
  tasks: Task[];
  currentTaskId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTaskToggleStatus: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onLinkToTimer: (taskId: string | null) => void;
  onAddTask: () => void;
  emptyMessage?: string;
}

/**
 * 任务列表组件
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  currentTaskId,
  searchQuery,
  onSearchChange,
  onTaskToggleStatus,
  onTaskEdit,
  onTaskDelete,
  onLinkToTimer,
  onAddTask,
  emptyMessage = '暂无任务',
}) => {
  // 过滤后的任务列表
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;

    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
    );
  }, [tasks, searchQuery]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 搜索栏 */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="搜索任务..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />
      </Box>

      {/* 任务列表 */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          pb: 8,
        }}
      >
        {filteredTasks.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
              gap: 1,
            }}
          >
            <Typography variant="body2">{emptyMessage}</Typography>
            {searchQuery && (
              <Typography variant="caption">
                尝试清除搜索条件
              </Typography>
            )}
          </Box>
        ) : (
          <Stack spacing={1}>
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isActive={currentTaskId === task.id}
                onToggleStatus={() => onTaskToggleStatus(task.id)}
                onEdit={() => onTaskEdit(task)}
                onDelete={() => onTaskDelete(task.id)}
                onLinkToTimer={() =>
                  onLinkToTimer(currentTaskId === task.id ? null : task.id)
                }
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* 添加任务 FAB */}
      <Fab
        color="primary"
        size="medium"
        onClick={onAddTask}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 1,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};
