/**
 * ChartContainer - 图表容器组件
 *
 * 提供统一的 Chart.js 配置和 Material-UI 主题适配
 *
 * @module components/Charts/ChartContainer
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Theme } from '@mui/material/styles';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * 创建图表主题配置
 * 从 Material-UI 主题中提取颜色和样式
 */
export const createChartTheme = (muiTheme: Theme) => {
  return {
    color: muiTheme.palette.text.primary,
    borderColor: muiTheme.palette.divider,
    gridColor: `${muiTheme.palette.divider}33`,
    primaryColor: '#5E6AD2',
    secondaryColor: '#7B8BE7',
    backgroundColor: 'rgba(94, 106, 210, 0.1)',
    fontFamily: muiTheme.typography.fontFamily,
  };
};

/**
 * Chart.js 全局默认配置
 */
export const chartDefaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 12,
        },
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(10, 10, 12, 0.9)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(94, 106, 210, 0.5)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.06)',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
};

/**
 * ChartContainer 组件属性
 */
interface ChartContainerProps {
  children: React.ReactNode;
}

/**
 * ChartContainer 组件
 *
 * 提供统一的图表容器和样式
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({ children }) => {
  return (
    <div
      style={{
        position: 'relative',
        height: '300px',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default ChartContainer;
