// const base = "http://localhost/OP3_MMA/api/test_utilization/StationDetailForm.php";


import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/StationDetailForm`;

export const getDetailForm = async (id) => {
    // URL: .../StationDetailForm.php/stationstatus/101
    const res = await fetch(`${base}/stationstatus/${id}`);
    return res.json();
};

export const postDetailForm = async (data) => {
    // URL: .../StationDetailForm.php/stationupdate
    // data คือ FormData ที่มี stationID, status, ไฟล์ ฯลฯ
    const res = await fetch(`${base}/stationupdate`, { 
        method: "POST",
        body: data,
    });
    return res.json();
};

export const getFailurePareto = async () => {
    const res = await fetch(`${base}/FailurePareto`);
    return res.json();
};

export const getTopDowntime = async () => {
    const res = await fetch(`${base}/TopDowntime`);
    return res.json();
};

export const getTableStation = async () => {
    const res = await fetch(`${base}/table_station`);
    return res.json();
};