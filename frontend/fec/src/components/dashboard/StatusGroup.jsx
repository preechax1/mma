import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";
import styles from "./StatusGroup.module.css";

// --- 1. Internal Component: Label บนกราฟวงกลม ---
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

// --- 2. Internal Component: Pie Chart สำหรับแต่ละกลุ่ม ---
function FactoryPieChart({ factoryName, data }) {
    // ฟังก์ชันดึงค่าสีจาก CSS Variable
    const getFillColor = (name) => {
        switch (name) {
            case "Good":
                return "var(--color-good)";
            case "Fail":
                return "var(--color-fail)";
            case "KeepOnStore":
            case "Keep on Store":
                return "var(--color-keep-on-store)";
            case "Ship out to repair":
                return "var(--color-repair)";
            default:
                return "var(--color-default)";
        }
    };

    return (
        <div className={styles["chart-card"]}>
            <h3>{factoryName}</h3>
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
                            <Cell key={`cell-${index}`} fill={getFillColor(entry.name)} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #444",
                            borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- 3. Main Component: Grid แสดงกลุ่มทั้งหมด ---
export default function FactoryGrid({ factories, factoryData }) {
    return (
        <div className={styles["factory-grid"]}>
            {factories.map((factory, index) => (
                <FactoryPieChart
                    key={index}
                    factoryName={factory.name}
                    data={factoryData[factory.name] || []}
                />
            ))}
        </div>
    );
}
