import { useEffect, useState } from "react";

import {
    getSpareList,
    createSpare,
    updateSpare,
    deleteSpare,
    receiveSpare
} from "../services/SpareService";

export const useSpare = () => {

    const [spares, setSpares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ================= LOAD DATA ================= */

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSpareList();
            setSpares(data);
        } catch (err) {
            console.error("Failed to load spares:", err);
            setError(err.response?.data?.detail || err.message || "Failed to load spares");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);

    /* ================= ADD ================= */

    const add = async (data) => {
        const res = await createSpare(data);
        await loadData();
        return res;
    };

    /* ================= UPDATE ================= */

    const update = async (id, data) => {
        const res = await updateSpare(id, data);
        await loadData();
        return res;
    };

    /* ================= RECEIVE ================= */

    const receive = async (id, data) => {
        const res = await receiveSpare(id, data);
        await loadData();
        return res;
    };


    /* ================= DELETE ================= */

    const remove = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this spare?"
        );
        if (!confirmDelete) return;

        try {
            await deleteSpare(id);
            setSpares((prev) =>
                prev.filter((item) => (item.id) !== id)
            );
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete spare");
        }
    };

    return {
        spares,
        loading,
        error,
        add,
        update,
        receive,
        remove
    };

};