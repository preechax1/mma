import { useState, useEffect } from "react";
import { exportCSV } from "../../utils/historyUtils";
import styles from "./HistoryFilter.module.css";

export default function HistoryFilter({
    search, setSearch,
    station, setStation,
    category, setCategory,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    stations = [],
    categories = [],
    rows
}) {
    const [searchText, setSearchText] = useState(search);

    /* ===== debounce search ===== */
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchText);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchText, setSearch]);

    /* ===== clear filter ===== */
    const clearFilter = () => {
        setSearch("");
        setSearchText("");
        setStation("");
        setCategory("");
        setDateFrom("");
        setDateTo("");
    };

    return (
        <div className={styles.filterBar}>
            {/* Search Group */}
            <div className={styles.inputGroup}>
                <input
                    className={styles.inputField}
                    placeholder="🔍 Search problem..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>

            {/* Select Group */}
            <div className={styles.inputGroup}>
                <select
                    className={styles.selectField}
                    value={station}
                    onChange={e => setStation(e.target.value)}
                >
                    <option value="">All Stations</option>
                    {stations.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className={styles.inputGroup}>
                <select
                    className={styles.selectField}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Date Group */}
            <div className={styles.dateGroup}>
                <input
                    type="date"
                    className={styles.inputField}
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                />
                <span className={styles.toText}>to</span>
                <input
                    type="date"
                    className={styles.inputField}
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                />
            </div>

            {/* Actions Group */}
            <div className={styles.actionGroup}>
                <button
                    className={styles.btnClear}
                    onClick={clearFilter}
                    title="Reset all filters"
                >
                    Clear
                </button>
                <button
                    className={styles.btnExport}
                    onClick={() => exportCSV(rows)}
                >
                    📥 Export CSV
                </button>
            </div>
        </div>
    );
}