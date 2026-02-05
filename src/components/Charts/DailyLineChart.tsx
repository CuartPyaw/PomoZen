/**
 * DailyLineChart - 每日统计折线图
 *
 * 显示每日专注时长、次数或平均时长的趋势
 *
 * @module components/Charts/DailyLineChart
 */

import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartContainer, chartDefaultOptions } from './ChartContainer';
import type { DailyChartDataPoint, DataMetric } from '@/types/statistics';

/**
 * 组件属性
 */
interface DailyLineChartProps {
  /** 图表数据 */
  data: DailyChartDataPoint[];
  /** 数据指标类型 */
  metric?: DataMetric;
}

/**
 * DailyLineChart 组件
 */
export const DailyLineChart: React.FC<DailyLineChartProps> = ({
  data,
  metric = 'duration'
}) => {
  // 根据 metric 类型决定显示的数据和标签
  const chartData = React.useMemo(() => {
    const labels = data.map(d => d.date);

    let datasetData: number[];
    let label: string;
    let color: string;
    let backgroundColor: string;

    switch (metric) {
      case 'count':
        datasetData = data.map(d => d.sessions);
        label = '专注次数';
        color = '#7B8BE7';
        backgroundColor = 'rgba(123, 139, 231, 0.1)';
        break;
      case 'average':
        datasetData = data.map(d =>
          d.sessions > 0 ? Math.round(d.duration / d.sessions) : 0
        );
        label = '平均时长（分钟）';
        color = '#5E6AD2';
        backgroundColor = 'rgba(94, 106, 210, 0.1)';
        break;
      case 'duration':
      default:
        datasetData = data.map(d => d.duration);
        label = '专注时长（分钟）';
        color = '#5E6AD2';
        backgroundColor = 'rgba(94, 106, 210, 0.1)';
        break;
    }

    return {
      labels,
      datasets: [
        {
          label,
          data: datasetData,
          borderColor: color,
          backgroundColor,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
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
      <Line data={chartData} options={options} />
    </ChartContainer>
  );
};

export default DailyLineChart;
