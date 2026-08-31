import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";

import styles from "./StatusBar.module.css";

// ฟังก์ชันช่วยแมปชื่อ Status กับ Variable ใน CSS
const getFillColor = (status) => {
    switch (status) {
        case "Good": return "var(--color-good)";
        case "Fail": return "var(--color-fail)";
        case "KeepOnStore":
        case "Keep on Store": return "var(--color-keep-on-store)";
        case "Ship out to repair": return "var(--color-repair)";
        default: return "var(--color-default)";
    }
};

export default function OverallBarChart({ data }) {
    return (
        /* เพิ่ม className เพื่อให้ CSS Variables ทำงาน */
        <div className={`${styles["chart-card"]} ${styles["chart-container"]} full-width`}>
            <h2>Overall Status Comparison</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #444" }}
                        itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="value">
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getFillColor(entry.name)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}