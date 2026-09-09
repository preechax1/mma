import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Package, MapPin } from "lucide-react";
import styles from "./ModelCard.module.css";

const ModelCard = ({ model }) => {
    const navigate = useNavigate();
    const onHandValue = model.onhand ? Number(model.onhand) : 0;
    const isOutOfStock = onHandValue <= 0;
    const isLowStock = onHandValue > 0 && onHandValue <= 3;

    const stockClass = isOutOfStock ? styles.stockZero : isLowStock ? styles.stockLow : styles.stockGood;
    const dotClass = isOutOfStock ? styles.stockDotZero : isLowStock ? styles.stockDotLow : styles.stockDotGood;
    const stockLabel = isOutOfStock ? "Out of Stock" : `${onHandValue} pcs`;

    return (
        <div className={styles.card}>
            {/* Image */}
            <div className={styles.imageContainer}>
                <img
                    src={model.image || "/no-image.png"}
                    alt={model.model}
                    className={styles.cardImage}
                />
                <div className={styles.badge}>
                    {model.category?.trim() || "Uncategorized"}
                </div>
                <div className={`${styles.stockDot} ${dotClass}`} title={stockLabel} />
            </div>

            {/* Content */}
            <div className={styles.content}>
                <h3 className={styles.cardTitle}>
                    <a
                        href={`/withdrawal/${model.id}`}
                        className={styles.cardLink}
                        onClick={(e) => { e.preventDefault(); navigate(`/withdrawal/${model.id}`); }}
                    >
                        {model.model || "Unknown"}
                    </a>
                </h3>

                <div className={styles.metaRow}>
                    <div className={`${styles.stockInfo} ${stockClass}`}>
                        <Package size={13} />
                        <span>{stockLabel}</span>
                    </div>
                </div>

                <div className={styles.storageInfo}>
                    <MapPin size={13} />
                    <span className={styles.storageText}>
                        {model.storage || "Storage: Unknown"}
                    </span>
                </div>

                <div className={styles.actions}>
                    <button
                        className={`${styles.btnPrimary} ${isOutOfStock ? styles.btnDisabled : ""}`}
                        onClick={() => !isOutOfStock && navigate(`/withdrawal/${model.id}`)}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? "Out of stock" : "Withdraw this part"}
                    >
                        <ShoppingCart size={16} />
                        {isOutOfStock ? "Out of Stock" : "Withdraw"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModelCard;
