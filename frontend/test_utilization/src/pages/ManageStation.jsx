import { useEffect, useState, useCallback } from "react";
import { getStatusStationList, postStatusStationID } from "../services/ManageStationService";
import ManageTable from "../components/StationDetail/comManageStation/ManageTable";
import StationModal from "../components/StationDetail/comManageStation/StationModal";
import styles from "./ManageStation.module.css";

export default function ManageStation() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State สำหรับ Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getStatusStationList();
            if (res && res.status === 1) setStations(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // เมื่อกดปุ่ม Manage ในตาราง
    const handleManage = (item) => {
        setSelectedId(item.stationID);
        setIsModalOpen(true);
    };

    // เมื่อกดปุ่ม Update ใน Modal
    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await postStatusStationID(id, status);
            if (res.status === 1) {
                alert("Update Success!");
                setIsModalOpen(false);
                loadData(); // โหลดตารางใหม่หลังแก้ไข
            } else {
                alert("Update Failed: " + res.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Station Management</h1>
            {loading ? <p>Loading...</p> : (
                <ManageTable stations={stations} onManage={handleManage} />
            )}

            <StationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                stationId={selectedId}
                onConfirm={handleUpdateStatus}
            />
        </div>
    );
}