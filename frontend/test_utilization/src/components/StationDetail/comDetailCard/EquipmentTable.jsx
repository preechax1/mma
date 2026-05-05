import { useState } from "react";
// นำเข้าแบบ CSS Modules
import styles from "./EquipmentTable.module.css";

export default function EquipmentTable({ equipments }) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(3);
    const [searchTerm, setSearchTerm] = useState("");

    if (!equipments) return null;

    // 1. Logic การค้นหา
    const filteredData = equipments.filter((item) => {
        const term = searchTerm.toLowerCase();
        return (
            item.id_keysight?.toLowerCase().includes(term) ||
            item.type?.toLowerCase().includes(term) ||
            item.equipment_status?.toLowerCase().includes(term)
        );
    });

    // 2. Logic การแบ่งหน้า
    const total = Math.ceil(filteredData.length / perPage);
    const start = (page - 1) * perPage;
    const list = filteredData.slice(start, start + perPage);

    // 3. ฟังก์ชันกำหนดสี Status
    const getStatusClass = (status) => {
        const s = status?.toUpperCase() || "";
        if (["OK", "READY", "PASS", "GOOD"].includes(s)) return styles.stOk;
        if (["BUSY", "IDLE", "PENDING", "NEED TO CAL"].includes(s)) return styles.stWarn;
        if (["ERROR", "DOWN", "EXPIRED", "FAIL", "NOT MATCH STATION"].includes(s)) return styles.stError;
        return styles.stDefault;
    };

    return (
        <div className={styles.eqCardContainer}>
            {/* Header Area */}
            <div className={styles.eqHeaderArea}>
                <div className={styles.eqTitleRow}>
                    <h3>Equipment List</h3>
                    <div className={styles.eqControls}>
                        <label>Show</label>
                        <select
                            value={perPage}
                            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                        >
                            <option value="3">3</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                <div className={styles.eqSearchRow}>
                    <input
                        type="text"
                        placeholder="Search Equipment ID or Type..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className={styles.eqSearchInput}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className={styles.eqTableWrapper}>
                <table className={styles.eqMainTable}>
                    <thead>
                        <tr>
                            <th>Equipment / Type</th>
                            <th>Setup Location</th>
                            <th>Cal Due</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length > 0 ? (
                            list.map((eq, i) => (
                                <tr key={i}>
                                    <td>
                                        <div className={styles.eqBoldId}>{eq.id_keysight}</div>
                                        <div className={styles.eqSubType}>{eq.type}</div>
                                    </td>
                                    <td className={styles.eqLocCell}>
                                        {eq.station === eq.storage ? eq.station : `${eq.station} / ${eq.storage}`}
                                    </td>
                                    <td>
                                        <span className={`${styles.eqCalDays} ${eq.duedate_diff < 10 ? styles.calUrgent : ''}`}>
                                            {eq.duedate_diff} Days
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.eqBadge} ${getStatusClass(eq.equipment_status)}`}>
                                            {eq.equipment_status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className={styles.eqNoData}>No matching equipment found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {total > 1 && (
                <div className={styles.eqFooterPagination}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Prev
                    </button>
                    <span>Page <b>{page}</b> of {total}</span>
                    <button
                        disabled={page === total}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}