import React, { useState, useMemo } from "react";
import Modal from "../components/ui/Modal";
import SpareForm from "../components/Spare/SpareForm";
import SpareTable from "../components/Spare/SpareTable";
import { useSpare } from "../hooks/SpareHook";
import {
    Search, Plus, Database, AlertCircle, X,
    Package, Layers, AlertTriangle, CheckCircle
} from "lucide-react";
import styles from "./Spare.module.css";

const Spare = () => {
    const { spares, loading, error, add, update, receive, remove } = useSpare();

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");

    const handleSave = async (data) => {
        try {
            if (editing) {
                await update(editing.id, data);
            } else {
                await add(data);
            }
            setOpen(false);
            setEditing(null);
        } catch (err) {
            console.error(err);
            alert("Save failed");
        }
    };

    const handleReceive = async (spareId, formData) => {
        try {
            await receive(spareId, formData);
        } catch (err) {
            console.error(err);
            alert("Receive failed");
        }
    };

    const filteredSpares = useMemo(() => {
        if (!search.trim()) return spares;
        const q = search.toLowerCase();
        return spares.filter((item) => {
            const sid = (item.id || "").toString();
            const cat = (item.category || "").toLowerCase();
            const mod = (item.model || "").toLowerCase();
            const pn = (item.part_number || "").toLowerCase();
            return sid.includes(q) || cat.includes(q) || mod.includes(q) || pn.includes(q);
        });
    }, [spares, search]);

    // Summary stats
    const stats = useMemo(() => {
        const lowStock = spares.filter(s => Number(s.onhand) <= Number(s.minimum_stock) && Number(s.onhand) > 0);
        const zeroStock = spares.filter(s => Number(s.onhand) === 0);
        const healthy = spares.filter(s => Number(s.onhand) > Number(s.minimum_stock));
        return { total: spares.length, lowStock: lowStock.length, zeroStock: zeroStock.length, healthy: healthy.length };
    }, [spares]);

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className={styles.flexCenter}>
                <div className={styles.loadingRing}>
                    <div /><div /><div /><div />
                </div>
                <p className={styles.loadingText}>Loading inventory data...</p>
            </div>
        );
    }

    /* ─── Error ─── */
    if (error) {
        return (
            <div className={styles.flexCenter}>
                <div className={styles.errorMessage}>
                    <AlertCircle size={30} className={styles.errorIcon} />
                    <p>Error: {error}</p>
                    <button onClick={() => window.location.reload()} className={styles.btnRetry}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Ambient glows */}
            <div className={styles.bgGlow1} />
            <div className={styles.bgGlow2} />

            {/* ─── Header ─── */}
            <header className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <Database size={22} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>Spare Inventory</h1>
                        <p className={styles.subtitle}>Manage and track your spare parts inventory</p>
                    </div>
                </div>
                <button
                    id="admin-add-spare-btn"
                    className={styles.btnPrimary}
                    onClick={() => { setEditing(null); setOpen(true); }}
                >
                    <Plus size={16} />
                    Add New Spare
                </button>
            </header>

            {/* ─── Stats Strip ─── */}
            <div className={styles.statsStrip}>
                <div className={styles.statItem}>
                    <div className={`${styles.statDot} ${styles.dotBlue}`} />
                    <span className={styles.statVal}>{stats.total}</span>
                    <span className={styles.statLbl}>Total Parts</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                    <div className={`${styles.statDot} ${styles.dotGreen}`} />
                    <span className={styles.statVal}>{stats.healthy}</span>
                    <span className={styles.statLbl}>Healthy</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                    <div className={`${styles.statDot} ${styles.dotYellow}`} />
                    <span className={styles.statVal}>{stats.lowStock}</span>
                    <span className={styles.statLbl}>Low Stock</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                    <div className={`${styles.statDot} ${styles.dotRed}`} />
                    <span className={styles.statVal}>{stats.zeroStock}</span>
                    <span className={styles.statLbl}>Out of Stock</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                    <Layers size={14} className={styles.statIcon} />
                    <span className={styles.statVal}>{filteredSpares.length}</span>
                    <span className={styles.statLbl}>Showing</span>
                </div>
            </div>

            {/* ─── Action Bar ─── */}
            <div className={styles.actionBar}>
                <div className={styles.searchGroup}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        id="admin-search"
                        placeholder="Search ID, model, category, part number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                    {search && (
                        <button className={styles.clearSearch} onClick={() => setSearch("")}>
                            <X size={13} />
                        </button>
                    )}
                </div>
                <span className={styles.resultCount}>
                    {filteredSpares.length} / {spares.length} records
                </span>
            </div>

            {/* ─── Table ─── */}
            <SpareTable
                spares={filteredSpares}
                onEdit={(s) => { setEditing(s); setOpen(true); }}
                onDelete={(id) => remove(id)}
                onReceive={handleReceive}
            />

            {/* ─── Add/Edit Modal ─── */}
            <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }}>
                <SpareForm spare={editing} onSave={handleSave} />
            </Modal>
        </div>
    );
};

export default Spare;