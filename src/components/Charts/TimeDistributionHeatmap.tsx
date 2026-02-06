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
 * 根据专注时长获取颜色
 */
const getColorForDuration = (duration: number, maxDuration: number): string => {
  if (duration === 0) return 'rgba(44, 44, 44, 0.03)';

  const intensity = duration / maxDuration;
  // 使用暖木色（褐色），颜色越深专注度越高
  const baseColor = { r: 196, g: 167, b: 125 }; // #C4A77D

  return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.2 + intensity * 0.6})`;
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
                  borderColor: 'rgba(196, 167, 125, 0.4)',
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

      {/* 图例 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mt: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          低专注
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: '2px',
            width: 200,
            height: 12,
          }}
        >
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
            <Box
              key={intensity}
              sx={{
                flex: 1,
                backgroundColor: getColorForDuration(
                  Math.round(intensity * maxDuration),
                  maxDuration
                ),
                border: '1px solid',
                borderColor: 'rgba(44, 44, 44, 0.08)',
                borderRadius: 1,
              }}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          高专注
        </Typography>
      </Box>
    </Box>
  );
};

export default TimeDistributionHeatmap;
