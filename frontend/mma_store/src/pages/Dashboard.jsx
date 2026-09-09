import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Package, ShieldCheck } from "lucide-react";
import { getCategory, getStatus, getTransaction } from "../services/Dashboard";
import { useAuth } from "../context/AuthContext";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState({});
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([getStatus(), getCategory(), getTransaction()])
            .then(([statusData, categoryData, transactionData]) => {
                setStatus(statusData || {});
                setCategories(Array.isArray(categoryData) ? categoryData : []);
                setTransactions(Array.isArray(transactionData) ? transactionData : []);
            })
            .catch((err) => {
                console.error("Failed to load dashboard data", err);
                setError("ไม่สามารถโหลดข้อมูล Dashboard ได้");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingRing}>
                    <div /><div /><div /><div />
                </div>
                <p className={styles.loadingText}>Loading System Dashboard...</p>
            </div>
        );
    }

    const statusCards = [
        { key: "Full", label: "Full Stock", icon: Package, className: styles.statusFull },
        { key: "Medium", label: "Medium Stock", icon: Activity, className: styles.statusMedium },
        { key: "Low", label: "Low Stock", icon: AlertTriangle, className: styles.statusLow },
        { key: "Out_of_stock", label: "Out of Stock", icon: ShieldCheck, className: styles.statusOut },
    ];

    const categoryChartData = categories.map((item) => ({
        name: item.category || "Unknown",
        count: Number(item.category_count) || 0,
    }));

    const transactionChartData = transactions.map((item) => ({
        name: item.transaction_month_name || item.transaction_month,
        Withdraw: Number(item.Withdraw) || 0,
        HanaPO: Number(item.HanaPO) || 0,
        HanaStore: Number(item.HanaStore) || 0,
        CustomerGive: Number(item.CustomerGive) || 0,
        KnockDown: Number(item.KnockDown) || 0,
    }));

    return (
        <div className={styles.dashboardLayout}>
            {/* <div className={styles.dashboardHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <BarChart3 size={22} />
                    </div>
                    <div className={styles.headerText}>
                        <h1 className={styles.pageTitle}>System Dashboard</h1>
                        <p className={styles.pageSubtitle}>Inventory status and transaction overview.</p>
                    </div>
                </div>
                <span className={styles.pageSubtitle}>{user?.username || "User"}</span>
            </div> */}

            <div className={styles.metricsGrid}>
                {statusCards.map(({ key, label, icon: Icon, className }) => (
                    <div className={`${styles.metricCard} ${className}`} key={key}>
                        <div className={styles.metricTop}>
                            <div className={styles.iconWrapper}><Icon size={22} /></div>
                            <span className={styles.metricTrend}>Status</span>
                        </div>
                        <div className={styles.metricBody}>
                            <h3 className={styles.metricValue}>{Number(status[key]) || 0}</h3>
                            <p className={styles.metricLabel}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartWidget}>
                    <div className={styles.widgetHeader}>
                        <div className={styles.widgetTitleArea}>
                            <div className={`${styles.widgetIconBox} ${styles.iconBoxGreen}`}>
                                <Activity size={16} />
                            </div>
                            <div>
                                <h3 className={styles.widgetTitle}>Transactions by Month</h3>
                                <p className={styles.widgetSubtitle}>Monthly transaction volume</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={transactionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-25} textAnchor="end" height={60} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="CustomerGive" fill="#6366f1" />
                                <Bar dataKey="HanaPO" fill="#10b981" />
                                <Bar dataKey="HanaStore" fill="#f59e0b" />
                                <Bar dataKey="Withdraw" fill="#ef4444" />
                                <Bar dataKey="KnockDown" fill="#06b6d4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartWidget}>
                    <div className={styles.widgetHeader}>
                        <div className={styles.widgetTitleArea}>
                            <div className={styles.widgetIconBox}>
                                <BarChart3 size={16} />
                            </div>
                            <div>
                                <h3 className={styles.widgetTitle}>Spare by Category</h3>
                                <p className={styles.widgetSubtitle}>Category count</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" name="Category count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default Dashboard;
