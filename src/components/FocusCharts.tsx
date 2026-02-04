/**
 * 专注统计图表组件
 *
 * 使用 Recharts 渲染每日和每周的专注趋势图
 * @module components/FocusCharts
 */

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DailyChartDataPoint, WeeklyChartDataPoint } from '../types/statistics';

/**
 * 每日趋势折线图组件
 *
 * @param data - 图表数据数组
 * @returns JSX 元素
 */
export const DailyLineChart: React.FC<{ data: DailyChartDataPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}>
        暂无数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.6)"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.6)"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
          label={{ value: '分钟', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(10,10,12,0.95)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            color: '#ffffff',
          }}
          itemStyle={{ color: '#ffffff' }}
          labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
        />
        <Legend
          wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
        />
        <Line
          type="monotone"
          dataKey="duration"
          stroke="#5E6AD2"
          strokeWidth={2}
          name="专注时长（分钟）"
          dot={{ fill: '#5E6AD2', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * 每周趋势柱状图组件
 *
 * @param data - 图表数据数组
 * @returns JSX 元素
 */
export const WeeklyBarChart: React.FC<{ data: WeeklyChartDataPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}>
        暂无数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="week"
          stroke="rgba(255,255,255,0.6)"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.6)"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
          label={{ value: '分钟', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(10,10,12,0.95)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            color: '#ffffff',
          }}
          itemStyle={{ color: '#ffffff' }}
          labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
        />
        <Legend
          wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
        />
        <Bar
          dataKey="duration"
          fill="#5E6AD2"
          name="周专注时长（分钟）"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
