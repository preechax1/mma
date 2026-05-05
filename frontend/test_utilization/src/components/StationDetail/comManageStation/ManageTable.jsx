import React from 'react';
import styles from './ManageTable.module.css';

const ManageTable = ({ stations, onManage }) => {
    // ฟังก์ชันช่วยจัดการสีตามสถานะเครื่อง
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Run': return styles.dotRun;
            case 'Idle': return styles.dotIdle;
            case 'Offline': return styles.dotOffline;
            default: return styles.dotDefault;
        }
    };

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Station Name</th>
                        <th>Registration</th>
                        <th>Machine Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {stations.length > 0 ? (
                        stations.map((item) => (
                            <tr key={item.stationID}>
                                <td>{item.stationID}</td>
                                <td className={styles.stationName}>{item.station}</td>
                                <td>
                                    <span className={`${styles.badge} ${item.registration_status === 'ON' ? styles.bgOn : styles.bgEol}`}>
                                        {item.registration_status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.statusGroup}>
                                        <span className={`${styles.dot} ${getStatusStyle(item.machine_status)}`}></span>
                                        {item.machine_status}
                                    </div>
                                </td>
                                <td>
                                    <button 
                                        className={styles.manageBtn}
                                        onClick={() => onManage(item)}
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className={styles.noData}>ไม่พบข้อมูลในระบบ</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ManageTable;