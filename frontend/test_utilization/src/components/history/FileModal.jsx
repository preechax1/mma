import { useEffect, useState, useCallback } from "react";
import { getFiles, uploadFile, deleteFile } from "../../services/historyService";
import { createPortal } from "react-dom";
import styles from "./FileModal.module.css"; // เรียกใช้เป็น Object

export const FileModal = ({ recordId, isOpen, onClose }) => {
    const fileHost = "http://localhost"; // อย่าลืมเปลี่ยนเป็น IP จริงเมื่อ Deploy
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(null); // NULL = ปิด, NUMBER = เปิดรูปที่ INDEX นั้น

    const loadFiles = useCallback(async () => {
        if (!recordId) return;
        setLoading(true);
        try {
            const res = await getFiles(recordId);
            if (Array.isArray(res)) {
                setFiles(res);
            } else {
                setFiles([]); // กรณี API ส่งกลับมาไม่ใช่ Array
            }
        } catch (err) {
            console.error("Error loading files:", err);
            alert("❌ ไม่สามารถโหลดไฟล์ได้");
        } finally {
            setLoading(false);
        }
    }, [recordId]);

    useEffect(() => {
        if (isOpen) {
            loadFiles();
            setViewerIndex(null); // ปิด Viewer ทุกครั้งที่เปิด Modal
        }
    }, [isOpen, loadFiles]);

    // คุมการใช้ keyboard (Esc, Left, Right) สำหรับ Viewer
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (viewerIndex === null) return;
            if (e.key === "Escape") setViewerIndex(null);
            if (e.key === "ArrowLeft") setViewerIndex(prev => (prev > 0 ? prev - 1 : files.length - 1));
            if (e.key === "ArrowRight") setViewerIndex(prev => (prev < files.length - 1 ? prev + 1 : 0));
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [viewerIndex, files]);

    const handleUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (!selectedFiles.length) return;

        // ตรวจสอบขนาดไฟล์เบื้องต้น (เช่น ห้ามเกิน 10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (selectedFiles.some(file => file.size > MAX_SIZE)) {
            alert("❌ ไฟล์บางไฟล์มีขนาดใหญ่เกิน 10MB");
            e.target.value = null;
            return;
        }

        setUploading(true);
        try {
            for (const file of selectedFiles) {
                await uploadFile(recordId, file);
            }
            await loadFiles();
        } catch (err) {
            console.error("Upload failed:", err);
            alert("❌ อัปโหลดไฟล์ล้มเหลว");
        } finally {
            setUploading(false);
            e.target.value = null; // reset input
        }
    };

    const handleDelete = async (file, e) => {
    e.stopPropagation();
    if (!confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้?")) return;

    try {
        await deleteFile(recordId, file.name); 
        await loadFiles();
    } catch (err) {
        console.error("Delete failed:", err);
        alert("❌ ลบไฟล์ล้มเหลว");
    }
};

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>

                {/* --- HEADER --- */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitleGroup}>
                        <h2 className={styles.modalTitle}>ศูนย์กลางไฟล์แนบ</h2>
                        <span className={styles.modalSubtitle}>รายการ #️⃣{recordId || 'N/A'}</span>
                    </div>
                    <button className={styles.modalCloseBtn} onClick={onClose} title="ปิด (Esc)">✕</button>
                </div>

                {/* --- TOP ACTIONS (Upload) --- */}
                <div className={styles.topActions}>
                    <label className={`${styles.uploadBtn} ${uploading ? styles.uploading : ''}`}>
                        <input type="file" multiple onChange={handleUpload} disabled={uploading} />
                        {uploading ? (
                            <div className={styles.spinner}></div>
                        ) : (
                            <>
                                <span className={styles.uploadIcon}>➕</span>
                                <span className={styles.uploadText}>เพิ่มไฟล์</span>
                            </>
                        )}
                    </label>
                    <span className={styles.uploadHint}>รองรับ: JPG, PNG, PDF, ZIP (Max 10MB)</span>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className={styles.fileContentArea}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : files.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>📂</span>
                            ยังไม่มีไฟล์แนบในรายการนี้
                        </div>
                    ) : (
                        <div className={styles.fileGrid}>
                            {files.map((file, index) => {
                                const isImage = ["jpg", "jpeg", "png", "gif"].includes(file.ext?.toLowerCase());
                                const fileUrl = `${fileHost}${file.file_url}`;

                                return (
                                    <div key={index} className={styles.fileCardV2}>
                                        <div className={styles.filePreview} onClick={() => isImage && setViewerIndex(index)}>
                                            {isImage ? (
                                                <img
                                                    src={fileUrl}
                                                    className={styles.fileThumb}
                                                    alt={file.name}
                                                    loading="lazy" // ประหยัด data
                                                />
                                            ) : (
                                                <div className={styles.fileIconBox}>{file.ext?.toUpperCase() || '❓'}</div>
                                            )}
                                                <button
                                                    className={styles.btnDelFile}
                                                    onClick={(e) => handleDelete(file, e)}
                                                    title="ลบไฟล์"
                                                >
                                                    ✕
                                                </button>
                                        </div>
                                        <div className={styles.fileInfo}>
                                            <a href={fileUrl} target="_blank" rel="noreferrer" className={styles.fileLink} title={file.name}>
                                                {file.name}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* --- FULLSCREEN IMAGE VIEWER --- */}
            {viewerIndex !== null && (
                <div className={styles.viewerOverlay} onClick={() => setViewerIndex(null)}>
                    <button className={styles.viewerClose} onClick={() => setViewerIndex(null)}>✕</button>
                    <img
                        src={`${fileHost}${files[viewerIndex].file_url}`}
                        alt="Fullscreen preview"
                        onClick={(e) => e.stopPropagation()} // คลิกรูปไม่ปิด viewer
                    />
                    <div className={styles.viewerInfo}>{files[viewerIndex].name}</div>
                </div>
            )}
        </div>,
        document.body // เรนเดอร์นอก DOM ปกติ
    );
};