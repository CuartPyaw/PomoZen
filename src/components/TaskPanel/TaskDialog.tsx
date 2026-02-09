/**
 * 任务对话框组件
 *
 * 用于添加和编辑任务的对话框（简化版）
 * @module components/TaskPanel/TaskDialog
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import type { Task, TaskPriority } from '../../types/task';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedPomodoros' | 'totalFocusTime'>) => void;
  task?: Task;
  mode: 'create' | 'edit';
}

/** 优先级配置 */
const PRIORITY_CONFIG = {
  high: {
    label: '最高',
    color: '#E57373',
    bgColor: 'rgba(229, 115, 115, 0.08)',
    borderColor: 'rgba(229, 115, 115, 0.3)',
  },
  medium: {
    label: '中等',
    color: '#FFB74D',
    bgColor: 'rgba(255, 183, 77, 0.08)',
    borderColor: 'rgba(255, 183, 77, 0.3)',
  },
  low: {
    label: '最低',
    color: '#64B5F6',
    bgColor: 'rgba(100, 181, 246, 0.08)',
    borderColor: 'rgba(100, 181, 246, 0.3)',
  },
} as const;

/**
 * 任务对话框组件（包含标题、描述和优先级选择）
 */
export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  onSave,
  task,
  mode,
}) => {
  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority | null>(null);

  // 重置表单
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(null);
  };

  // 初始化表单（编辑模式）
  useEffect(() => {
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
    } else if (mode === 'create') {
      resetForm();
    }
  }, [mode, task, open]);

  // 处理保存
  const handleSave = () => {
    if (!title.trim()) return;
    if (!priority) return; // 优先级必选

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });

    if (mode === 'create') {
      resetForm();
    }
    onClose();
  };

  const isValid = title.trim() && priority;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ typography: 'h6', fontWeight: 600 }}>
        {mode === 'create' ? '新建任务' : '编辑任务'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* 标题 */}
          <TextField
            label="任务标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            autoFocus
            placeholder="输入任务标题..."
            required
          />

          {/* 优先级选择 */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              优先级 <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <ToggleButtonGroup
              value={priority}
              exclusive
              onChange={(_, newValue) => setPriority(newValue)}
              sx={{
                display: 'flex',
                gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  flex: 1,
                  border: '1px solid transparent',
                  borderRadius: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  backgroundColor: 'action.hover',
                  color: 'text.secondary',
                  '&:not(:last-of-type)': {
                    mr: 0,
                  },
                  '&:hover': {
                    backgroundColor: 'action.focus',
                  },
                },
              }}
            >
              {(Object.keys(PRIORITY_CONFIG) as Array<TaskPriority>).map((p) => (
                <ToggleButton
                  key={p}
                  value={p}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: PRIORITY_CONFIG[p].bgColor,
                      color: PRIORITY_CONFIG[p].color,
                      border: `1px solid ${PRIORITY_CONFIG[p].borderColor}`,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: PRIORITY_CONFIG[p].bgColor,
                        filter: 'brightness(0.95)',
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: PRIORITY_CONFIG[p].color,
                      }}
                    />
                    {PRIORITY_CONFIG[p].label}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* 描述 */}
          <TextField
            label="描述（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="添加任务描述..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid}
        >
          {mode === 'create' ? '创建' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
