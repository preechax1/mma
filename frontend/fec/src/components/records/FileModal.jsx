import { useEffect, useState } from "react";
import {
  fetchFilesByRecord,
  uploadFile,
  deleteFile,
} from "../../services/FileModalService";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-3/4 max-w-5xl rounded-xl p-6 shadow-xl">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">จัดการไฟล์</h2>
          <button
            onClick={onClose}
            className="text-red-500 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* ================= UPLOAD ================= */}
        <div className="mb-4 flex items-center gap-4">
          <input
            type="file"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="border p-2 rounded"
          />

          {uploading && (
            <span className="text-blue-500 text-sm">
              กำลังอัปโหลด...
            </span>
          )}
        </div>

        {/* ================= FILE LIST ================= */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {files.length === 0 && (
              <p className="text-gray-500">ไม่มีไฟล์</p>
            )}

            {files.map((file) => (
              <div
                key={file.full_path}
                className="border rounded-lg p-2 relative shadow-sm hover:shadow-md transition"
              >
                <img
                  src={file.file_url}
                  alt="file"
                  className="w-full h-32 object-cover rounded"
                />

                <button
                  onClick={() => handleDelete(file.full_path)}
                  className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileModal;