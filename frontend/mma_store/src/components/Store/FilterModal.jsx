import React from "react";
import ReactDOM from "react-dom";
import { SlidersHorizontal, X, RotateCcw, Check } from "lucide-react"; // Import Icons
import styles from "./FilterModal.module.css";

const FilterModal = ({
    show,
    onClose,
    categories,
    selectedCategories,
    selectedModels,
    setSelectedCategories,
    setSelectedModels,
    models,
}) => {
    if (!show) return null;

    const toggleCategory = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(
                selectedCategories.filter((c) => c !== category)
            );
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const toggleModel = (model) => {
        if (selectedModels.includes(model)) {
            setSelectedModels(selectedModels.filter((m) => m !== model));
        } else {
            setSelectedModels([...selectedModels, model]);
        }
    };

    const countModels = (key, value) =>
        models.filter((m) => m[key] === value).length;

    return ReactDOM.createPortal(
        <div className={styles.overlay}>

            <div className={styles.backdrop} onClick={onClose} />

            <div className={styles.panel}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <div className={styles.headerIcon}>
                            <SlidersHorizontal size={20} />
                        </div>
                        <h2>Filters</h2>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* ส่วนของ Content ใน FilterModal.jsx */}
                <div className={styles.content}>
                    {categories.map((cat, index) => (
                        <div key={index} className={styles.filterGroup}>
                            <div className={styles.categoryHeader}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkboxInput}
                                        checked={selectedCategories.includes(cat.name)}
                                        onChange={() => toggleCategory(cat.name)}
                                    />
                                    <span className={styles.labelText}>{cat.name}</span>
                                    <span className={styles.itemCount}>{countModels("category", cat.name)}</span>
                                </label>
                            </div>

                            {cat.models && cat.models.length > 0 && (
                                <div className={styles.modelList}>
                                    {cat.models.map((model, i) => (
                                        <label key={i} className={styles.modelItem}>
                                            <input
                                                type="checkbox"
                                                className={styles.checkboxInput}
                                                checked={selectedModels.includes(model)}
                                                onChange={() => toggleModel(model)}
                                            />
                                            <span className={styles.modelLabelText}>{model}</span>
                                            <span className={styles.itemCount}>{countModels("model", model)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className={styles.footer}>
                    <button
                        className={`${styles.btn} ${styles.clearBtn}`}
                        onClick={() => {
                            setSelectedCategories([]);
                            setSelectedModels([]);
                        }}
                    >
                        <RotateCcw size={16} />
                        Clear All
                    </button>

                    <button className={`${styles.btn} ${styles.applyBtn}`} onClick={onClose}>
                        <Check size={16} />
                        Apply Filters
                    </button>
                </div>
            </div>

        </div>,
        document.body
    );
};

export default FilterModal;