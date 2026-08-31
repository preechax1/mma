import { useEffect, useState } from "react";
import {
    getGroupName,
    getPhases,
    getProducts,
    getModels
} from "../../services/RecordsService";

export default function RecordsChois({ onFilterChange }) {
    // สถานะสำหรับเก็บรายการที่จะเอาไปใส่ในตู้ Selectbox
    const [groupNames, setGroupNames] = useState([]);
    const [phases, setPhases] = useState([]);
    const [products, setProducts] = useState([]);
    const [models, setModels] = useState([]);

    // สถานะสำหรับเก็บค่าปัจจุบันที่ผู้ใช้เลือก
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedPhase, setSelectedPhase] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedModel, setSelectedModel] = useState("");

    // ดึงข้อมูลทางเลือกทั้งหมดเมื่อโหลดหน้าครั้งแรก
    useEffect(() => {
        const fetchChoices = async () => {
            try {
                // ดึงข้อมูลขนานกันเพื่อความรวดเร็วด้วย Promise.all
                const [resGroup, resPhase, resProduct, resModel] = await Promise.all([
                    getGroupName(),
                    getPhases(),
                    getProducts(),
                    getModels()
                ]);

                setGroupNames(Array.isArray(resGroup) ? resGroup : []);
                setPhases(Array.isArray(resPhase) ? resPhase : []);
                setProducts(Array.isArray(resProduct) ? resProduct : []);
                setModels(Array.isArray(resModel) ? resModel : []);
            } catch (error) {
                console.error("Failed to load select choices:", error);
            }
        };

        fetchChoices();
    }, []);

    // ฟังก์ชันช่วยจัดการเมื่อเกิดการเลือกค่า
    const handleChange = (type, value, setSelector) => {
        setSelector(value);
        if (onFilterChange) {
            onFilterChange(type, value);
        }
    };

    // หมายเหตุ: คลาส CSS ด้านล่างนี้ใช้เป็นมาตรฐาน ถ้าใช้ Tailwind หรือมี CSS Module อยู่แล้วสามารถปรับสไตล์ได้ตามใจชอบครับ
    const selectStyle = {
        padding: "8px 12px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        backgroundColor: "#fff",
        minWidth: "160px",
        fontSize: "14px"
    };

    const containerStyle = {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "center",
        padding: "15px",
        background: "#f8f9fa",
        borderRadius: "6px",
        border: "1px solid #e9ecef"
    };

    return (
        <div style={containerStyle}>
            {/* Group Name Selectbox */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#495057" }}>Group Name</label>
                <select 
                    value={selectedGroup} 
                    onChange={(e) => handleChange("groupName", e.target.value, setSelectedGroup)}
                    style={selectStyle}
                >
                    <option value="">-- All Groups --</option>
                    {groupNames.map((item, index) => (
                        <option key={index} value={item.group_name}>{item.group_name}</option>
                    ))}
                </select>
            </div>

            {/* Phase Selectbox */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#495057" }}>Phase</label>
                <select 
                    value={selectedPhase} 
                    onChange={(e) => handleChange("phase", e.target.value, setSelectedPhase)}
                    style={selectStyle}
                >
                    <option value="">-- All Phases --</option>
                    {phases.map((item, index) => (
                        <option key={index} value={item.phase}>{item.phase}</option>
                    ))}
                </select>
            </div>

            {/* Product Selectbox */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#495057" }}>Product</label>
                <select 
                    value={selectedProduct} 
                    onChange={(e) => handleChange("product", e.target.value, setSelectedProduct)}
                    style={selectStyle}
                >
                    <option value="">-- All Products --</option>
                    {products.map((item, index) => (
                        <option key={index} value={item.product}>{item.product}</option>
                    ))}
                </select>
            </div>

            {/* Model Selectbox */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#495057" }}>Model</label>
                <select 
                    value={selectedModel} 
                    onChange={(e) => handleChange("model", e.target.value, setSelectedModel)}
                    style={selectStyle}
                >
                    <option value="">-- All Models --</option>
                    {models.map((item, index) => (
                        <option key={index} value={item.model}>{item.model}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}