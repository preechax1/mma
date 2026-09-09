import React, { useState, useEffect } from 'react';
import {
    X, Save, Package, Tag, DollarSign, Layers,
    Image as ImageIcon, FileText, Settings
} from 'lucide-react';
import styles from './ModelForm.module.css';

const ModelForm = ({ modelToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        image: '',
        specs: ''
    });

    useEffect(() => {
        if (modelToEdit) {
            setFormData({
                ...modelToEdit,
                specs: modelToEdit.specs ? JSON.stringify(modelToEdit.specs, null, 2) : ''
            });
        }
    }, [modelToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const modelData = {
            ...formData,
            price: formData.price ? parseFloat(formData.price) : 0,
            stock: formData.stock ? parseInt(formData.stock) : 0,
            specs: formData.specs ? JSON.parse(formData.specs || '{}') : {}
        };
        onSave(modelData);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <div className={styles.headerIcon}>
                            <Package size={24} />
                        </div>
                        <h2>{modelToEdit ? 'Edit Model' : 'Add New Model'}</h2>
                    </div>
                    <button className={styles.closeButton} onClick={onCancel} type="button">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formBody}>
                        <div className={styles.formGroup}>
                            <label><Package size={16} /> Model Name</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`${styles.inputField} ${styles.noIcon}`}
                                    placeholder="Enter complete model name"
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label><Tag size={16} /> Category</label>
                                <div className={styles.inputWrapper}>
                                    <Tag className={styles.inputIcon} size={18} />
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className={styles.inputField}
                                        placeholder="e.g. Sensors"
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label><DollarSign size={16} /> Price ($)</label>
                                <div className={styles.inputWrapper}>
                                    <DollarSign className={styles.inputIcon} size={18} />
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        className={styles.inputField}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label><Layers size={16} /> Stock</label>
                                <div className={styles.inputWrapper}>
                                    <Layers className={styles.inputIcon} size={18} />
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                        className={styles.inputField}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label><ImageIcon size={16} /> Image URL</label>
                                <div className={styles.inputWrapper}>
                                    <ImageIcon className={styles.inputIcon} size={18} />
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className={styles.inputField}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label><FileText size={16} /> Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className={styles.textareaField}
                                placeholder="Enter detailed description of the model..."
                            ></textarea>
                        </div>

                        <div className={styles.formGroup}>
                            <label><Settings size={16} /> Specs (JSON format)</label>
                            <textarea
                                name="specs"
                                value={formData.specs}
                                onChange={handleChange}
                                rows="4"
                                className={`${styles.textareaField} ${styles.specsField}`}
                                placeholder='{&#10;  "Impedance": "50 Ohm",&#10;  "Voltage": "24V DC"&#10;}'
                            ></textarea>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                            <Save size={18} />
                            Save Model
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModelForm;
