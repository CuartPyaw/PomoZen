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
} from '@mui/material';
import type { Task } from '../../types/task';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedPomodoros' | 'totalFocusTime'>) => void;
  task?: Task;
  mode: 'create' | 'edit';
}

/**
 * 任务对话框组件（简化版 - 仅标题和描述）
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

  // 重置表单
  const resetForm = () => {
    setTitle('');
    setDescription('');
  };

  // 初始化表单（编辑模式）
  useEffect(() => {
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setDescription(task.description || '');
    } else if (mode === 'create') {
      resetForm();
    }
  }, [mode, task, open]);

  // 处理保存
  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    if (mode === 'create') {
      resetForm();
    }
    onClose();
  };

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
          disabled={!title.trim()}
        >
          {mode === 'create' ? '创建' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
