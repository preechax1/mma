import React, { useState, useEffect, useMemo } from "react";
import {
    History,
    Search,
    ArrowLeftRight,
    ArrowDownCircle,
    ArrowUpCircle,
    User,
    Package,
    Tag,
    Clock,
    Activity,
    Filter,
    RefreshCw,
    Inbox,
    Zap,
    Eye,
    X,
    Image as ImageIcon,
    FileText,
    Trash2,
    Plus
} from "lucide-react";
import { getHistoryList, deleteHistoryFile, uploadHistoryFile, getHistoryFiles } from "../services/HistoryTransaction";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../services/apiConfig";
import styles from "./HistoryTransaction.module.css";

const HistorySpareTransaction = () => {
    const { user } = useAuth();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadingId, setUploadingId] = useState(null);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [fileLoading, setFileLoading] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const fileInputRef = React.useRef(null);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await getHistoryList();
                // data may come wrapped; ensure we set array correctly
                const list = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);
                setHistoryData(list);
                console.log('Fetched history sample:', list[0]);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchHistory();
        setRefreshing(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return { date: "N/A", time: "" };
        try {
            const date = new Date(dateString);
            return {
                date: date.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }),
                time: date.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
        } catch {
            return { date: dateString, time: "" };
        }
    };

    const getActionType = (action) => {
        const act = (action || "").toLowerCase();
        if (act.includes("withdraw") || act.includes("borrow")) return "withdraw";
        if (act.includes("receive") || act.includes("add")) return "receive";
        return "other";
    };

    // Summary stats
    const stats = useMemo(() => {
        const withdraws = historyData.filter(i => getActionType(i.action) === "withdraw");
        const receives = historyData.filter(i => getActionType(i.action) === "receive");
        return {
            total: historyData.length,
            withdraws: withdraws.length,
            receives: receives.length,
            totalWithdrawQty: withdraws.reduce((s, i) => s + Number(i.quantity || i.WithdrawQuantity || 1), 0),
            totalReceiveQty: receives.reduce((s, i) => s + Number(i.quantity || i.ReceiveQuantity || 1), 0),
        };
    }, [historyData]);

    // Filtered data
    const filteredData = useMemo(() => {
        const lc = searchTerm.toLowerCase();
        return historyData.filter(item => {
            const model = (item.model || item.spare_name || "").toLowerCase();
            const category = (item.category || "").toLowerCase();
            const member = (item.memberID || item.username || "").toLowerCase();
            const action = (item.action || "").toLowerCase();
            const matchSearch =
                model.includes(lc) || category.includes(lc) || member.includes(lc) || action.includes(lc);

            const type = getActionType(item.action);
            const matchFilter =
                activeFilter === "all" ||
                (activeFilter === "withdraw" && type === "withdraw") ||
                (activeFilter === "receive" && type === "receive");

            return matchSearch && matchFilter;
        });
    }, [searchTerm, historyData, activeFilter]);

    const getActionBadge = (action) => {
        const type = getActionType(action);
        if (type === "withdraw") {
            return (
                <span className={`${styles.badge} ${styles.badgeWithdraw}`}>
                    <ArrowUpCircle size={13} /> Withdraw
                </span>
            );
        } else if (type === "receive") {
            return (
                <span className={`${styles.badge} ${styles.badgeReceive}`}>
                    <ArrowDownCircle size={13} /> Receive
                </span>
            );
        }
        return (
            <span className={`${styles.badge} ${styles.badgeOther}`}>
                <ArrowLeftRight size={13} /> {action || "Update"}
            </span>
        );
    };

    const getBackendOrigin = () => {
        try {
            return new URL(API_BASE_URL, window.location.origin).origin;
        } catch {
            return window.location.origin;
        }
    };

    const getFileUrl = (item, filename) => {
        const baseUrl = getBackendOrigin();
        const fileString = filename && typeof filename === 'string' ? filename.trim() : '';

        if (fileString.startsWith('http')) {
            return fileString;
        }

        if (fileString.startsWith('/')) {
            return `${baseUrl}${fileString}`;
        }

        let fileToUse = fileString;
        if (!fileToUse && item?.image && typeof item.image === 'string') {
            const image = item.image.trim();
            if (image.startsWith('http')) return image;
            if (image.startsWith('/')) return `${baseUrl}${image}`;
            if (image.includes('/web_upload/')) {
                return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
            }
            const parts = image.split('/');
            fileToUse = parts[parts.length - 1].split('?')[0];
        }

        if (!fileToUse) return null;

        const folderId = item?.order_id || item?.spare_id || item?.id;
        const folderName = `ID${folderId || 'unknown'}`;
        return `${baseUrl}/web_upload/mma_store/store/${folderName}/${fileToUse}`;
    };

    const handleViewFile = async (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
        setFileLoading(true);
        setCurrentFiles([]);

        try {
            // Priority 1: Use real_files from the item if provided by the main list API
            if (item.real_files && Array.isArray(item.real_files)) {
                setCurrentFiles(item.real_files);
                setFileLoading(false);
                return;
            }

            // Priority 2: Fetch list of files from the dedicated API if real_files is missing
            const files = await getHistoryFiles(item.id);
            if (files && files.length > 0) {
                setCurrentFiles(files);
            } else if (item.image) {
                // Priority 3: Fallback to the single image string
                setCurrentFiles([item.image]);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            if (item.image) setCurrentFiles([item.image]);
        } finally {
            setFileLoading(false);
        }
    };

    const handleDeleteFile = async (item) => {
        if (!window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await deleteHistoryFile(item.id);
            if (response && response.status === 1) {
                // Update local state by clearing the image for this item
                setHistoryData(prev => prev.map(h =>
                    h.id === item.id ? { ...h, image: null } : h
                ));
            } else {
                alert(response?.detail || "Failed to delete file.");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Error deleting file. Please try again.");
        }
    };

    const handleUploadTrigger = (id) => {
        if (!id) {
            console.warn('handleUploadTrigger called without id', { id });
            alert('Cannot upload: missing item id.');
            return;
        }

        setUploadingId(id);
        if (fileInputRef.current) {
            // store id on the input element so it's available in the change handler
            try {
                fileInputRef.current.dataset.uploadingId = id;
            } catch (err) {
                // ignore
            }

            // ensure click happens after state update to avoid race conditions
            setTimeout(() => {
                try {
                    fileInputRef.current.click();
                } catch (err) {
                    console.error('File input click failed:', err);
                }
            }, 50);
        }
    };

    const handleFileChange = async (e) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        const activeUploadingId = uploadingId || (fileInputRef.current && fileInputRef.current.dataset && fileInputRef.current.dataset.uploadingId);
        if (!files.length || !activeUploadingId) {
            console.warn('No file selected or uploadingId missing', { files, uploadingId, datasetId: fileInputRef.current?.dataset?.uploadingId });
            e.target.value = "";
            setUploadingId(null);
            try { delete fileInputRef.current.dataset.uploadingId; } catch {}
            return;
        }

        console.log('Starting upload', { uploadingId: activeUploadingId, files: files.map(f => f.name) });

        const formData = new FormData();
        files.forEach(file => formData.append("attachments[]", file));

        try {
            const response = await uploadHistoryFile(activeUploadingId, formData);
            console.log('Upload response:', response);
            if (response && response.status === 1) {
                await fetchHistory();
            } else {
                alert(response?.detail || "Upload failed");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Error uploading file(s). Check console/network for details.");
        } finally {
            e.target.value = ""; // Clear input
            setUploadingId(null);
            try { delete fileInputRef.current.dataset.uploadingId; } catch {}
        }
    };

    return (
        <>
            <div className={styles.historyLayout}>
                {/* Ambient glows */}
                <div className={styles.bgGlow1} />
                <div className={styles.bgGlow2} />
                <div className={styles.bgGlow3} />

                {/* ─── Header ─── */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}>
                            <History size={22} />
                        </div>
                        <div>
                            <h1 className={styles.pageTitle}>Transaction History</h1>
                            <p className={styles.pageSubtitle}>
                                Track every spare parts movement in real-time
                            </p>
                        </div>
                    </div>
                    <button
                        className={`${styles.refreshBtn} ${refreshing ? styles.spinning : ""}`}
                        onClick={handleRefresh}
                        title="Refresh data"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* ─── Summary Cards ─── */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.statTotal}`}>
                        <div className={styles.statIcon}>
                            <Activity size={20} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statValue}>{stats.total}</span>
                            <span className={styles.statLabel}>Total Transactions</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statWithdraw}`}>
                        <div className={styles.statIcon}>
                            <ArrowUpCircle size={20} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statValue}>{stats.withdraws}</span>
                            <span className={styles.statLabel}>Withdrawals</span>
                            <span className={styles.statSub}>{stats.totalWithdrawQty} units out</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statReceive}`}>
                        <div className={styles.statIcon}>
                            <ArrowDownCircle size={20} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statValue}>{stats.receives}</span>
                            <span className={styles.statLabel}>Receives</span>
                            <span className={styles.statSub}>{stats.totalReceiveQty} units in</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statItems}`}>
                        <div className={styles.statIcon}>
                            <Package size={20} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statValue}>{filteredData.length}</span>
                            <span className={styles.statLabel}>Showing</span>
                            <span className={styles.statSub}>filtered results</span>
                        </div>
                    </div>
                </div>

                {/* ─── Main Table Widget ─── */}
                <div className={styles.tableWidget}>
                    {/* Widget Header */}
                    <div className={styles.widgetHeader}>
                        <div className={styles.widgetTitleArea}>
                            <Zap size={18} className={styles.widgetIcon} />
                            <h3>Activity Logs</h3>
                        </div>
                        <div className={styles.widgetControls}>
                            {/* Search */}
                            <div className={styles.searchWrapper}>
                                <Search size={15} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search model, user, action..."
                                    className={styles.searchInput}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    id="history-search"
                                />
                            </div>

                            {/* Filter Tabs */}
                            <div className={styles.filterTabs}>
                                <button
                                    id="filter-all"
                                    className={`${styles.filterTab} ${activeFilter === "all" ? styles.filterTabActive : ""}`}
                                    onClick={() => setActiveFilter("all")}
                                >
                                    <Filter size={13} /> All
                                </button>
                                <button
                                    id="filter-withdraw"
                                    className={`${styles.filterTab} ${activeFilter === "withdraw" ? styles.filterTabActiveWithdraw : ""}`}
                                    onClick={() => setActiveFilter("withdraw")}
                                >
                                    <ArrowUpCircle size={13} /> Withdraw
                                </button>
                                <button
                                    id="filter-receive"
                                    className={`${styles.filterTab} ${activeFilter === "receive" ? styles.filterTabActiveReceive : ""}`}
                                    onClick={() => setActiveFilter("receive")}
                                >
                                    <ArrowDownCircle size={13} /> Receive
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Content */}
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingRing}>
                                <div /><div /><div /><div />
                            </div>
                            <p className={styles.loadingText}>Fetching activity records...</p>
                        </div>
                    ) : filteredData.length > 0 ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        <th>
                                            <span className={styles.thInner}><Clock size={13} /> Date & Time</span>
                                        </th>
                                        <th>
                                            <span className={styles.thInner}><User size={13} /> User</span>
                                        </th>
                                        <th>
                                            <span className={styles.thInner}><Package size={13} /> Model / Item</span>
                                        </th>
                                        <th>
                                            <span className={styles.thInner}><Tag size={13} /> Category</span>
                                        </th>
                                        <th>
                                            <span className={styles.thInner}><ArrowLeftRight size={13} /> Action</span>
                                        </th>
                                        <th className={styles.thCenter}>Qty</th>
                                        <th>Use For</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => {
                                        const { date, time } = formatDate(item.create_at);
                                        return (
                                            <tr
                                                key={item.id || index}
                                                className={styles.tableRow}
                                                style={{ animationDelay: `${index * 30}ms` }}
                                            >
                                                <td>
                                                    <div className={styles.dateCell}>
                                                        <span className={styles.dateText}>{date}</span>
                                                        {time && <span className={styles.timeText}>{time}</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <div className={styles.userAvatar}>
                                                            {(item.username || item.memberID || "?")[0].toUpperCase()}
                                                        </div>
                                                        <span>{item.username || item.memberID || "System"}</span>
                                                    </div>
                                                </td>
                                                <td className={styles.modelCell}>
                                                    {item.model || item.spare_name || "—"}
                                                </td>
                                                <td>
                                                    <span className={styles.categoryPill}>
                                                        {item.category || "General"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionCell}>
                                                        {getActionBadge(item.action)}
                                                        {item.image ? (
                                                            <>
                                                                <button
                                                                    className={styles.viewBtn}
                                                                    onClick={() => handleViewFile(item)}
                                                                    title="View attached file"
                                                                >
                                                                    <ImageIcon size={14} />
                                                                </button>
                                                                {/* <button
                                                                    className={styles.deleteBtn}
                                                                    onClick={() => handleDeleteFile(item)}
                                                                    title="Delete file"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button> */}
                                                            </>
                                                        ) : (
                                                            user?.role === 'admin' && (
                                                                <button
                                                                    type="button"
                                                                    className={styles.uploadBtn}
                                                                    onClick={() => handleUploadTrigger(
                                                                        item.id || item.order_id || item.spare_id || item.history_id || item.transaction_id || item.ID || item.detail_id
                                                                    )}
                                                                    title="Add attachment"
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={styles.qtyCell}>
                                                    <span className={styles.qtyValue}>
                                                        {item.quantity || item.WithdrawQuantity || item.ReceiveQuantity || 1}
                                                    </span>
                                                </td>
                                                <td className={styles.useForCell}>
                                                    {item.use_for || "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIconWrap}>
                                <Inbox size={36} />
                            </div>
                            <h4 className={styles.emptyTitle}>No Records Found</h4>
                            <p className={styles.emptyDesc}>
                                {searchTerm
                                    ? `No results match "${searchTerm}". Try a different keyword.`
                                    : "No transaction history available yet."}
                            </p>
                            {searchTerm && (
                                <button
                                    className={styles.clearSearchBtn}
                                    onClick={() => setSearchTerm("")}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}

                    {/* Footer count */}
                    {!loading && filteredData.length > 0 && (
                        <div className={styles.tableFooter}>
                            Showing <strong>{filteredData.length}</strong> of <strong>{historyData.length}</strong> records
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Image Modal ─── */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {/* Modal content same as before ... */}
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleArea}>
                                <FileText size={20} className={styles.modalTitleIcon} />
                                <div>
                                    <h3>Attached Files</h3>
                                    {currentItem && <p className={styles.modalSubtitle}>{currentItem.model || currentItem.spare_name}</p>}
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {fileLoading ? (
                                <div className={styles.modalLoading}>
                                    <RefreshCw size={24} className={styles.spinning} />
                                    <p>Loading files...</p>
                                </div>
                            ) : currentFiles.length > 0 ? (
                                <div className={styles.fileGallery}>
                                    {currentFiles.map((fileName, idx) => {
                                        const url = getFileUrl(currentItem, fileName);
                                        const isPdf = fileName.toLowerCase().endsWith('.pdf');
                                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

                                        return (
                                            <div key={idx} className={styles.fileItem}>
                                                <div className={styles.filePreview}>
                                                    {isImage ? (
                                                        <img src={url} alt={fileName} className={styles.galleryImage} />
                                                    ) : isPdf ? (
                                                        <div className={styles.pdfPlaceholder}>
                                                            <FileText size={40} />
                                                            <span>PDF Document</span>
                                                        </div>
                                                    ) : (
                                                        <div className={styles.genericPlaceholder}>
                                                            <ImageIcon size={40} />
                                                            <span>{fileName.split('.').pop().toUpperCase()} File</span>
                                                        </div>
                                                    )}
                                                    <div className={styles.fileOverlay}>
                                                        <a href={url} target="_blank" rel="noreferrer" className={styles.overlayBtn}>
                                                            <Eye size={16} />
                                                        </a>
                                                        <a href={url} download={fileName} className={styles.overlayBtn}>
                                                            <ArrowDownCircle size={16} />
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className={styles.fileInfo}>
                                                    <span className={styles.fileName} title={fileName}>{fileName}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={styles.noFiles}>
                                    <Inbox size={48} />
                                    <p>No files attached to this transaction.</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.modalCloseButton} onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                multiple
                style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
            />
        </>
    );
};

export default HistorySpareTransaction;
