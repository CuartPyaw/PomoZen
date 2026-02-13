/**
 * 玻璃态卡片组件
 *
 * 提供半透明背景 + 背景模糊 + 鼠标聚光灯效果
 * 封装统一的中国禅意设计系统玻璃态风格
 * @module components/GlassCard
 */

import React, { useRef, useCallback } from 'react';
import { Card, CardProps } from '@mui/material';
import { useTheme as useThemeMode } from '../../hooks/useTheme';

/** 透明度级别类型 */
export type GlassIntensity = 'subtle' | 'medium' | 'strong';

/** 透明度级别配置 - 亮色模式 */
const BG_INTENSITY_LIGHT: Record<GlassIntensity, string> = {
  subtle: 'rgba(44,44,44,0.02)',
  medium: 'rgba(44,44,44,0.05)',
  strong: 'rgba(44,44,44,0.08)',
};

/** 透明度级别配置 - 暗色模式 */
const BG_INTENSITY_DARK: Record<GlassIntensity, string> = {
  subtle: 'rgba(255,255,255,0.03)',
  medium: 'rgba(255,255,255,0.08)',
  strong: 'rgba(255,255,255,0.12)',
};

export interface GlassCardProps extends Omit<CardProps, 'classes'> {
  /** 透明度级别（可选，默认 'medium'） */
  glassIntensity?: GlassIntensity;
  /** 是否启用聚光灯效果（可选，默认 true） */
  enableSpotlight?: boolean;
}

/**
 * 玻璃态卡片组件
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  glassIntensity = 'medium',
  enableSpotlight = true,
  children,
  onMouseMove,
  sx = {},
  ...props
}) => {
  const { themeMode } = useThemeMode();
  const cardRef = useRef<HTMLDivElement>(null);

  // 鼠标移动处理 - 更新聚光灯位置 CSS 变量
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  // 处理鼠标移动事件
  const handleMouseMoveWrapper = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
    if (onMouseMove) {
      onMouseMove(e);
    }
  }, [handleMouseMove, onMouseMove]);

  // 构建玻璃态样式
  const glassSx = {
    // 玻璃态背景
    bgcolor: themeMode === 'dark'
      ? BG_INTENSITY_DARK[glassIntensity]
      : BG_INTENSITY_LIGHT[glassIntensity],
    // 背景模糊
    backdropFilter: 'blur(10px)',
    // 边框
    border: themeMode === 'dark'
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid rgba(44,44,44,0.08)',
    // 聚光灯效果定位
    position: 'relative' as const,
    overflow: 'hidden' as const,
    // 合并用户传入的样式
    ...sx,
  };

  return (
    <Card
      ref={cardRef}
      onMouseMove={enableSpotlight ? handleMouseMoveWrapper : onMouseMove}
      sx={glassSx}
      {...props}
    >
      {enableSpotlight && (
        <div
          className="card-spotlight"
          style={{
            // 确保聚光灯使用卡片根节点的 CSS 变量
            ['--mouse-x' as string]: 'var(--mouse-x, 50%)',
            ['--mouse-y' as string]: 'var(--mouse-y, 50%)',
          }}
        />
      )}
      {children}
    </Card>
  );
};
