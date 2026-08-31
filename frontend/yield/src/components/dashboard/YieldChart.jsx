import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import styles from "./StatusBar.module.css"; // หรือเปลี่ยนเป็นชื่อไฟล์สไตล์ของคุณ

export default function YieldChart({ data }) {
  return (
    <div className={`${styles["chart-card"]} ${styles["chart-container"]} full-width`}>
      <h2 style={{ textAlign: 'center', marginBottom: '12px', color: '#e2e8f0' }}>
        Keysight MMA Final Yield Trend
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          
          {/* แกน X แสดงช่วงเวลา (FY2025, Apr-26, WW21, ฯลฯ) */}
          <XAxis dataKey="period" stroke="#94a3b8" />
          
          {/* แกน Y ด้านซ้าย สำหรับจำนวนชิ้นงาน (Input, Output) */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#38bdf8" 
            label={{ value: 'Unit', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          
          {/* แกน Y ด้านขวา สำหรับเปอร์เซ็นต์ Yield และ Target (0 - 100%) */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#f43f5e"
            domain={[80, 100]} // บีบช่วงแสดงผลให้อยู่ระหว่าง 80% - 100% ตามรูปตัวอย่าง
            tickFormatter={(value) => `${value}%`}
          />
          
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #444", borderRadius: '8px' }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />

          {/* แท่งสีที่ 1: INPUT (แกนซ้าย) */}
          <Bar yAxisId="left" dataKey="input" name="INPUT" fill="#3b82f6" barSize={30} />
          
          {/* แท่งสีที่ 2: OUTPUT (แกนซ้าย) */}
          <Bar yAxisId="left" dataKey="output" name="OUTPUT" fill="#f97316" barSize={30} />
          
          {/* เส้นที่ 1: FPY / Yield Pct (แกนขวา) */}
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="yield_pct" 
            name="FPY (%)" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          
          {/* เส้นที่ 2: TARGET (แกนขวา) */}
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="target_pct" 
            name="TARGET (%)" 
            stroke="#ec4899" 
            strokeWidth={2}
            strokeDasharray="5 5" // เส้นประ
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}