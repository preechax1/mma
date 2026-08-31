import { useEffect, useState, useCallback, useMemo } from "react";
// นำเข้าคอมโพเนนต์ต่างๆ (สมมติชื่อคอมโพเนนต์ตาราง Model และกลุ่มตามที่คุณมีหรือจะสร้างเพิ่ม)
import YieldChart from "../components/dashboard/YieldChart"; 
import GroupYieldPie from "../components/dashboard/GroupYieldPie"; // คอมโพเนนต์สำหรับกลุ่ม (ถ้ามี)
import ModelYieldTable from "../components/dashboard/ModelYieldTable"; // คอมโพเนนต์ตาราง Model

// เรียก API Service (อย่าลืมไปเพิ่มฟังก์ชันใน dashboardService.js ด้วยนะครับ)
import { getAllyield, getGroupYield, getModelYield } from "../services/dashboardService";

import "./Dashboard.module.css";

export default function Dashboard() {
  const [trendData, setTrendData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load API ทั้งหมดพร้อมกัน
  const loadStatus = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);

      const [trendRes, groupRes, modelRes] = await Promise.all([
        getAllyield(),
        getGroupYield(),
        getModelYield()
      ]);

      const trendPayload = trendRes?.data?.trends ?? [];
      const groupPayload = groupRes?.data?.groups ?? [];
      const modelPayload = modelRes?.data?.models ?? [];

      setTrendData(
        trendPayload.map((item) => ({
          ...item,
          input: Number(item.input ?? 0),
          output: Number(item.output ?? 0),
          yield_pct: Number(item.yield_pct ?? 0),
          target_pct: Number(item.target_pct ?? 95)
        }))
      );
      setGroupData(groupPayload);
      setModelData(modelPayload);

    } catch (err) {
      console.error("Load Dashboard error:", err);
      setError("ไม่สามารถดึงข้อมูล Dashboard ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredModelData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return modelData;

    return modelData.filter((item) =>
      [item.phase, item.product, item.group_name, item.model, item.test_function]
        .some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [modelData, searchTerm]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (loading) {
    return <div className="loading-screen">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="dashboard-container">
      {error && <div className="error-banner">{error}</div>}

      {!error && (
        <>
          {/* ส่วนที่ 1: กราฟแท่งผสมเส้น (ภาพรวม/แนวโน้ม) */}
          <section className="overall-chart-section">
            <div className="card-wrapper">
              <YieldChart data={trendData} /> 
            </div>
          </section>

          {/* ส่วนที่ 2: กราฟแท่งแสดงข้อมูลแยกตามกลุ่มผลิตภัณฑ์ (สัปดาห์ที่แล้ว) */}
          <section className="factory-section">
            <div className="section-title">
              <h2>Product Status Breakdown by Group (Last Week)</h2>
            </div>
            <GroupYieldPie data={groupData} />
          </section>

          {/* ส่วนที่ 3: ตารางรายละเอียดเจาะลึกแต่ละ Model พร้อมฟิลเตอร์ค้นหา */}
          <section className="model-table-section" style={{ background: 'rgba(15, 23, 42, 0.96)', borderRadius: '24px', padding: '20px' }}>
            <div className="section-title">
              <h2>Model Performance Detail (Last Week)</h2>
            </div>
            <ModelYieldTable
              models={filteredModelData}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              totalCount={modelData.length}
            />
          </section>
        </>
      )}
    </div>
  );
}