import { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

// นำเข้าสไตล์แบบ Module
import styles from "./Dashboard.module.css";

import {
    getReadiness, getStatus, getUtilization,
    getMTBF, getMTTR, getFailure
} from "../services/dashboardService";

// กำหนดสีมาตรฐานสำหรับกราฟ Pie และสถานะต่างๆ
const STATE_COLORS = {
    ready: '#10b981',       // Green
    notReady: '#ef4444',    // Red
    attention: '#f59e0b',   // Orange
    running: '#3b82f6',     // Blue
    idle: '#8b5cf6',        // Purple
    setup: '#06b6d4',       // Cyan
    down: '#ef4444',        // Red (Same as Not Ready)
};

const CHART_COLORS = [STATE_COLORS.running, STATE_COLORS.notReady, STATE_COLORS.ready, STATE_COLORS.attention, STATE_COLORS.idle, STATE_COLORS.setup];

export default function Dashboard() {
    // State สำหรับเก็บข้อมูล
    const [dashboardData, setDashboardData] = useState({
        readiness: null,
        status: null,
        utilization: [],
        mtbf: [],
        mttr: [],
        failure: []
    });

    // State สำหรับสถานะโหลดและข้อผิดพลาด
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ฟังก์ชันช่วยดึงไอคอนสถานะ (Emoji)
    const getStatusIcon = (statusName) => {
        const iconMap = {
            // สถานะความพร้อม (Availability)
            'Ready': '🟢',        // ใช้สีเขียวแทนความพร้อม (หรือ ✅ ถ้าเน้นผลลัพธ์)
            'Not Ready': '🔴',    // ใช้สีแดงแทนความไม่พร้อม
            
            // สถานะการทำงานจริง (Operational)
            'Running': '✅',      // สายฟ้า สื่อถึงมีพลังงาน/กำลังทำงาน (หรือ ⚙️ เฟืองหมุน) ⚡
            'Run': '✅',      // สายฟ้า สื่อถึงมีพลังงาน/กำลังทำงาน (หรือ ⚙️ เฟืองหมุน) ⚡
            'Idle': '⏳',         // สีเหลือง สื่อถึง Standby/รอ (หรือ ⏳ นาฬิกาทราย) 🟡
            'Down': '💀',          // หัวกะโหลกหรือ 🚫 สื่อว่าระบบตาย/ดับสนิท (ไม่ใช่แค่หยุดชั่วคราว) 💀
            'DOWN EQUIPMENT': '🚧',   // ป้ายเขตก่อสร้าง สื่อว่ากำลังซ่อม (ชัดกว่าประแจตัวเดียว)
            
            // สถานะการซ่อมบำรุง/ตั้งค่า (Work in Progress)
            'Maintenance': '🚧',   // ป้ายเขตก่อสร้าง สื่อว่ากำลังซ่อม (ชัดกว่าประแจตัวเดียว)
            'Setup': '⚙️'          // เฟือง สื่อถึงการตั้งค่าระบบพื้นฐาน
        };
        return iconMap[statusName] || '⚪'; // Default เป็นสีเทาถ้าไม่ทราบสถานะ
    };

    useEffect(() => {
        // ฟังก์ชันดึงข้อมูลจาก APIs ทั้งหมดพร้อมกัน
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [readinessData, statusData, utilizationData, mtbfData, mttrData, failureData] = await Promise.all([
                    getReadiness(), getStatus(), getUtilization(), getMTBF(), getMTTR(), getFailure()
                ]);

                setDashboardData({
                    readiness: readinessData,
                    status: statusData,
                    utilization: utilizationData,
                    mtbf: mtbfData,
                    mttr: mttrData,
                    failure: failureData
                });
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // แสดงสถานะกำลังโหลด
    if (loading) return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading MMA OP3 Data...</p>
        </div>
    );

    // แสดงข้อผิดพลาด
    if (error) return (
        <div className={styles.errorContainer}>
            <p className={styles.errorText}>⚠️ {error}</p>
            <button className={styles.retryButton} onClick={() => window.location.reload()}>Retry</button>
        </div>
    );

    // ประมวลผลข้อมูล Readiness สำหรับ KPI Cards
    const readiness = dashboardData.readiness;
    const totalMachines = (readiness?.Ready || 0) + (readiness?.["Not Ready"] || 0) + (readiness?.["Needs Attention"] || 0);
    const readyCount = readiness?.Ready || 0;
    const notReadyCount = (readiness?.["Not Ready"] || 0) + (readiness?.["Needs Attention"] || 0);

    // ประมวลผลข้อมูล Status สำหรับ Overview Grid
    const statusCounts = dashboardData.status 
        ? Object.keys(dashboardData.status).map(key => ({ name: key, value: dashboardData.status[key] })) 
        : [];

    // ประมวลผลข้อมูล Failure สำหรับ Pie Chart
    const failureCounts = dashboardData.failure.map(f => ({
        name: f.failure_category,
        value: f.total
    }));

    return (
        <div className={styles.dashboardContainer}>
            {/* Header Section */}
            <header className={styles.dashboardHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <span className={styles.dashboardIcon}>🏭</span>
                    </div>
                    <div className={styles.headerText}>
                        <h1 className={styles.dashboardTitle}>OP3 Machine Performance</h1>
                        <p className={styles.dashboardSubtitle}>Real-time Equipment Monitoring & Analytics Dashboard</p>
                    </div>
                </div>
            </header>

            {/* Key Performance Indicators (KPIs) Section */}
            <section className={styles.dashboardSection}>
                <h2 className={styles.sectionTitle}>📈 Key Performance Indicators</h2>
                <div className={styles.metricsGrid}>
                    <div className={`${styles.metricCard} ${styles.totalCard}`}>
                        <div className={styles.metricIcon}>🎯</div>
                        <div className={styles.metricContent}>
                            <h3 className={styles.metricValue}>{totalMachines}</h3>
                            <p className={styles.metricLabel}>Total Test Stations</p>
                        </div>
                    </div>

                    <div className={`${styles.metricCard} ${styles.readinessCard}`}>
                        <div className={styles.metricIcon}>✅</div>
                        <div className={styles.metricContent}>
                            <h3 className={styles.metricValue}>{readyCount}</h3>
                            <p className={styles.metricLabel}>Ready Machines</p>
                            <div className={styles.metricProgress}>
                                <div className={styles.progressBarReady} style={{ width: `${(readyCount / totalMachines) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.metricCard} ${styles.maintenanceCard}`}>
                        <div className={styles.metricIcon}>🔧</div>
                        <div className={styles.metricContent}>
                            <h3 className={styles.metricValue}>{notReadyCount}</h3>
                            <p className={styles.metricLabel}>Not Ready / Attention</p>
                            <div className={styles.metricProgress}>
                                <div className={styles.progressBarDown} style={{ width: `${(notReadyCount / totalMachines) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Machine Status Overview Section */}
            <section className={styles.dashboardSection}>
                <h2 className={styles.sectionTitle}>🔄 Machine Status Overview</h2>
                <div className={styles.statusGrid}>
                    {statusCounts.map((status) => (
                        <div key={status.name} className={`${styles.statusCard} ${styles[`status${status.name.replace(/\s+/g, '')}`]}`}>
                            <div className={styles.statusHeader}>
                                <span className={styles.statusIcon}>{getStatusIcon(status.name)}</span>
                                <span className={styles.statusName}>{status.name}</span>
                            </div>
                            <div className={styles.statusValue}>{status.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Performance Analytics Section */}
            <section className={styles.dashboardSection}>
                <h2 className={styles.sectionTitle}>📊 Performance Analytics</h2>
                
                {/* Row 1: Utilization & Failure */}
                <div className={styles.chartsGridPrimary}>
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>📈 Utilization Trend (%) - Last 30 Days</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardData.utilization}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="ut_day" tick={{ fill: '#94a3b8' }} />
                                <YAxis tick={{ fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: '#f1f5f9' }} />
                                <Line type="monotone" dataKey="utilization" stroke={STATE_COLORS.running} strokeWidth={3} dot={{ fill: STATE_COLORS.running }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>⚠️ Failure Distribution by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={failureCounts} dataKey="value" nameKey="name" outerRadius={110} innerRadius={70} paddingAngle={5} cornerRadius={5} label>
                                    {failureCounts.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 2: MTBF & MTTR */}
                <div className={styles.chartsGridSecondary}>
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>🔧 Mean Time Between Failures (MTBF) - Hours</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={dashboardData.mtbf}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="ut_day" tick={{ fill: '#94a3b8' }} />
                                <YAxis tick={{ fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="mtbf" stroke={STATE_COLORS.ready} strokeWidth={3} dot={{ fill: STATE_COLORS.ready }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>⏱️ Mean Time To Repair (MTTR) - Hours</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={dashboardData.mttr}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="ut_day" tick={{ fill: '#94a3b8' }} />
                                <YAxis tick={{ fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="mttr" stroke={STATE_COLORS.notReady} strokeWidth={3} dot={{ fill: STATE_COLORS.notReady }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>
        </div>
    );
}