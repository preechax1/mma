import styles from "./DetailCard.module.css";
import useStationDetail from "./comDetailCard/hooks/useStationDetail";

import ImageSection from "./comDetailCard/ImageSection";
import PMCard from "./comDetailCard/PMCard";
import EquipmentTable from "./comDetailCard/EquipmentTable";
import UtilizationSummary from "./comDetailCard/UtilizationSummary";
import StatusCard from "./comDetailCard/StatusCard";
import ReadinessCard from "./comDetailCard/ReadinessCard";
import TestTimeLine from "./comDetailCard/TestTimeLine";

export default function DetailCard({ detail, isOpen, onClose }) {
    const {
        images,
        pm,
        equipments,
        summary,
        loadingImages,
        status,
        readiness,
        testtimeline
    } = useStationDetail(detail, isOpen);

    if (!isOpen || !detail) return null;

    return (
        <div className={styles.stationModalOverlay} onClick={onClose}>
            <div className={styles.stationModal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <span className={styles.statusIndicator}></span>
                        <h2>Station : {detail.id_station}</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </header>

                <div className={styles.modalContent}>
                    {/* ===== แถวบน: 2 Main Columns ===== */}
                    <div className={`${styles.gridRow} ${styles.topRow}`}>
                        <section className={styles.imageSection}>
                            <ImageSection images={images} loading={loadingImages} />
                        </section>

                        <div className={styles.infoGroup}>
                            <div className={styles.middleColumn}>
                                <div className={styles.cardWrapper}>
                                    <ReadinessCard status={readiness} />
                                </div>
                                <div className={styles.cardWrapper}>
                                    <UtilizationSummary summary={summary} />
                                </div>
                            </div>

                            <div className={styles.rightColumn}>
                                <div className={styles.cardWrapper}>
                                    <StatusCard status={status} />
                                </div>
                                <div className={styles.cardWrapper}>
                                    <PMCard pm={pm} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== แถวล่าง: Timeline / Equipment ===== */}
                    <div className={`${styles.gridRow} ${styles.bottomRow}`}>
                        <div className={styles.cardWrapper}>
                            <TestTimeLine testtimeline={testtimeline} />
                        </div>
                        <div className={styles.cardWrapper}>
                            <EquipmentTable equipments={equipments} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}