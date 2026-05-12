import { useEffect, useState } from "react";
import {
  fetchFilesByRecord,
  uploadFile,
  deleteFile,
} from "../../services/FileModalService";

import styles from "./FileModal.module.css";

const FileModal = ({ recordId, isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ==============================
     โหลดไฟล์
  ============================== */
  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await fetchFilesByRecord(recordId);
      setFiles(data || []);
    } catch (err) {
      console.error("Load files error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && recordId) {
      loadFiles();
    }
  }, [isOpen, recordId]);

  /* ==============================
     Upload (รองรับหลายไฟล์)
  ============================== */
  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);

      for (const file of selectedFiles) {
        await uploadFile(recordId, file);
      }

      await loadFiles();
      e.target.value = null; // reset input
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload ไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  /* ==============================
     Delete
  ============================== */
  const handleDelete = async (filePath) => {
    if (!window.confirm("ลบไฟล์นี้หรือไม่?")) return;

    try {
      await deleteFile(filePath);
      await loadFiles();
    } catch (err) {
      console.error("Delete error:", err);
      alert("ลบไฟล์ไม่สำเร็จ");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* ================= HEADER ================= */}
        <div className={styles.header}>
          <h2 className={styles.title}>File Management</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
          >
            ✕
          </button>
        </div>

        {/* ================= UPLOAD ================= */}
        <div className={styles.uploadSection}>
          <input
            type="file"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className={styles.fileInput}
          />

          {uploading && (
            <div className={styles.uploadingText}>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </div>
          )}
        </div>

        {/* ================= FILE LIST ================= */}
        <div className={styles.fileGrid}>
          {loading ? (
            <div className={styles.emptyState}>
              <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
              <p>Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className={styles.emptyState}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No files attached yet</p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.full_path}
                className={styles.fileCard}
              >
                <img
                  src={file.file_url}
                  alt="file"
                  className={styles.fileImg}
                />

                <button
                  onClick={() => handleDelete(file.full_path)}
                  className={styles.deleteBtn}
                  title="Delete file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FileModal;