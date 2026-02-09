/**
 * 活动任务卡片组件
 *
 * 显示当前关联到计时器的任务信息（简化版）
 * @module components/TimerPanel/ActiveTaskCard
 */

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import type { Task } from '../../types/task';

interface ActiveTaskCardProps {
  task: Task;
  onUnlink: () => void;
}

/**
 * 活动任务卡片组件（简化版）
 */
export const ActiveTaskCard: React.FC<ActiveTaskCardProps> = ({
  task,
  onUnlink,
}) => {
  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid`,
        borderColor: 'primary.main',
        backgroundColor: 'action.hover',
      }}
    >
      <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
        {/* 标题栏 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <StarIcon
            sx={{
              color: 'primary.main',
              fontSize: 20,
              mt: 0.25,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {task.title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onUnlink} sx={{ p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* 描述 */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mt: 1,
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* 番茄钟统计 */}
        {task.completedPomodoros > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            已完成 {task.completedPomodoros} 个番茄钟
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
