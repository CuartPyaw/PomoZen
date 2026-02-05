/**
 * WeeklyBarChart - 每周统计柱状图
 *
 * 显示每周专注时长、次数或平均时长的对比
 *
 * @module components/Charts/WeeklyBarChart
 */

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartContainer, chartDefaultOptions } from './ChartContainer';
import type { WeeklyChartDataPoint, DataMetric } from '@/types/statistics';

/**
 * 组件属性
 */
interface WeeklyBarChartProps {
  /** 图表数据 */
  data: WeeklyChartDataPoint[];
  /** 数据指标类型 */
  metric?: DataMetric;
}

/**
 * WeeklyBarChart 组件
 */
export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  data,
  metric = 'duration'
}) => {
  // 根据 metric 类型决定显示的数据和标签
  const chartData = React.useMemo(() => {
    const labels = data.map(d => d.week);

    let datasetData: number[];
    let label: string;
    let color: string;
    let backgroundColor: string;

    switch (metric) {
      case 'count':
        datasetData = data.map(d => d.sessions);
        label = '专注次数';
        color = '#7B8BE7';
        backgroundColor = 'rgba(123, 139, 231, 0.6)';
        break;
      case 'average':
        datasetData = data.map(d =>
          d.sessions > 0 ? Math.round(d.duration / d.sessions) : 0
        );
        label = '平均时长（分钟）';
        color = '#5E6AD2';
        backgroundColor = 'rgba(94, 106, 210, 0.6)';
        break;
      case 'duration':
      default:
        datasetData = data.map(d => d.duration);
        label = '专注时长（分钟）';
        color = '#5E6AD2';
        backgroundColor = 'rgba(94, 106, 210, 0.6)';
        break;
    }

    return {
      labels,
      datasets: [
        {
          label,
          data: datasetData,
          backgroundColor,
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: color,
        },
      ],
    };
  }, [data, metric]);

  const options = React.useMemo(() => ({
    ...chartDefaultOptions,
    plugins: {
      ...chartDefaultOptions.plugins,
      title: {
        display: false,
      },
      tooltip: {
        ...chartDefaultOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const metricLabel = chartData.datasets[0].label;
            const value = context.parsed.y;
            return `${metricLabel}: ${value}`;
          },
        },
      },
    },
  }), [chartData]);

  return (
    <ChartContainer>
      <Bar data={chartData} options={options} />
    </ChartContainer>
  );
};

export default WeeklyBarChart;
