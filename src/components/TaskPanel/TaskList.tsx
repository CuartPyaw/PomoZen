/**
 * 任务列表组件
 *
 * 显示过滤后的任务列表，支持按优先级排序
 * @module components/TaskPanel/TaskList
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Sort as SortIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { TaskItem } from './TaskItem';
import type { Task, TaskPriority } from '../../types/task';

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

/** 排序模式类型 */
type SortMode = 'default' | 'priority';

/** 优先级排序权重 */
const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

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
  // 排序模式状态
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  // 排序菜单控制
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const handleSortModeChange = (mode: SortMode) => {
    setSortMode(mode);
    handleSortMenuClose();
  };

  // 过滤和排序后的任务列表
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // 按优先级排序
    if (sortMode === 'priority') {
      result = [...result].sort((a, b) => {
        // 首先按优先级排序（高到低）
        const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // 优先级相同时，按创建时间排序（新的在前）
        return b.createdAt - a.createdAt;
      });
    }

    return result;
  }, [tasks, searchQuery, sortMode]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 搜索栏和排序按钮 */}
      <Box sx={{ p: 2, pb: 1, display: 'flex', gap: 1 }}>
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
        <Tooltip title="排序方式">
          <IconButton
            size="small"
            onClick={handleSortMenuOpen}
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <SortIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* 排序菜单 */}
        <Menu
          anchorEl={sortMenuAnchor}
          open={Boolean(sortMenuAnchor)}
          onClose={handleSortMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem
            onClick={() => handleSortModeChange('default')}
            selected={sortMode === 'default'}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 120 }}>
              默认排序
              {sortMode === 'default' && (
                <CheckIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />
              )}
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => handleSortModeChange('priority')}
            selected={sortMode === 'priority'}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 120 }}>
              按优先级
              {sortMode === 'priority' && (
                <CheckIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />
              )}
            </Box>
          </MenuItem>
        </Menu>
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
