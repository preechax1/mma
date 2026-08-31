// D:\Docker\mma\frontend\fec\src\pages\Records.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
    getRecords,
    getSerial,
    getRecordById,
} from "../services/RecordsService";

import RecordsTable from "../components/records/Record";

import styles from "./Records.module.css";

export default function Records() {
    const { serial, id } = useParams(); // รับค่า serial หรือ id จาก URL
    const location = useLocation(); // ใช้เช็ค path ปัจจุบัน

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                let result;

                // เช็คเงื่อนไขจาก URL Path ว่าจะใช้ API ตัวไหน
                if (location.pathname.includes("/recordsn/")) {
                    // กรณีเรียกตาม Serial
                    result = await getSerial(serial);
                } else if (location.pathname.includes("/recordid/")) {
                    // กรณีเรียกตาม ID
                    result = await getRecordById(id);
                } else {
                    // กรณีเรียกทั้งหมด
                    result = await getRecords();
                }

                // จัดการข้อมูลให้เป็น Array เสมอ (เผื่อ API ส่ง object มาตัวเดียว)
                const finalData = Array.isArray(result)
                    ? result
                    : result
                        ? [result]
                        : [];
                setData(finalData);
            } catch (error) {
                console.error("Failed to fetch:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [serial, id, location.pathname]); // ทำใหม่เมื่อ ID หรือ Path เปลี่ยน

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h4 className={styles.title}>
                    {location.pathname.includes("/recordsn") ? (
                        <>
                            Serial Search: <span className={styles.titleSpan}>{serial || id}</span>
                        </>
                    ) : location.pathname.includes("/recordid") ? (
                        <>
                            Record ID: <span className={styles.titleSpan}>{id}</span>
                        </>
                    ) : (
                        "Production Records"
                    )}
                </h4>
            </header>

            {loading ? (
                <div className={styles.loadingWrapper}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>กำลังโหลดข้อมูล...</p>
                </div>
            ) : (
                <RecordsTable data={data} loading={loading} />
            )}
        </div>
    );
}
