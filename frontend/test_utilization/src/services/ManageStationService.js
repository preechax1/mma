// const base = "http://localhost/OP3_MMA/api/test_utilization/ManageStation.php";

import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/ManageStation`;

// ดึงรายการทั้งหมด
export const getStatusStationList = async () => {
  const res = await fetch(`${base}/stationstatus`);
  return res.json();
};

// ดึงรายตัว (ส่ง ID ต่อท้าย URL)
export const getStatusStationID = async (id) => {
  const res = await fetch(`${base}/stationstatus/${id}`);
  return res.json();
};

// อัปเดตข้อมูล (ส่ง JSON ไปที่ /update_status)
export const postStatusStationID = async (id, status) => {
  const res = await fetch(`${base}/update_status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      id: id, 
      status: status 
    })
  });
  return res.json();
};