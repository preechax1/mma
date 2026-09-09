import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Check, AlertCircle, Package, Tag, Hash, DollarSign, FileText } from "lucide-react";
import { getModelById, updateUserSpare } from "../services/WithdrawalService";
import { useAuth } from "../context/AuthContext";
import styles from "./Withdrawal.module.css";

const Withdrawal = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);
    const [success, setSuccess] = useState(false);

    // New state for withdrawal quantity
    const [withdrawQty, setWithdrawQty] = useState(1);
    // New state for 'Use for' (purpose) field
    const [useFor, setUseFor] = useState("");

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        getModelById(id)
            .then((data) => {
                if (!isMounted) return;
                setModel(data);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error("Error loading model details:", err);
                setError("Could not find the model you're looking for.");
            })
            .finally(() => {
                if (!isMounted) return;
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (withdrawQty <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (!useFor || !useFor.trim()) {
            alert("Please enter the purpose in 'Use for' field.");
            return;
        }

        if (model.onhand !== undefined && withdrawQty > model.onhand) {
            alert("Withdrawal quantity exceeds available stock.");
            return;
        }

        setWithdrawing(true);
        try {
            const fd = new FormData();
            fd.append("WithdrawQuantity", withdrawQty);
            fd.append("OnHand", model.onhand - withdrawQty);
            fd.append("action", "withdraw");

            // include use-for/purpose
            fd.append("UseFor", useFor);

            if (user && user.memberID) {
                fd.append("memberID", user.memberID);
            }

            // We send other required fields so the update doesn't clear them out
            fd.append("Category", model.category || "");
            fd.append("Model", model.model || "");
            if (model.part_number) fd.append("part_number", model.part_number);
            if (model.minimum_stock) fd.append("Required", model.minimum_stock);
            if (model.storage) fd.append("storage", model.storage);
            if (model.spare_type) fd.append("spare_type", model.spare_type);

            const response = await updateUserSpare(id, fd);

            if (response && response.status === 1) {
                // Update local stock from backend response
                const newStock = response.detail?.remaining;
                if (newStock !== undefined) {
                    setModel(prev => ({ ...prev, onhand: newStock }));
                }
                setSuccess(true);
                setWithdrawQty(1); // Reset quantity
            } else {
                alert(response?.detail || "Failed to process withdrawal.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to process withdrawal.");
        } finally {
            setWithdrawing(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.flexCenter}>
                <div className={styles.loader}></div>
                <p>Loading model details...</p>
            </div>
        );
    }

    if (error || !model) {
        return (
            <div className={styles.flexCenter}>
                <div className={styles.errorMessage}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: "1.5rem" }} />
                    <h3>Model Not Found</h3>
                    <p>{error || "The requested model does not exist in our inventory."}</p>
                    <Link to="/store" className={styles.btnPrimary}>Return to Store</Link>
                </div>
            </div>
        );
    }

    const isLowStock = model.onhand !== undefined && model.onhand <= (model.minimum_stock || 5);

    return (
        <div className={styles.container}>
            <div className={styles.bgGlow}></div>

            <header className={styles.pageHeader}>
                <Link to="/store" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Store
                </Link>
                <h2>Spare Withdrawal</h2>
                <p>Enter the quantity to withdraw from the inventory.</p>
            </header>

            <div className={styles.contentWrapper}>
                <form onSubmit={handleWithdraw} style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>

                    <div className={styles.imageSection}>
                        <div className={styles.imageWrapper}>
                            <img
                                src={model.image || "/no-image.png"}
                                alt={model.name || model.model}
                            />
                        </div>
                        <div className={`${styles.stockBadge} ${isLowStock ? styles.lowStock : ''}`}>
                            <Package size={20} />
                            {model.onhand !== undefined ? `Stock: ${model.onhand}` : 'N/A'}
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label><Tag size={14} /> Category</label>
                                <input value={model.category || "Uncategorized"} readOnly className={styles.readOnlyInput} />
                            </div>

                            <div className={styles.formGroup}>
                                <label><Package size={14} /> Type</label>
                                <input value={model.spare_type || model.model || "N/A"} readOnly className={styles.readOnlyInput} />
                            </div>

                            <div className={`${styles.formGroup} ${styles.full}`}>
                                <label><FileText size={14} />Model / Name</label>
                                <input value={model.model} readOnly className={styles.readOnlyInput} />
                            </div>

                            <div className={styles.formGroup}>
                                <label><Hash size={14} /> Part Number</label>
                                <input value={model.part_number || "N/A"} readOnly className={styles.readOnlyInput} />
                            </div>

                            <div className={styles.formGroup}>
                                <label><FileText size={14} /> Purchasing</label>
                                <input value={model.purchasing || "N/A"} readOnly className={styles.readOnlyInput} />
                            </div>

                            <div className={`${styles.formGroup} ${styles.full}`}>
                                <label><FileText size={14} /> Description</label>
                                <textarea value={model.description || "No description available."} readOnly className={styles.readOnlyTextarea} />
                            </div>

                             <div className={styles.formGroup}>
                                <label><Hash size={14} /> Storage Location</label>
                                <input value={model.storage || "N/A"} readOnly className={styles.readOnlyInput} />
                            </div>

                            <div className={styles.formGroup}>
                                <label><FileText size={14} /> Use for</label>
                                <input
                                    type="text"
                                    placeholder="Enter purpose of withdrawal"
                                    value={useFor}
                                    onChange={(e) => setUseFor(e.target.value)}
                                    disabled={success || withdrawing}
                                    className={styles.textInput}
                                />
                            </div>
                           
                        </div>

                        <hr className={styles.divider} />

                        <div className={styles.withdrawalSection}>
                            <label className={styles.highlightLabel}>Quantity to Withdraw</label>

                            <div className={styles.qtyWrapper}>
                                <input
                                    type="number"
                                    min="1"
                                    max={model.onhand}
                                    value={withdrawQty}
                                    onChange={(e) => setWithdrawQty(parseInt(e.target.value) || 0)}
                                    disabled={success || withdrawing}
                                    className={styles.qtyInput}
                                    autoFocus
                                />

                                {!success ? (
                                    <button
                                        type="submit"
                                        className={`${styles.submitBtn} ${withdrawing ? styles.loading : ''}`}
                                        disabled={withdrawing || model.onhand === 0 || !useFor.trim() || withdrawQty <= 0}
                                    >
                                        <ShoppingCart size={20} />
                                        {withdrawing ? 'Processing...' : 'Confirm'}
                                    </button>
                                ) : (
                                    <div className={styles.successBanner}>
                                        <Check size={20} />
                                        <span>Success!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Withdrawal;