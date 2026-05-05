import { useState } from "react";
import { statusColor } from "../../utils/chartUtils";
import DetailCard from "./DetailCard";
import styles from "./StatusStation.module.css"; // 1. Import styles

export default function StatusStation({ details }) {
    const [selectedTool, setSelectedTool] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleToolClick = (detail) => {
        setSelectedTool(detail);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTool(null);
    };

    
    return (
        <>
            {/* 2. ใช้ styles.heatmap */}
            <div className={styles.heatmap}>
                {details.map((detail, index) => (
                    <div
                        key={`${detail.id_station}-${index}`}
                        className={styles.detailBox} // 3. ใช้ styles.detailBox
                        onClick={() => handleToolClick(detail)}
                        style={{ background: statusColor(detail.status) }}
                        title={`View ${detail.station_name} status`}
                    >
                        {detail.station_name}
                    </div>
                ))}
            </div>

            <DetailCard
                detail={selectedTool}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
}