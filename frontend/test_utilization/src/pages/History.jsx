import { useEffect, useState } from "react";
import { getDownHistory } from "../services/historyService";

import HistoryFilter from "../components/history/HistoryFilter";
import HistoryTable from "../components/history/HistoryTable";
import { FileModal } from "../components/history/FileModal";

// เปลี่ยนมาใช้ CSS Modules
import styles from "./History.module.css";

export default function History() {
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [station, setStation] = useState("");
    const [category, setCategory] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [openFileModal, setOpenFileModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const openFiles = (id) => {
        setSelectedRecord(id);
        setOpenFileModal(true);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getDownHistory();
                if (Array.isArray(res)) setRows(res);
            } catch (err) {
                console.error("Load history error", err);
                setRows([]);
            }
        };
        load();
    }, []);

    const stationList = [...new Set(rows.map(r => r.station))];
    const categoryList = [...new Set(rows.map(r => r.category))];

    const filteredRows = rows.filter(r => {
        const problem = r.problem || "";
        const st = r.station || "";
        const cat = r.category || "";
        const start = r.start_time || "";
        return (
            (!search || problem.toLowerCase().includes(search.toLowerCase())) &&
            (!station || st === station) &&
            (!category || cat === category) &&
            (!dateFrom || start >= dateFrom) &&
            (!dateTo || start <= dateTo)
        );
    });

    const totalDowntime = filteredRows.length;
    const totalDuration = filteredRows.reduce((sum, row) => sum + (row.duration || 0), 0);
    const avgDuration = totalDowntime > 0 ? (totalDuration / totalDowntime).toFixed(1) : 0;
    const criticalIssues = filteredRows.filter(row => row.category === 'Critical').length;

    return (
        <div className={styles.historyContainer}>
            {/* Header Section */}
            <header className={styles.historyHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.historyTitle}>📋 Downtime History</h1>
                    <p className={styles.historySubtitle}>
                        Monitor and analyze equipment downtime incidents for MMA OP3
                    </p>
                </div>
            </header>

            {/* KPI Cards Row */}
            <div className={styles.kpiRow}>
                <div className={`${styles.kpiCard} ${styles.blueCard}`}>
                    <div className={styles.kpiTitle}>Total Incidents</div>
                    <div className={styles.kpiValue}>{totalDowntime}</div>
                </div>
                <div className={`${styles.kpiCard} ${styles.purpleCard}`}>
                    <div className={styles.kpiTitle}>Avg Duration (hrs)</div>
                    <div className={styles.kpiValue}>{avgDuration}</div>
                </div>
                <div className={`${styles.kpiCard} ${styles.redCard}`}>
                    <div className={styles.kpiTitle}>Critical Issues</div>
                    <div className={styles.kpiValue}>{criticalIssues}</div>
                </div>
                <div className={`${styles.kpiCard} ${styles.slateCard}`}>
                    <div className={styles.kpiTitle}>Total Stations</div>
                    <div className={styles.kpiValue}>{stationList.length}</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {/* Filters Section */}
                <section className={styles.filtersSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>🔍 Filter & Search</h2>
                        <span className={styles.resultsCount}>
                            Found {filteredRows.length} incidents
                        </span>
                    </div>
                    <div className={styles.filterWrapper}>
                        <HistoryFilter
                            search={search} setSearch={setSearch}
                            station={station} setStation={setStation}
                            category={category} setCategory={setCategory}
                            dateFrom={dateFrom} setDateFrom={setDateFrom}
                            dateTo={dateTo} setDateTo={setDateTo}
                            stations={stationList}
                            categories={categoryList}
                            rows={filteredRows}
                        />
                    </div>
                </section>

                {/* Table Section */}
                <section className={styles.tableSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>📊 Incident Records</h2>
                    </div>
                    <div className={styles.tableWrapper}>
                        <HistoryTable
                            rows={filteredRows}
                            onOpenFiles={openFiles}
                        />
                    </div>
                </section>
            </div>

            <FileModal
                recordId={selectedRecord}
                isOpen={openFileModal}
                onClose={() => setOpenFileModal(false)}
            />
        </div>
    );
}