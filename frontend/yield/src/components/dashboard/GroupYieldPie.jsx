import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export default function GroupYieldPie({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>ไม่มีข้อมูล Group ในสัปดาห์ที่แล้ว</div>;
  }

  const chartData = data.map((item) => ({
    name: item.group_name ?? 'Unknown',
    input: Number(item.input ?? 0),
    output: Number(item.output ?? 0),
    yield_pct: Number(item.yield_pct ?? 0),
  }));

  return (
    <div style={{ width: '100%', height: 340, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #475569', borderRadius: '10px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value, name) => [`${value.toLocaleString()} Units`, name]}
          />
          <Legend />
          <Bar dataKey="input" name="Input" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="output" name="Output" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}