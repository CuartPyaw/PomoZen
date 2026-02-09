/**
 * 任务项组件
 *
 * 显示单个任务的卡片式组件（简化版）
 * @module components/TaskPanel/TaskItem
 */

import { memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import type { Task } from '../../types/task';

/** 优先级颜色映射 */
const PRIORITY_COLORS = {
  high: '#E57373',    // 红色 - 最高
  medium: '#FFB74D',  // 黄色 - 中等
  low: '#64B5F6',     // 蓝色 - 最低
} as const;

/** 优先级配置 */
const PRIORITY_CONFIG = {
  high: {
    label: '最高',
    color: '#E57373',
  },
  medium: {
    label: '中等',
    color: '#FFB74D',
  },
  low: {
    label: '最低',
    color: '#64B5F6',
  },
} as const;

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLinkToTimer: () => void;
}

/**
 * 任务项组件（简化版 - 使用 React.memo 优化渲染性能）
 */
export const TaskItem = memo<TaskItemProps>(({
  task,
  isActive,
  onToggleStatus,
  onEdit,
  onDelete,
  onLinkToTimer,
}) => {
  const isCompleted = task.status === 'completed';

  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        border: `1px solid ${isActive ? 'primary.main' : 'divider'}`,
        backgroundColor: isActive ? 'action.hover' : 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: isActive ? 'primary.main' : 'text.secondary',
          transform: 'translateX(4px)',
        },
        opacity: isCompleted ? 0.6 : 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: PRIORITY_COLORS[task.priority],
          borderTopLeftRadius: (theme) => theme.shape.borderRadius,
          borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
          transition: 'background-color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        },
      }}
      onClick={(e) => {
        // 只有点击非交互区域时才触发
        if (
          !(e.target as HTMLElement).closest('button') &&
          !(e.target as HTMLElement).closest('input[type="checkbox"]')
        ) {
          onEdit();
        }
      }}
    >
      <CardContent
        sx={{
          py: 1.5,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          '&:last-child': { pb: 1.5 },
        }}
      >
        {/* 完成复选框 */}
        <Checkbox
          checked={isCompleted}
          onChange={onToggleStatus}
          sx={{
            p: 0.5,
            '&.Mui-checked': {
              color: 'primary.main',
            },
          }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* 任务信息 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* 标题和优先级标签 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: task.description ? 0.5 : 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: isCompleted ? 400 : 500,
                textDecoration: isCompleted ? 'line-through' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {task.title}
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: PRIORITY_CONFIG[task.priority].color,
                ml: 1,
                flexShrink: 0,
              }}
            />
          </Box>

          {/* 描述 */}
          {task.description && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* 番茄钟统计 */}
          {task.completedPomodoros > 0 && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                }}
              />
              {task.completedPomodoros} 番茄钟
            </Typography>
          )}
        </Box>

        {/* 操作按钮 */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 200ms',
            '@media (hover: none)': {
              opacity: 1,
            },
          }}
        >
          {/* 关联到计时器 */}
          <Tooltip title={isActive ? '解除关联' : '关联到计时器'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onLinkToTimer();
              }}
              sx={{
                color: isActive ? 'primary.main' : 'text.secondary',
              }}
            >
              {isActive ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>

          {/* 编辑 */}
          <Tooltip title="编辑">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{ color: 'text.secondary' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* 删除 */}
          <Tooltip title="删除">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
});

TaskItem.displayName = 'TaskItem';
