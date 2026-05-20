import { useRef } from "react";
import styles from "./FileDropzone.module.css";

export default function FileDropzone({
    onUpload,
    multiple = false,
    uploadMsg, // ✅ รับค่าจาก parent
}) {
    const fileInputRef = useRef(null);

    const handleClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        if (e.target.files?.length > 0) {
            onUpload(e.target.files);
        }
    };

    const isError = uploadMsg?.toLowerCase().includes("error");

    return (
        <div className={styles.dropzoneContainer}>
            <div className={styles.dropzone} onClick={handleClick}>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    onChange={handleFileChange}
                    className={styles.fileInput}
                />

                <div className={styles.contentWrapper}>
                    <div className={styles.iconWrapper}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                    </div>

                    <div className={styles.textGroup}>
                        <p className={styles.mainText}>Drag & Drop file here</p>
                        <p className={styles.subText}>or click to browse from your computer</p>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className={styles.decorativeCircle}></div>
            </div>

            {/* ✅ แสดงผลตรงนี้ */}
            {uploadMsg && (
                <div
                    className={`${styles.message} ${isError ? styles.error : styles.success}`}
                >
                    <div
                        className={`${styles.dot} ${isError ? styles.errorDot : styles.successDot}`}
                    ></div>
                    {uploadMsg}
                </div>
            )}
        </div>
    );
}