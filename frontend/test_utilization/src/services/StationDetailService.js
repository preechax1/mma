// const base = "http://localhost/OP3_MMA/api/test_utilization/station_detail.php";


import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/station_detail`;

export const getStatusStation = async () => {
    const res = await fetch(`${base}/status_station`);
    const result = await res.json();
    return result.data;
};

export const getFailurePareto = async () => {
    const res = await fetch(`${base}/FailurePareto`);
    const result = await res.json();
    return result.data;
};

export const getTopDowntime = async () => {
    const res = await fetch(`${base}/TopDowntime`);
    const result = await res.json();
    return result.data;
};

export const getTableStation = async () => {
    const res = await fetch(`${base}/table_station`);
    const result = await res.json();
    return result.data;
};