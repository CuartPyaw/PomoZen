/**
 * TimeDistributionHeatmap - 时段分布热力图
 *
 * 显示 24 小时的专注时长分布
 * 使用颜色深度表示专注强度
 *
 * @module components/Charts/TimeDistributionHeatmap
 */

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import type { TimeDistributionDataPoint } from '@/types/statistics';

/**
 * 组件属性
 */
interface TimeDistributionHeatmapProps {
  /** 时段分布数据 */
  data: TimeDistributionDataPoint[];
}

/**
 * 六种图例颜色（从浅到深）
 */
const legendColors = [
  '#F7F8F2', // 米白
  '#E9E4D4', // 浅暖灰
  '#C7B9A9', // Crab Shell Grey
  '#8C7B68', // 深褐灰
  '#4A5A5E', // 青灰
  '#2C3539', // 深墨灰
];

/**
 * 根据专注时长获取颜色
 */
const getColorForDuration = (duration: number, maxDuration: number): string => {
  if (duration === 0) return legendColors[0];

  const intensity = duration / maxDuration;
  // 使用图例颜色数组，根据强度选择对应颜色
  const colorIndex = Math.min(Math.floor(intensity * 6), 5);

  return legendColors[colorIndex];
};

/**
 * TimeDistributionHeatmap 组件
 */
export const TimeDistributionHeatmap: React.FC<TimeDistributionHeatmapProps> = ({
  data
}) => {
  // 确保数据包含所有 24 小时
  const hourlyData = React.useMemo(() => {
    const completeData: TimeDistributionDataPoint[] = [];
    for (let i = 0; i < 24; i++) {
      const found = data.find(d => d.hour === i);
      completeData.push({
        hour: i,
        duration: found?.duration || 0,
        count: found?.count || 0,
      });
    }
    return completeData;
  }, [data]);

  // 计算最大时长用于颜色深度
  const maxDuration = Math.max(...hourlyData.map(d => d.duration), 1);

  // 格式化小时显示
  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // 格式化时长显示
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(24, 1fr)',
          gap: '2px',
          mb: 1,
        }}
      >
        {hourlyData.map((item) => (
          <Tooltip
            key={item.hour}
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatHour(item.hour)}
                </Typography>
                <Typography variant="caption" display="block">
                  专注时长: {formatDuration(item.duration)}
                </Typography>
                <Typography variant="caption" display="block">
                  专注次数: {item.count} 次
                </Typography>
              </Box>
            }
            arrow
          >
            <Box
              sx={{
                height: 60,
                backgroundColor: getColorForDuration(item.duration, maxDuration),
                border: '1px solid',
                borderColor: 'rgba(44, 44, 44, 0.08)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  borderColor: '#C7B9A9',
                  zIndex: 1,
                },
              }}
            >
              {item.duration > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: item.duration > maxDuration * 0.6 ? '#2C2C2C' : 'rgba(44, 44, 44, 0.7)',
                  }}
                >
                  {item.hour}
                </Typography>
              )}
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* 图例 - 六色方块 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          mt: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          低
        </Typography>
        <Box sx={{ display: 'flex', gap: '2px' }}>
          {legendColors.map((color) => (
            <Box
              key={color}
              sx={{
                width: 24,
                height: 12,
                backgroundColor: color,
                border: '1px solid',
                borderColor: 'rgba(44, 44, 44, 0.15)',
                borderRadius: 0.5,
              }}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          高
        </Typography>
      </Box>
    </Box>
  );
};

export default TimeDistributionHeatmap;