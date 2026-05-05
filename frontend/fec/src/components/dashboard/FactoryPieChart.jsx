import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

import { COLORS } from "../../constants/colors";

export default function FactoryPieChart({ factoryName, data }) {

  const renderValueLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;

    if (!value || value === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 14, fontWeight: "bold" }}
      >
        {value}
      </text>
    );
  };

  return (
    <div className="chart-card">
      <h2>{factoryName}</h2>

      {/* ใส่ height ตายตัวก่อนทดสอบ */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            labelLine={false}
            label={renderValueLabel}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[entry.name] || "#6b7280"}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}