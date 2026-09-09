import React, { useEffect, useState } from "react";
import { getCategories } from "../../services/SpareService";
import { useAuth } from "../../context/AuthContext";

// เปลี่ยนการ Import CSS เป็น Module
import styles from "./SpareForm.module.css";

const SpareForm = ({ spare, onSave }) => {
    const [categories, setCategories] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const { user } = useAuth();

    const [form, setForm] = useState({
        category: "",
        model: "",
        purchasing: "",
        part_number: "",
        minimum_stock: 0,
        onhand: 0,
        storage: "",
        description: "",
        for_product: "",
        spare_type: "Spare",
        image: null
    });

    useEffect(() => {
        loadCategories();
        if (spare) {
            setForm({
                category: spare.category || "",
                model: spare.model || "",
                purchasing: spare.purchasing || "",
                part_number: spare.part_number || "",
                minimum_stock: spare.minimum_stock || 0,
                onhand: spare.onhand || 0,
                storage: spare.storage || "",
                description: spare.description || "",
                for_product: spare.for_product || "",
                spare_type: spare.spare_type || "",
                image: null
            });
            setImagePreview(spare.image);
        }
    }, [spare]);

    const loadCategories = async () => {
        const data = await getCategories();
        setCategories(data);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            setForm({ ...form, image: file });
            setImagePreview(URL.createObjectURL(file));
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.keys(form).forEach((key) => {
            if (form[key] !== null && form[key] !== "") {
                fd.append(key, form[key]);
            }
        });
        onSave(fd);
    };

    const isLowStock = Number(form.onhand) <= Number(form.minimum_stock);

    return (
        <form onSubmit={handleSubmit} className={styles.spareForm}>
            {/* IMAGE SECTION */}
            <div className={styles.imageSection}>
                <div className={styles.imagePreviewWrapper}>
                    <img
                        src={imagePreview || "http://localhost:8080/uploads/spare/model/No_Image_Available.jpg"}
                        alt="preview"
                        onError={(e) => {
                            e.target.src = "http://localhost:8080/uploads/spare/model/No_Image_Available.jpg";
                        }}
                    />
                </div>
                <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    className={styles.fileInput}
                />
            </div>

            {/* FORM GRID */}
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Type</label>
                    <input name="spare_type" value={form.spare_type} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>Model</label>
                    <input name="model" value={form.model} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>Part Number *</label>
                    <input
                        name="part_number"
                        value={form.part_number}
                        onChange={handleChange}
                        required
                        placeholder="Enter a unique part number"
                    />
                </div>

                

                <div className={styles.formGroup}>
                    <label>Min Stock (Required)</label>
                    <input type="number" name="minimum_stock" value={form.minimum_stock} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>On Hand</label>
                    <input
                        type="number"
                        name="onhand"
                        value={form.onhand}
                        onChange={handleChange}
                        className={isLowStock ? styles.lowStock : ""}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Purchasing</label>
                    <input name="purchasing" value={form.purchasing} onChange={handleChange} />
                </div>

                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
                </div>

                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label>For Product</label>
                    <textarea name="for_product" value={form.for_product} onChange={handleChange} rows={2} />
                </div>

                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label>Storage (Area)</label>
                    <textarea name="storage" value={form.storage} onChange={handleChange} rows={2} />
                </div>

                <div className={styles.formActions}>
                    <button type="submit" className={styles.submitBtn}>
                        {spare ? "Update Spare" : "Add Spare"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default SpareForm;