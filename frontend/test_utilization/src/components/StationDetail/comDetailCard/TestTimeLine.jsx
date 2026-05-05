import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import styles from "./TestTimeLine.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function TestTimeLine({ testtimeline }) {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (testtimeline && testtimeline.length > 0) {
      setTimeline(testtimeline);
    }
  }, [testtimeline]);

  if (!timeline.length) {
    return (
      <div className={styles.timelineLoading}>
        Loading Timeline...
      </div>
    );
  }

  const labels = timeline.map(item => item.start);

  const data = {
    labels,
    datasets: [
      {
        label: "Timeline",
        data: timeline.map(item => item.usetime),
        backgroundColor: timeline.map(item => {
          // ใช้สีเดิมที่คุณเลือกไว้ เพราะเป็น Hex Code (ไม่ต้องผ่าน styles)
          if (item.status === "Run") return "#16a34a"; 
          if (item.status === "Idle") return "#e2df2b"; 
          if (item.status === "Maintenance") return "#dc2626"; 
          return "#64748b"; 
        }),
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "x",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function (context) {
            const item = timeline[context.dataIndex];
            return ` ${item.status} (${item.serial}) - ${item.usetime} min`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { 
          display: true, 
          text: "Start Time", 
          color: "#1e293b", 
          font: { weight: 'bold', size: 12 }
        },
        ticks: { color: "#475569", font: { size: 10 } },
        grid: { display: false }
      },
      y: {
        title: { 
          display: true, 
          text: "Use Time (Min)", 
          color: "#1e293b", 
          font: { weight: 'bold', size: 12 } 
        },
        ticks: { color: "#475569", beginAtZero: true },
        grid: { color: "#f1f5f9" }
      },
    },
  };

  return (
    <div className={styles.timelineContainer}>
      <h2 className={styles.timelineTitle}>Test Timeline</h2>
      <div className={styles.chartWrapper}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}