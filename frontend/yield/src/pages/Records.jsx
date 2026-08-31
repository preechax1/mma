import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
// แก้ไขการอิมพอร์ต: ดึงฟังก์ชันสำหรับจัดการตารางข้อมูลหลักมาใช้แทน
import {
    getRecords,
    getSerial,
    getRecordById
} from "../services/RecordsService";

import RecordsChois from "../components/records/RecordsChois";
import RecordsTable from "../components/records/Record";

import styles from "./Records.module.css";

export default function Records() {
    const { serial, id } = useParams(); 
    const location = useLocation(); 

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // สร้างสถานะสำหรับเก็บค่าที่ถูกเลือกจาก Selectbox (ถ้าจำเป็นต้องใช้กรองข้อมูลตาราง)
    const [selectedFilters, setSelectedFilters] = useState({
        groupName: "",
        phase: "",
        product: "",
        model: ""
    });

    const handleFilterChange = (filterType, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        // คุณสามารถเขียนฟังก์ชันดึงข้อมูลใหม่เพื่อกรองในตารางต่อได้จากตรงนี้
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                let result;

                if (location.pathname.includes("/recordsn/")) {
                    result = await getSerial(serial);
                } else if (location.pathname.includes("/recordid/")) {
                    result = await getRecordById(id);
                } else {
                    result = await getRecords();
                }

                const finalData = Array.isArray(result)
                    ? result
                    : result
                        ? [result]
                        : [];
                setData(finalData);
            } catch (error) {
                console.error("Failed to fetch records:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [serial, id, location.pathname]); 

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

            {/* เพิ่มส่วนกล่องเครื่องมือเลือกด้านบนของตารางข้อมูล */}
            <div className="mb-4">
                <RecordsChois onFilterChange={handleFilterChange} />
            </div>

            {loading ? (
                <div className={styles.loadingWrapper}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>กำลังโหลดข้อมูล...</p>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <RecordsTable data={data} loading={loading} />
                </div>
            )}
        </div>
    );
}