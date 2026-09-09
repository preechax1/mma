import React, { useState } from "react";
import { Download, Package, Layers, Hash, PlusSquare, Paperclip, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ReceiveSpareForm.module.css";

const ReceiveSpareForm = ({ spare, onSave, onCancel }) => {
    const [quantity, setQuantity] = useState("");
    const [orderHeader, setOrderHeader] = useState("");
    const [attachments, setAttachments] = useState(null);
    const { user } = useAuth();

    const category = spare?.category || "";
    const model = spare?.model || "";
    const currentOnHand = Number(spare?.onhand || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
            alert("Please enter a valid receive quantity.");
            return;
        }

        const fd = new FormData();
        fd.append("ReceiveQuantity", quantity);
        fd.append("order_header", orderHeader);
        fd.append("onhand", currentOnHand + Number(quantity));
        fd.append("category", category);
        fd.append("model", model);

        if (spare?.part_number) { fd.append("part_number", spare.part_number); }
        if (spare?.minimum_stock) { fd.append("minimum_stock", spare.minimum_stock); }
        if (spare?.storage) { fd.append("storage", spare.storage); }
        if (spare?.spare_type) { fd.append("spare_type", spare.spare_type); }
        if (user && user.memberID) { fd.append("memberID", user.memberID); }

        if (attachments && attachments.length > 0) {
            Array.from(attachments).forEach((file) => { fd.append("attachments[]", file); });
        }
        fd.append("action", "receive");
        fd.append("order_header", orderHeader);

        onSave(fd);
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <Download size={24} />
                </div>
                <h2>Receive Spare Part</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label><Layers size={14} /> Category</label>
                        <input value={category} disabled className={styles.readOnlyInput} />
                    </div>

                    <div className={styles.formGroup}>
                        <label><Package size={14} /> Model</label>
                        <input value={model} disabled className={styles.readOnlyInput} />
                    </div>

                    <div className={styles.formGroup}>
                        <label><Hash size={14} /> Current On Hand</label>
                        <input value={currentOnHand} disabled className={styles.readOnlyInput} />
                    </div>

                    <div className={styles.formGroup}>
                        <label><Hash size={14} /> Receive Type</label>
                        <select
                            value={orderHeader}
                            onChange={(e) => setOrderHeader(e.target.value)}
                            required
                            className={styles.selectField}
                        >
                            <option value="">Select receive type</option>
                            <option value="HanaPO">HanaPO</option>
                            <option value="HanaStore">HanaStore</option>
                            <option value="CustomerPO">CustomerPO</option>
                            <option value="CustomerGive">CustomerGive</option>
                            <option value="KnockDown">KnockDown</option>
                        </select>
                    </div>
                    

                    <div className={styles.formGroup}>
                        <label>
                            <PlusSquare size={14} /> Receive Quantity 
                            <span className={styles.requiredMark}>*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            autoFocus
                            className={`${styles.inputField} ${styles.receiveQuantityInput}`}
                            placeholder="Enter quantity to receive"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label><Paperclip size={14} /> Attachment Documents (Optional)</label>
                        <div className={styles.fileInputWrapper}>
                            <div className={styles.filePlaceholder}>
                                <Paperclip size={18} />
                                {attachments && attachments.length > 0 
                                    ? <span>Files selected</span>
                                    : <span>Click or drag files here</span>
                                }
                                {attachments && attachments.length > 0 && (
                                    <span className={styles.fileCount}>{attachments.length} files</span>
                                )}
                            </div>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setAttachments(e.target.files);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onCancel}>
                        <X size={18} />
                        Cancel
                    </button>
                    <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
                        <Download size={18} />
                        Confirm Receive
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReceiveSpareForm;
