import { useState, useEffect } from "react";
import { getDetailForm, postDetailForm } from "../../services/StationDetailFormService";
import styles from "./DetailForm.module.css";

export default function DetailForm({ selectedTool, isModalOpen, onCloseModal, onSaveSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        stationID: '',
        station: '',
        product: '',
        status: '',
        problem: '',
        cause_of_problem: '',
        corrective_action: '',
        failure_category: '',
        fileupload: null
    });

    const [options, setOptions] = useState({
        problem: [],
        cause: [],
        action: [],
        failure: [],
        status: []
    });

    useEffect(() => {
        const fetchData = async () => {
            const id = selectedTool?.station_id || selectedTool?.id;
            if (isModalOpen && id) {
                try {
                    const res = await getDetailForm(id);
                    if (res) {
                        setFormData({
                            stationID: res.description?.stationID || id,
                            station: res.description?.station || '',
                            product: res.description?.product || '',
                            status: res.description?.status?.toUpperCase() || 'IDLE',
                            problem: res.description?.status === 'Down' ? res.description?.problem || '' : '',
                            cause_of_problem: res.description?.status === 'Down' ? res.description?.cause_of_problem || '' : '',
                            corrective_action: res.description?.status === 'Down' ? res.description?.corrective_action || '' : '',
                            failure_category: res.description?.status === 'Down' ? res.description?.failure_category || '' : '',
                            fileupload: null
                        });
                        setOptions({
                            problem: res.problem_options || [],
                            cause: res.cause_options || [],
                            action: res.action_options || [],
                            failure: res.failure_options || [],
                            status: res.status_options || []
                        });
                    }
                } catch (e) {
                    console.error("Fetch Error:", e);
                }
            }
        };
        fetchData();
    }, [selectedTool, isModalOpen]);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        const val = files ? files : value;
        setFormData(prev => {
            let newData = { ...prev, [name]: val };
            if (name === 'status' && val === 'DOWN EQUIPMENT') {
                newData = {
                    ...newData,
                    problem: 'Not enough spare to support',
                    cause_of_problem: 'Not enough spare to support',
                    failure_category: 'Equipment Send to calibration'
                };
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSend = new FormData();
        dataToSend.append("function", "stationupdate");
        Object.keys(formData).forEach(key => {
            if (key === 'fileupload' && formData.fileupload) {
                Array.from(formData.fileupload).forEach(file => {
                    dataToSend.append("fileupload[]", file);
                });
            } else {
                dataToSend.append(key, formData[key]);
            }
        });

        try {
            const result = await postDetailForm(dataToSend);

            if (result.status === 1) {
                alert("บันทึกข้อมูลเรียบร้อย!");
                if (onSaveSuccess) onSaveSuccess();
                onCloseModal();
            } else {
                alert("เกิดข้อผิดพลาด: " + (result.message || "Unknown Error"));
            }

        } catch (error) {
            console.error("Submit Error:", error);
            alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        } finally {
            setLoading(false);
        }
    };

    if (!isModalOpen || !selectedTool) return null;

    // Helper สำหรับสร้าง Dynamic Status Class
    const getStatusClass = (status) => {
        const s = (status || '').toLowerCase().trim();
        if (s.includes('ready')) return styles.statusReady;
        if (s.includes('down equipment')) return styles.statusDownEq;
        if (s.includes('down')) return styles.statusDown;
        return '';
    };

    return (
        <div className={styles.modalOverlay} onClick={onCloseModal}>
            <div className={styles.detailFormModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.cardTitle}>
                        🛠 Update Station: {formData.station}
                    </h3>
                    <button className={styles.closeX} onClick={onCloseModal}>&times;</button>
                </div>

                <div className={styles.modalBody}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formSection}>
                            <span className={styles.sectionTitle}>STATION INFORMATION</span>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Current Product</label>
                                    <input
                                        type="text"
                                        className={`${styles.formControl} ${styles.readOnly}`}
                                        value={formData.product}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formField} style={{ flex: '0 0 360px' }}>
                                    <label className={styles.formLabel}>Station Name</label>
                                    <input
                                        type="text"
                                        className={`${styles.formControl} ${styles.readOnly}`}
                                        value={formData.station}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>New Status</label>
                                    <select
                                        name="status"
                                        className={`${styles.formControl} ${getStatusClass(formData.status)}`}
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        {options.status.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                        {!options.status.includes('DOWN EQUIPMENT') && (
                                            <option value="DOWN EQUIPMENT">DOWN EQUIPMENT</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <span className={styles.sectionTitle}>ISSUE & MAINTENANCE</span>
                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Problem Found</label>
                                <input
                                    list="p_list"
                                    name="problem"
                                    className={styles.formControl}
                                    value={formData.problem}
                                    onChange={handleInputChange}
                                    placeholder="Describe the issue..."
                                />
                                <datalist id="p_list">
                                    {options.problem.map(o => <option key={o} value={o} />)}
                                </datalist>
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Root Cause</label>
                                <input
                                    list="c_list"
                                    name="cause_of_problem"
                                    className={styles.formControl}
                                    value={formData.cause_of_problem}
                                    onChange={handleInputChange}
                                    placeholder="What caused this?"
                                />
                                <datalist id="c_list">
                                    {options.cause.map(o => <option key={o} value={o} />)}
                                </datalist>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formField} style={{ flex: 2 }}>
                                    <label className={styles.formLabel}>Corrective Action</label>
                                    <input
                                        list="a_list"
                                        name="corrective_action"
                                        className={styles.formControl}
                                        value={formData.corrective_action}
                                        onChange={handleInputChange}
                                        placeholder="How was it fixed?"
                                    />
                                    <datalist id="a_list">
                                        {options.action.map(o => <option key={o} value={o} />)}
                                    </datalist>
                                </div>
                                <div className={styles.formField} style={{ flex: 1 }}>
                                    <label className={styles.formLabel}>Failure Category</label>
                                    <select
                                        name="failure_category"
                                        className={styles.formControl}
                                        value={formData.failure_category}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- Select --</option>
                                        {options.failure.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                        <option value="Equipment Send to calibration">Equipment Send to calibration</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formField} style={{ marginTop: '10px' }}>
                                <label className={styles.formLabel}>📎 Upload Evidence</label>
                                <input
                                    type="file"
                                    name="fileupload"
                                    className={styles.formControl}
                                    multiple
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" className={styles.btnDiscard} onClick={onCloseModal}>
                                Discard
                            </button>
                            <button type="submit" className={styles.btnSave} disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}