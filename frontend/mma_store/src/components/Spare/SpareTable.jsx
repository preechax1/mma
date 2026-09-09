import React, { useState, useMemo } from "react";
import Modal from "../ui/Modal";
import ReceiveSpareForm from "./ReceiveSpareForm";
import { Pencil, Trash2, PackagePlus } from "lucide-react";
import styles from "./SpareTable.module.css";

const ImageThumbnail = ({ src, alt, onClick }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
        return (
            <div className={styles.imagePlaceholder} onClick={onClick} role="button" tabIndex={0}>
                <span>No image</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            width="46"
            height="46"
            loading="lazy"
            decoding="async"
            className={`${styles.tableImg} ${styles.clickable}`}
            onClick={onClick}
            onError={() => setHasError(true)}
        />
    );
};

const SpareTable = ({ spares = [], onEdit, onDelete, onReceive }) => {
    const [receiveModalOpen, setReceiveModalOpen] = useState(false);
    const [selectedSpareToReceive, setSelectedSpareToReceive] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [filters, setFilters] = useState({
        id: "",
        category: "",
        model: "",
        description: "",
        for_product: "",
        part_number: "",
        storage: "",
        status: ""
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const filteredSpares = useMemo(() => {
        return spares.filter((item) => {
            const sid = (item.id || "").toString();
            const cat = (item.category || "").toLowerCase();
            const mod = (item.model || "").toLowerCase();
            const desc = (item.description || "").toLowerCase();
            const fp = (item.for_product || "").toLowerCase();
            const pn = (item.part_number || "").toLowerCase();
            const storage = (item.storage || "").toLowerCase();
            const status = item.onhand && item.minimum_stock
                ? (Number(item.onhand) < Number(item.minimum_stock) ? "low stock" : "ok")
                : (item.status || "").toLowerCase();

            return (
                sid.includes(filters.id) &&
                cat.includes(filters.category.toLowerCase()) &&
                mod.includes(filters.model.toLowerCase()) &&
                desc.includes(filters.description.toLowerCase()) &&
                fp.includes(filters.for_product.toLowerCase()) &&
                pn.includes(filters.part_number.toLowerCase()) &&
                storage.includes(filters.storage.toLowerCase()) &&
                status.includes(filters.status.toLowerCase())
            );
        });
    }, [spares, filters]);

    return (
        <div className={styles.card}>
            <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                    <thead>
                        {/* แถวที่ 1: หัวตารางหลัก */}
                        <tr>
                            <th>Image</th>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Model</th>
                            <th>Description</th>
                            <th>For Product</th>
                            {/* <th>Part Number</th> */}
                            <th>OnHand</th>
                            <th>Min Stock</th>
                            <th>Storage</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        {/* แถวที่ 2: แถว Filter (แยก tr ออกมา ไม่ซ้อนกัน) */}
                        <tr className={styles.filterRow}>
                            <th></th>
                            <th>
                                <input
                                    name="id"
                                    placeholder="ID"
                                    value={filters.id}
                                    onChange={handleFilterChange}
                                />
                            </th>
                            <th>
                                <input
                                    name="category"
                                    placeholder="Category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                />
                            </th>
                            <th>
                                <input
                                    name="model"
                                    placeholder="Model"
                                    value={filters.model}
                                    onChange={handleFilterChange}
                                />
                            </th>
                            <th>
                                <input
                                    name="description"
                                    placeholder="Description"
                                    value={filters.description}
                                    onChange={handleFilterChange}
                                />
                            </th>
                            <th>
                                <input
                                    name="for_product"
                                    placeholder="For Product"
                                    value={filters.for_product}
                                    onChange={handleFilterChange}
                                />
                            </th>
                            <th></th>
                            <th></th>
                            <th>
                                <input
                                    name="storage"
                                    placeholder="Storage"
                                    value={filters.storage}
                                    onChange={handleFilterChange}
                                />
                            </th>
                            <th>
                                <input
                                    name="status"
                                    placeholder="Status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                />
                            </th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredSpares.map((item) => {
                            const lowStock = Number(item.onhand) < Number(item.minimum_stock);
                            return (
                                <tr key={item.id}>
                                    <td className={styles.imageCell}>
                                        <div className={styles.imageWrapper}>
                                            <ImageThumbnail
                                                src={item.image}
                                                alt={item.model}
                                                onClick={() => setPreviewImage(item.image)}
                                            />
                                        </div>
                                    </td>
                                    <td>{item.id}</td>
                                    <td>{item.category}</td>
                                    <td>{item.model}</td>
                                    <td className={styles.descriptionCell}>{item.description}</td>
                                    <td>{item.for_product}</td>
                                    {/* <td>{item.part_number}</td> */}
                                    <td>{item.onhand}</td>
                                    <td>{item.minimum_stock}</td>
                                    <td>{item.storage}</td>
                                    <td>
                                        <span className={`${styles.badge} ${lowStock ? styles.badgeLow : styles.badgeOk}`}>
                                            {lowStock ? "LOW STOCK" : "OK"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={`${styles.btn} ${styles.btnEdit}`}
                                                onClick={() => onEdit(item)}
                                                title="Edit"
                                            ><Pencil size={25} /></button>
                                            {/* <button
                                                className={`${styles.btn} ${styles.btnDelete}`}
                                                onClick={() => onDelete(item.id)}
                                                title="Delete"
                                            ><Trash2 size={14} /></button> */}
                                            <button
                                                className={`${styles.btn} ${styles.btnReceive}`}
                                                onClick={() => {
                                                    setSelectedSpareToReceive(item);
                                                    setReceiveModalOpen(true);
                                                }}
                                                title="Receive stock"
                                            ><PackagePlus size={25} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <ImagePreviewModal
                image={previewImage}
                onClose={() => setPreviewImage(null)}
            />

            <Modal
                open={receiveModalOpen}
                onClose={() => setReceiveModalOpen(false)}
                title="Receive Spare"
            >
                <ReceiveSpareForm
                    spare={selectedSpareToReceive}
                    onSave={(data) => {
                        onReceive(selectedSpareToReceive.id, data);
                        setReceiveModalOpen(false);
                    }}
                    onCancel={() => setReceiveModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

// Sub-component สำหรับโชว์รูปใหญ่
const ImagePreviewModal = ({ image, onClose }) => (
    <Modal open={!!image} onClose={onClose} title="Image Preview">
        <div className={styles.modalImageContainer}>
            <img src={image} alt="Preview" className={styles.previewImgFull} />
        </div>
    </Modal>
);

export default SpareTable;