import { useEffect, useState, useCallback, useMemo } from "react";

import StatusTab    from "../components/dashboard/StatusTab";
import StatusBar    from "../components/dashboard/StatusBar";
import StatusGroup  from "../components/dashboard/StatusGroup";

import { getStatusFec, getStatusGroupFec } from "../services/dashboardService";

import "./Dashboard.dodule.css";

export default function Dashboard() {
  console.log("Dashboard component mounted");
  const [statusFec, setStatusFec] = useState([]);
  const [statusGroup, setStatusGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. เตรียมข้อมูลสำหรับ Tab Status และ กราฟแท่ง (Overall) ---
  const overallData = useMemo(
    () =>
      statusFec.map((item) => ({
        name: item.status,
        value: Number(item.total),
      })),
    [statusFec],
  );

  // --- 2. เตรียมข้อมูลสำหรับ กราฟวงกลมแยกตามกลุ่ม (Pie Charts) ---
  const factories = useMemo(
    () => statusGroup.map((group) => ({ name: group.group })),
    [statusGroup],
  );

  const factoryData = useMemo(
    () =>
      statusGroup.reduce((acc, group) => {
        // แปลง items ในแต่ละ group ให้เป็น format ที่ Pie Chart เข้าใจ
        acc[group.group] = group.items.map((item) => ({
          name: item.status,
          value: Number(item.total),
        }));
        return acc;
      }, {}),
    [statusGroup],
  );

 

  // Load API
  const loadStatus = useCallback(async (isSilent = false) => {
    console.log("loadStatus called, isSilent:", isSilent);
    try {
      if (!isSilent) setLoading(true);
      setError(null);

      const [status, statusGroupData] = await Promise.all([
        getStatusFec(),
        getStatusGroupFec(),
      ]);

      console.log(
        "API responses - status:",
        status,
        "statusGroupData:",
        statusGroupData,
      );

      setStatusFec(status || []);
      setStatusGroup(statusGroupData || []);
    } catch (err) {
      console.error("loadStatus error:", err);
      setError("ไม่สามารถดึงข้อมูล Dashboard ได้ กรุณาลองใหม่อีกครั้ง");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(() => loadStatus(true), 30000); // Auto-refresh ทุก 30 วินาที
    return () => clearInterval(interval);
  }, [loadStatus]);

  if (loading) {
    console.log("Showing loading screen");
    return <div className="loading-screen">กำลังโหลดข้อมูล...</div>;
  }

  console.log(
    "Rendering dashboard content, statusFec:",
    statusFec,
    "statusGroup:",
    statusGroup,
  );

  return (
    <div className="dashboard-container">

      {error && <div className="error-banner">{error}</div>}

      {!error && (
        <>
          {/* ส่วนที่ 1: Tab Status (Cards) */}
          <section className="status-section">
            <StatusTab statusData={statusFec} />
          </section>

          {/* ส่วนที่ 2: กราฟแท่งแสดงภาพรวมทั้งหมด */}
          <section className="overall-chart-section">
            <div className="card-wrapper">
              <h3>Overall Production Status</h3>
              <StatusBar data={overallData} />
            </div>
          </section>

          {/* ส่วนที่ 3: กราฟวงกลมแยกตามกลุ่มผลิตภัณฑ์ */}
          {statusGroup.length > 0 && (
            <section className="factory-section">
              <div className="section-title">
                <h2>Product Status Breakdown by Group</h2>
              </div>
              {/* ส่ง factories (รายชื่อกลุ่ม) และ factoryData (ข้อมูลกราฟวงกลม) */}
              <StatusGroup factories={factories} factoryData={factoryData} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
