import React, { useEffect, useState } from 'react';
import { getStatusStationID } from '../../../services/ManageStationService';
import styles from './StationModal.module.css';

const StationModal = ({ isOpen, onClose, stationId, onConfirm }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newStatus, setNewStatus] = useState("");

    useEffect(() => {
        if (isOpen && stationId) {
            fetchDetail();
        }
    }, [isOpen, stationId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getStatusStationID(stationId);
            if (res && res.status === 1) {
                setData(res.data[0]); // สมมติว่า return มาเป็น array
                setNewStatus(res.data[0].registration_status);
            }
        } catch (error) {
            console.error("Error fetching detail", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3>Manage Station ID: {stationId}</h3>
                <hr />
                {loading ? <p>Loading...</p> : data && (
                    <div className={styles.content}>
                        <p><strong>Name:</strong> {data.station}</p>
                        <p><strong>Current Status:</strong> {data.registration_status}</p>
                        
                        <div className={styles.formGroup}>
                            <label>Change Status to:</label>
                            <select 
                                value={newStatus} 
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                <option value="ON">ON</option>
                                <option value="OFF">OFF</option>
                                <option value="EOL">EOL</option>
                            </select>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                            <button 
                                className={styles.confirmBtn} 
                                onClick={() => onConfirm(stationId, newStatus)}
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StationModal;