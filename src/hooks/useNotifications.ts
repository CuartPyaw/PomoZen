/**
 * 通知管理 Hook
 *
 * 管理应用的通知功能
 * @module hooks/useNotifications
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { playNotificationSound } from '../utils/audioPlayer';
import { Logger } from '../utils/logger';

/**
 * 通知弹窗状态
 */
export interface NotificationState {
  open: boolean;
  title: string;
  message: string;
}

/**
 * 通知管理 Hook
 *
 * 提供通知功能，包括：
 * - 显示通知弹窗
 * - 播放提示音
 * - 自动跳过通知
 *
 * @returns 通知状态和方法
 */
export function useNotifications(
  soundEnabled: boolean,
  autoSkipNotification: boolean
) {
  // 通知弹窗状态
  const [notificationDialog, setNotificationDialog] = useState<NotificationState>({
    open: false,
    title: '',
    message: ''
  });

  // 通知弹窗定时器引用
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * 发送通知
   * @param title 通知标题
   * @param body 通知内容
   * @param playSound 是否播放声音（默认根据 soundEnabled 设置）
   */
  const sendNotification = useCallback((title: string, body: string, playSound?: boolean) => {
    // 如果启用自动跳过通知，只播放声音不显示弹窗
    if (autoSkipNotification) {
      const shouldPlaySound = playSound !== undefined ? playSound : soundEnabled;
      if (shouldPlaySound) {
        playNotificationSound().catch(error => {
          Logger.error('Failed to play notification sound', error);
        });
      }
      return;
    }

    // 清除之前的定时器，防止内存泄漏
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setNotificationDialog({ open: true, title, message: body });

    // 播放声音
    const shouldPlaySound = playSound !== undefined ? playSound : soundEnabled;
    if (shouldPlaySound) {
      playNotificationSound().catch(error => {
        Logger.error('Failed to play notification sound', error);
      });
    }
  }, [soundEnabled, autoSkipNotification]);

  /**
   * 关闭通知弹窗
   */
  const handleNotificationClose = useCallback(() => {
    setNotificationDialog(prev => ({ ...prev, open: false }));
  }, []);

  return {
    notificationDialog,
    sendNotification,
    handleNotificationClose,
  };
}
