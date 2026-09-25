import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface TimeSeriesChartProps {
  data: Array<{ date?: string; time_bucket?: string; events?: number; users?: number; value?: number }>;
  type?: 'line' | 'area' | 'bar';
  dataKey?: string;
  color?: string;
  height?: number;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  type = 'area',
  dataKey = 'events',
  color = '#4a7c8f',
  height = 300,
}) => {
  const formattedData = data.map((d) => ({
    ...d,
    label: (d.date || d.time_bucket || '').slice(0, 10),
    val: d.value !== undefined ? d.value : d[dataKey as keyof typeof d] || 0,
  }));

  if (type === 'bar') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2f37" vertical={false} />
            <XAxis dataKey="label" stroke="#cbd5e1" fontSize={11} tickLine={false} />
            <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111e22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
            />
            <Bar dataKey="val" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2f37" vertical={false} />
          <XAxis dataKey="label" stroke="#cbd5e1" fontSize={11} tickLine={false} />
          <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111e22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
          />
          <Area type="monotone" dataKey="val" stroke={color} strokeWidth={2.5} fillOpacity={1} fill="url(#chartGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
